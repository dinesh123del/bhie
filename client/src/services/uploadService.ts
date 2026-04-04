import api from '../lib/axios';

export type UploadedFileType = 'image' | 'pdf' | 'docx' | 'zip';

export interface UploadedImageRecord {
  file?: {
    id: string;
    fileType: UploadedFileType;
    originalName: string;
    archiveName: string | null;
    fileUrl: string;
    mimeType: string;
    createdAt: string;
  };
  image: {
    id: string;
    imageUrl: string;
    extractedText: string;
    detectedType: 'income' | 'expense' | 'unknown';
    category: string;
    amount?: number;
    createdAt: string;
  } | null;
  record: {
    id: string;
    type: 'income' | 'expense';
    amount: number;
    category: string;
    date: string;
    title: string;
  };
  extracted: {
    rawText?: string;
    extractedText?: string;
    amount: number;
    type: 'income' | 'expense' | 'unknown';
    category: string;
    date: string;
    amountMatch?: string | null;
  };
}

export interface UploadResponse {
  message: string;
  count: number;
  items: UploadedImageRecord[];
}

export const uploadService = {
  uploadFiles: async (files: File[]): Promise<UploadResponse> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const response = await api.post<UploadResponse>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  },

  uploadImages: async (files: File[]): Promise<UploadResponse> => {
    return uploadService.uploadFiles(files);
  },

  uploadFile: async (file: File): Promise<UploadedImageRecord> => {
    const response = await uploadService.uploadFiles([file]);
    return response.items[0];
  },

  getUserUploads: async () => {
    const response = await api.get('/upload/uploads');
    return response.data;
  },
};
