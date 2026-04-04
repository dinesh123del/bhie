# Image Detection Feature TODO

## Steps to Complete:

### 1. ML Service Updates [X]
- Update ml-service/requirements.txt: Add tensorflow-cpu, pillow [DONE]
- Edit ml-service/main.py: Add /classify-image endpoint using MobileNetV2 for material/object classification [DONE]

### 2. Server Model & Types [ ]
- Edit server/src/models/Upload.ts: Extend ParsedData with imageClassification: {type: string, confidence: number, insights: string[]}


- Edit server/src/routes/upload.ts: For 'image' files, after OCR, POST image bytes to http://localhost:8000/classify-image, store results

### 4. Client Services [ ]
- Edit client/src/services/uploadService.ts: Add getImageAnalysis(uploadId): Promise<ImageAnalysis>

### 5. Frontend Upload Component [ ]
- Edit client/src/components/FileUpload.tsx: For images, poll /api/upload/analysis/{uploadId}, display classification + insights

### 6. Install & Test [ ]
- Install ml deps: cd ml-service && pip install -r requirements.txt
- Test ML endpoint, upload flow

### 7. Integration & Polish [ ]
- Add to DashboardPremium/AIAnalysisDashboard display
- UI improvements, error handling

**Progress: 0/7 steps complete**
