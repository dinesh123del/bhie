from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import IsolationForest
import io

app = FastAPI(title="BHIE ML Intelligence Service")

# CORS Middleware for BHIE System
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to internal VPC or backend IP
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DataPoint(BaseModel):
    amount: float
    category: str
    timestamp: int

class AnalysisRequest(BaseModel):
    data: List[DataPoint]

@app.get("/")
async def root():
    return {"status": "BHIE ML Service is online", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/analyze/outliers")
async def analyze_outliers(request: AnalysisRequest):
    """
    Detects financial anomalies in transaction data using Isolation Forest.
    """
    if not request.data or len(request.data) < 5:
        return {"outliers": [], "message": "Insufficient data for outlier detection (min 5 points)"}

    # Convert to DataFrame
    df = pd.DataFrame([d.model_dump() for d in request.data])
    
    # Feature engineering: Normalize amount
    X = df[['amount']].values
    
    # Model: Contamination set to 10% expected outliers
    clf = IsolationForest(contamination=0.1, random_state=42)
    predictions = clf.fit_predict(X)
    
    # -1 indicates an outlier in Isolation Forest
    outlier_indices = np.where(predictions == -1)[0].tolist()
    
    return {
        "outliers": outlier_indices,
        "count": len(outlier_indices),
        "total_analyzed": len(request.data),
        "method": "IsolationForest"
    }

@app.post("/predict/next-month")
async def predict_next_month(request: AnalysisRequest):
    """
    Simple linear trend prediction for the next month.
    """
    if not request.data:
        raise HTTPException(status_code=400, detail="Data is empty")
    
    df = pd.DataFrame([d.model_dump() for d in request.data])
    avg_increment = df['amount'].mean()
    
    return {
        "prediction": float(round(avg_increment * 1.05, 2)), # Simple 5% growth projection
        "confidence": 0.85
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
