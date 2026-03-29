"""
Smart Road Estimator — AI Pothole Detection Microservice

FastAPI service that receives road images and returns
bounding-box detections with severity classification.

Currently uses mock detection logic.
Replace `_mock_detect()` with a real model (YOLOv8, etc.) for production.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
import time
import hashlib

app = FastAPI(
    title="Smart Road Estimator – AI Detection Service",
    version="1.0.0",
    description="Pothole detection microservice using computer vision",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Models ──────────────────────────────────────────────────

class DetectionRequest(BaseModel):
    image_url: str


class BoundingBox(BaseModel):
    x: float
    y: float
    width: float
    height: float
    severity: str  # LOW, MEDIUM, HIGH
    label: str
    confidence: float


class DetectionResponse(BaseModel):
    image_url: str
    detections: list[BoundingBox]
    processing_time_ms: int


# ─── Health Check ────────────────────────────────────────────

@app.get("/health")
def health_check():
    return {"status": "OK", "service": "ai-detection"}


# ─── Detection Endpoint ─────────────────────────────────────

@app.post("/detect", response_model=DetectionResponse)
def detect_potholes(request: DetectionRequest):
    """
    Receive an image URL and return detected potholes with bounding boxes.

    In production, this would:
    1. Download the image
    2. Preprocess it for the model
    3. Run inference (YOLOv8, Faster R-CNN, etc.)
    4. Post-process results
    5. Return bounding boxes with severity

    Currently returns mock detections for development/testing.
    """
    if not request.image_url:
        raise HTTPException(status_code=400, detail="image_url is required")

    start_time = time.time()

    detections = _mock_detect(request.image_url)

    processing_time = int((time.time() - start_time) * 1000)

    return DetectionResponse(
        image_url=request.image_url,
        detections=detections,
        processing_time_ms=processing_time,
    )


# ─── Mock Detection Logic ───────────────────────────────────

def _mock_detect(image_url: str) -> list[BoundingBox]:
    """
    Generate deterministic mock detections based on the image URL hash.
    This ensures the same image always returns the same detections,
    making testing predictable.
    """
    # Use URL hash as seed for reproducibility
    seed = int(hashlib.md5(image_url.encode()).hexdigest()[:8], 16)
    rng = random.Random(seed)

    num_potholes = rng.randint(2, 6)
    severities = ["LOW", "MEDIUM", "HIGH"]
    severity_weights = [0.3, 0.45, 0.25]

    detections = []
    for i in range(num_potholes):
        severity = rng.choices(severities, weights=severity_weights, k=1)[0]

        # Generate realistic bounding box positions (within a 640x480 image)
        x = rng.uniform(20, 500)
        y = rng.uniform(50, 380)
        width = rng.uniform(30, 120)
        height = rng.uniform(25, 90)

        # Higher severity → higher confidence
        base_confidence = {"LOW": 0.65, "MEDIUM": 0.78, "HIGH": 0.88}
        confidence = round(base_confidence[severity] + rng.uniform(0, 0.1), 2)

        detections.append(
            BoundingBox(
                x=round(x, 1),
                y=round(y, 1),
                width=round(width, 1),
                height=round(height, 1),
                severity=severity,
                label=f"Pothole #{i + 1}",
                confidence=min(confidence, 0.99),
            )
        )

    return detections


# ─── Run ─────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
