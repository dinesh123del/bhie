import api from '../lib/axios';
import {
  DetectedType,
  ImageIntelligenceRecord,
  Pagination,
  SearchResult,
} from '../types/imageIntelligence';

interface UploadResponse {
  message: string;
  count: number;
  files: ImageIntelligenceRecord[];
}

interface ListResponse {
  items: ImageIntelligenceRecord[];
  pagination: Pagination;
}

interface SearchResponse {
  query: string;
  count: number;
  results: SearchResult[];
}

interface SimilarityResponse {
  query: {
    name: string;
    mimeType: string;
    size: number;
  };
  results: Array<ImageIntelligenceRecord & { similarity: number }>;
}

interface ListParams {
  page?: number;
  limit?: number;
  type?: DetectedType | '';
  status?: 'queued' | 'processing' | 'completed' | 'failed' | '';
  dateFrom?: string;
  dateTo?: string;
}

interface SearchParams {
  q: string;
  limit?: number;
  type?: DetectedType | '';
  dateFrom?: string;
  dateTo?: string;
}

export const imageIntelligenceService = {
  async uploadImages(files: File[]): Promise<UploadResponse> {
    const optimizedFiles = await Promise.all(files.map((file) => compressImage(file)));

    const formData = new FormData();
    optimizedFiles.forEach((file) => formData.append('images', file, file.name));

    const response = await api.post<UploadResponse>('/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  },

  async listImages(params: ListParams = {}): Promise<ListResponse> {
    const response = await api.get<ListResponse>('/upload/images', {
      params,
    });

    return response.data;
  },

  async getImage(id: string): Promise<ImageIntelligenceRecord> {
    const response = await api.get<ImageIntelligenceRecord>(`/upload/images/${id}`);
    return response.data;
  },

  async getImageStatus(id: string): Promise<Pick<ImageIntelligenceRecord, 'id' | 'processingStatus' | 'processingError' | 'confidenceScore' | 'detectedType' | 'tags' | 'updatedAt'>> {
    const response = await api.get(`/upload/images/${id}/status`);
    return response.data;
  },

  async search(params: SearchParams): Promise<SearchResponse> {
    const response = await api.get<SearchResponse>('/search', {
      params,
    });
    return response.data;
  },

  async reverseSearch(file: File, limit = 10): Promise<SimilarityResponse> {
    const optimized = await compressImage(file);
    const formData = new FormData();
    formData.append('image', optimized, optimized.name);
    formData.append('limit', String(limit));

    const response = await api.post<SimilarityResponse>('/upload/images/similar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  },
};

async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) {
    return file;
  }

  const maxDimension = 1600;
  const quality = 0.82;

  const imageBitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(imageBitmap.width, imageBitmap.height));
  const width = Math.max(1, Math.round(imageBitmap.width * scale));
  const height = Math.max(1, Math.round(imageBitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    imageBitmap.close();
    return file;
  }

  ctx.drawImage(imageBitmap, 0, 0, width, height);
  imageBitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(
      (result) => resolve(result),
      'image/jpeg',
      quality
    );
  });

  if (!blob) {
    return file;
  }

  const normalizedName = file.name.replace(/\.[^.]+$/, '.jpg');
  return new File([blob], normalizedName, {
    type: 'image/jpeg',
    lastModified: Date.now(),
  });
}
