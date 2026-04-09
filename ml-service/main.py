from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.linear_model import LinearRegression
import cv2
import mediapipe as mp
import librosa
import base64
import io
from fastapi import File, UploadFile, Form
import time

app = FastAPI(title="Finly Core Intelligence Service", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────────────────────────────
# Data Models
# ──────────────────────────────────────────

class DataPoint(BaseModel):
    amount: float
    category: str
    timestamp: int

class AnalysisRequest(BaseModel):
    data: List[DataPoint]

class SimulationScenario(BaseModel):
    current_monthly_revenue: float
    current_monthly_expenses: float
    months_to_simulate: int = 24
    new_hires: int = 0
    avg_salary_per_hire: float = 50000
    loan_amount: float = 0
    loan_interest_rate: float = 12.0  # annual %
    revenue_growth_rate: float = 5.0  # monthly %
    expense_growth_rate: float = 2.0  # monthly %

class HealthScoreRequest(BaseModel):
    total_income: float
    total_expenses: float
    record_count: int
    months_active: int = 1
    anomaly_count: int = 0

class ResilienceRequest(BaseModel):
    industry: str
    region: str
    current_cash_reserve: float
    monthly_burn_rate: float
    is_global_exposure: bool = False

class MomentIntelligenceResponse(BaseModel):
    emotional_state: str
    presence_detected: bool
    audio_sentiment: str
    keywords: List[str]
    resilience_impact: float
    timestamp: float

# ──────────────────────────────────────────
# Health & Status
# ──────────────────────────────────────────

@app.get("/")
async def root():
    return {"status": "AERA Global Intelligence Engine v3.0", "version": "3.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy", "engine": "core-intelligence"}

# ──────────────────────────────────────────
# Anomaly Detection (Isolation Forest)
# ──────────────────────────────────────────

@app.post("/analyze/outliers")
async def analyze_outliers(request: AnalysisRequest):
    """Detect financial anomalies using Isolation Forest."""
    if not request.data or len(request.data) < 5:
        return {"outliers": [], "message": "Need 5+ data points", "count": 0, "total_analyzed": len(request.data) if request.data else 0}

    df = pd.DataFrame([d.model_dump() for d in request.data])
    X = df[['amount']].values

    clf = IsolationForest(contamination=0.1, random_state=42)
    predictions = clf.fit_predict(X)

    outlier_indices = np.where(predictions == -1)[0].tolist()

    return {
        "outliers": outlier_indices,
        "count": len(outlier_indices),
        "total_analyzed": len(request.data),
        "method": "IsolationForest",
    }

# ──────────────────────────────────────────
# Trend Prediction (Linear Regression)
# ──────────────────────────────────────────

@app.post("/predict/next-month")
async def predict_next_month(request: AnalysisRequest):
    """Predict next month's revenue/expense using Linear Regression."""
    if not request.data or len(request.data) < 3:
        raise HTTPException(status_code=400, detail="Need 3+ data points for prediction")

    df = pd.DataFrame([d.model_dump() for d in request.data])
    df = df.sort_values('timestamp')

    X = np.arange(len(df)).reshape(-1, 1)
    y = df['amount'].values

    model = LinearRegression()
    model.fit(X, y)

    next_index = np.array([[len(df)]])
    prediction = float(model.predict(next_index)[0])
    r2_score = float(model.score(X, y))

    return {
        "prediction": round(prediction, 2),
        "confidence": round(max(0, min(1, r2_score)), 2),
        "trend": "up" if model.coef_[0] > 0 else "down",
        "slope": round(float(model.coef_[0]), 2),
    }

# ──────────────────────────────────────────
# 🆕 Business Health Score (Composite)
# ──────────────────────────────────────────

@app.post("/health-score")
async def compute_health_score(request: HealthScoreRequest):
    """
    Compute a 0–100 Business Health Score.
    This metric provides an objective assessment of overall financial performance.
    """
    profit = request.total_income - request.total_expenses
    profit_margin = (profit / request.total_income * 100) if request.total_income > 0 else 0

    # Component scores (each 0-25)
    profitability_score = min(25, max(0, profit_margin * 0.5))  # profit margin drives this
    consistency_score = min(25, request.record_count / max(1, request.months_active) * 2)  # regular tracking
    safety_score = max(0, 25 - request.anomaly_count * 5)  # fewer anomalies = safer
    growth_score = min(25, max(0, profit_margin * 0.25 + 10))  # baseline + margin bonus

    total = round(profitability_score + consistency_score + safety_score + growth_score, 1)

    if total >= 80:
        grade = "A+"
        verdict = "Exceptional. Your business is in outstanding financial health."
    elif total >= 65:
        grade = "A"
        verdict = "Strong. Financials are solid with room for optimization."
    elif total >= 50:
        grade = "B"
        verdict = "Good. Some areas need attention to reach peak performance."
    elif total >= 35:
        grade = "C"
        verdict = "Fair. Several financial risks need immediate attention."
    else:
        grade = "D"
        verdict = "Critical. Urgent financial restructuring recommended."

    return {
        "score": total,
        "grade": grade,
        "verdict": verdict,
        "breakdown": {
            "profitability": round(profitability_score, 1),
            "consistency": round(consistency_score, 1),
            "safety": round(safety_score, 1),
            "growth_potential": round(growth_score, 1),
        },
    }

# ──────────────────────────────────────────
# 🆕 Monte Carlo Simulation Engine
# ──────────────────────────────────────────

@app.post("/simulate")
async def simulate_scenarios(scenario: SimulationScenario):
    """
    Run 1,000 Monte Carlo simulations of the business's future.
    This feature allows users to model 'What if' scenarios
    and see probable outcomes across 1,000 simulation runs.
    """
    num_simulations = 1000
    months = scenario.months_to_simulate

    # Monthly loan EMI (if any)
    monthly_rate = scenario.loan_interest_rate / 100 / 12
    if scenario.loan_amount > 0 and monthly_rate > 0:
        emi = scenario.loan_amount * monthly_rate * (1 + monthly_rate) ** months / ((1 + monthly_rate) ** months - 1)
    else:
        emi = 0

    # Additional monthly cost from new hires
    hire_cost = scenario.new_hires * scenario.avg_salary_per_hire / 12

    final_balances = []
    bankrupt_count = 0

    for _ in range(num_simulations):
        balance = 0
        monthly_rev = scenario.current_monthly_revenue
        monthly_exp = scenario.current_monthly_expenses + hire_cost + emi
        went_negative = False

        for m in range(months):
            # Add randomness: revenue varies ±15%, expenses vary ±8%
            rev = monthly_rev * (1 + np.random.normal(scenario.revenue_growth_rate / 100, 0.15))
            exp = monthly_exp * (1 + np.random.normal(scenario.expense_growth_rate / 100, 0.08))
            balance += rev - exp
            monthly_rev = rev
            monthly_exp = exp

            if balance < -scenario.current_monthly_revenue * 3:
                went_negative = True

        final_balances.append(float(balance))
        if went_negative:
            bankrupt_count += 1

    arr = np.array(final_balances)
    success_rate = round((1 - bankrupt_count / num_simulations) * 100, 1)
    return {
        "simulations_run": num_simulations,
        "months_simulated": months,
        "success_probability": success_rate,
        "median_outcome": round(float(np.median(arr)), 2),
        "best_case": round(float(np.percentile(arr, 95)), 2),
        "worst_case": round(float(np.percentile(arr, 5)), 2),
        "average_outcome": round(float(np.mean(arr)), 2),
        "bankruptcy_risk": round(bankrupt_count / num_simulations * 100, 1),
        "verdict": (
            "🟢 High Confidence. This decision is financially sound."
            if success_rate >= 75 else
            "🟡 Moderate Risk. Proceed with caution and contingency plans."
            if success_rate >= 50 else
            "🔴 High Risk. This scenario leads to failure in most simulations."
        ),
    }

# ──────────────────────────────────────────
# 🆕 AERA Sentinel (Billion Dollar Vision)
# ──────────────────────────────────────────

@app.post("/aera/sentinel")
async def aera_sentinel(request: ResilienceRequest):
    """
    AERA Sentinel: The world's first Autonomous Economic Resilience Agent.
    Analyzes local business state against global economic volatility patterns.
    This feature is the core of our 'Eliminating Failure' mission.
    """
    # Simulate Global Market Sentiment (In production, this would fetch real-time API data)
    global_volatility = np.random.uniform(0.1, 0.8) # 0 to 1
    market_sectors = {
        "technology": 0.85,
        "retail": 0.65,
        "food": 0.90,
        "service": 0.70,
        "manufacturing": 0.75
    }
    
    sector_health = market_sectors.get(request.industry.lower(), 0.5)
    
    # Calculate Runway
    runway_months = request.current_cash_reserve / request.monthly_burn_rate if request.monthly_burn_rate > 0 else 24
    
    # Resilience Logic: Weighted average of Sector Health, Runway, and Volatility
    base_score = (sector_health * 50) + (min(runway_months, 12) / 12 * 50)
    
    if request.is_global_exposure:
        # Volatility index increases risk for global businesses
        risk_adjustment = (global_volatility * 20)
        base_score -= risk_adjustment
    
    resilience_score = round(min(100, max(0, base_score + np.random.normal(0, 2))), 1)
    
    # Dynamic Vision-Led Verdicts
    if resilience_score > 85:
        status = "FORTIFIED"
        grade = "S-TIER"
        recommendation = "Your economic foundation is absolute. AERA recommends immediate market expansion."
    elif resilience_score > 65:
        status = "RESILIENT"
        grade = "A-TIER"
        recommendation = "High stability detected. Focus on optimizing unit economics for maximum autonomous growth."
    elif resilience_score > 40:
        status = "STABLE"
        grade = "B-TIER"
        recommendation = "Moderate risk. AERA suggests building 3x cash reserves before next global pivot."
    else:
        status = "VULNERABLE"
        grade = "C-TIER"
        recommendation = "Extreme volatility detected. Implement AERA Burn-Rate reduction protocol and diversify supply chain."

    return {
        "resilience_score": resilience_score,
        "status": status,
        "grade": grade,
        "global_volatility_index": round(global_volatility, 2),
        "recommendation": recommendation,
        "sentinel_protocol": "ACTIVE",
        "timestamp": "2026-04-07T10:37:44Z",
        "verdict": f"AERA has evaluated your business in {request.region} and assigned a {grade} resilience rating."
    }


class MemoryItem(BaseModel):
    id: str
    content: str
    metadata: Optional[dict] = {}
    timestamp: int

class MemoryQuery(BaseModel):
    query: str
    top_k: int = 5

# Simulated In-Memory Vector Store
# In a real 30-year evolution, this would be Pinecone or ChromaDB
memory_db = []

@app.post("/memory/store")
async def store_memory(item: MemoryItem):
    """Store a business insight or context for historical reference."""
    memory_db.append(item)
    return {"status": "success", "insight_id": item.id}

@app.post("/memory/query")
async def query_memory(request: MemoryQuery):
    """
    Search historical business insights. 
    Currently uses basic keyword relevance for simulation.
    """
    results = []
    # Simple keyword relevance for simulation
    query_terms = request.query.lower().split()
    
    for item in memory_db:
        score = 0
        content_lower = item.content.lower()
        for term in query_terms:
            if term in content_lower:
                score += 1
        
        if score > 0:
            results.append({"item": item, "relevance": score})
            
    # Sort by relevance
    results.sort(key=lambda x: x["relevance"], reverse=True)
    return {"results": results[:request.top_k]}

# ──────────────────────────────────────────
# 🆕 Deep Learning Intelligence (Vision & Audio)
# ──────────────────────────────────────────

class VisionIntelligence:
    def __init__(self):
        self.mp_face_detection = mp.solutions.face_detection
        self.face_detection = self.mp_face_detection.FaceDetection(model_selection=1, min_detection_confidence=0.5)

    def analyze_frame(self, frame_bytes: bytes):
        try:
            nparr = np.frombuffer(frame_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img is None:
                return {"detected": False, "emotion": "unknown"}
            
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            results = self.face_detection.process(img_rgb)
            
            if results.detections:
                # Basic mock emotion based on detection bounding box aspect ratio or just simulation for now
                # In a full deployment, we'd use a deep model like DeepFace
                emotions = ["Focused", "Determined", "Neutral", "Optimistic", "Strategic"]
                return {"detected": True, "emotion": np.random.choice(emotions), "confidence": results.detections[0].score[0]}
            
            return {"detected": False, "emotion": "none"}
        except Exception as e:
            print(f"Vision Error: {e}")
            return {"detected": False, "emotion": "error"}

class AudioIntelligence:
    def analyze_snippet(self, audio_bytes: bytes):
        try:
            # Load audio using librosa from bytes
            y, sr = librosa.load(io.BytesIO(audio_bytes), duration=5)
            
            # Simple feature extraction for simulation
            rms = float(np.mean(librosa.feature.rms(y=y)))
            spectral_centroid = float(np.mean(librosa.feature.spectral_centroid(y=y, sr=sr)))
            
            # Sentiment simulation based on acoustic features
            if rms > 0.05:
                sentiment = "High Energy / High Engagement"
            elif spectral_centroid > 3000:
                sentiment = "Intellectual / Strategic"
            else:
                sentiment = "Calm / Analytical"
                
            return {"sentiment": sentiment, "rms": rms}
        except Exception as e:
            print(f"Audio Error: {e}")
            return {"sentiment": "unclear", "error": str(e)}

vision_brain = VisionIntelligence()
audio_brain = AudioIntelligence()

@app.post("/analyze/moment", response_model=MomentIntelligenceResponse)
async def analyze_moment(
    frame: UploadFile = File(None),
    audio: UploadFile = File(None),
    context: Optional[str] = Form("")
):
    """
    Unified Moment Intelligence Endpoint.
    Analyzes visual presence and audio sentiment to 'grab' the business moment.
    """
    vision_results = {"detected": False, "emotion": "unknown"}
    audio_results = {"sentiment": "quiet"}
    
    if frame:
        frame_bytes = await frame.read()
        vision_results = vision_brain.analyze_frame(frame_bytes)
        
    if audio:
        audio_bytes = await audio.read()
        audio_results = audio_brain.analyze_snippet(audio_bytes)
        
    # Extract keywords from context (simulated speech-to-text integration)
    keywords = list(set([word.lower() for word in context.split() if len(word) > 4]))
    
    # Calculate Resilience Impact
    # Positive emotions and high engagement drive resilience
    base_impact = 1.0 if vision_results.get("detected") else 0.5
    if "high" in audio_results.get("sentiment", "").lower():
        base_impact += 0.5
        
    return MomentIntelligenceResponse(
        emotional_state=vision_results.get("emotion", "unknown"),
        presence_detected=vision_results.get("detected", False),
        audio_sentiment=audio_results.get("sentiment", "unclear"),
        keywords=keywords,
        resilience_impact=round(base_impact, 2),
        timestamp=time.time()
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
