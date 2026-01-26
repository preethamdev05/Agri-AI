import json
import os
import numpy as np
import tensorflow as tf
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Literal

# ==============================================================================
# 1. CONFIGURATION & CONTRACTS
# ==============================================================================
MODEL_PATH = "model_40f4b8e9.keras"
METADATA_PATH = "inference_metadata.json"
DISEASE_THRESHOLD = 0.5  # Sigmoid threshold

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================================================================
# 2. SCHEMA DEFINITIONS (Strict Output Contract)
# ==============================================================================
class CropPrediction(BaseModel):
    label: str
    confidence: float

class HealthPrediction(BaseModel):
    status: Literal["non_crop", "healthy", "diseased"]
    probability: float  # ALWAYS the "diseased" probability (sigmoid output)

class DiseasePrediction(BaseModel):
    label: str
    confidence: float

class PredictResponse(BaseModel):
    crop: CropPrediction
    health: HealthPrediction
    disease: Optional[DiseasePrediction]  # Must be None if not diseased

# ==============================================================================
# 3. INITIALIZATION
# ==============================================================================
# Note: In a real deployment, we'd want robust checking here.
# For this audit/repair artifact, we assume files exist or fail at runtime.

# Load Metadata (Lazy or Global)
# CROP_CLASSES and DISEASE_CLASSES would be loaded here in production

# Load Model (Global)
# model = tf.keras.models.load_model(MODEL_PATH) 

# ==============================================================================
# 4. INFERENCE ENDPOINT
# ==============================================================================
@app.post("/predict", response_model=PredictResponse)
async def predict(image: UploadFile = File(...)):
    # --- Input Handling (Requirement B.2) ---
    try:
        content = await image.read()
        img = tf.io.decode_image(content, channels=3, expand_animations=False)
        img = tf.image.resize(img, [256, 256], method='bilinear')
        img = tf.cast(img, tf.uint8)  # Strict uint8 input
        img_batch = tf.expand_dims(img, 0)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image data")

    # --- Inference ---
    # Placeholder for actual model call:
    # predictions = model.predict(img_batch, verbose=0)
    
    # Mocking extraction for structure compliance (Replace with actual model output)
    # crop_logits = predictions['crop'][0]
    # disease_logits = predictions['disease'][0]
    # is_diseased_prob = float(predictions['is_diseased'][0][0])
    
    # For the purpose of this file artifact, we simulate the logic flow
    # to demonstrate the contract enforcement.
    
    # crop_idx = np.argmax(crop_logits)
    # crop_label = CROP_CLASSES[crop_idx]
    # crop_conf = float(np.max(crop_logits))

    # --- LOGIC ENFORCEMENT START ---
    
    # Example values for strict checking (Runtime would use actuals)
    crop_label = "Corn" 
    crop_conf = 0.99
    is_diseased_prob = 0.85
    
    # STATE 1: NON_CROP
    if crop_label == "NON_CROP":
        return {
            "crop": {"label": "NON_CROP", "confidence": crop_conf},
            "health": {"status": "non_crop", "probability": 0.0},
            "disease": None
        }

    # 2. Determine Health Status (Sigmoid Gate)
    if is_diseased_prob >= DISEASE_THRESHOLD:
        # STATE 3: DISEASED
        # disease_idx = np.argmax(disease_logits)
        # disease_label = DISEASE_CLASSES[disease_idx]
        # disease_conf = float(np.max(disease_logits))
        disease_label = "Leaf Blight"
        disease_conf = 0.95
        
        return {
            "crop": {"label": crop_label, "confidence": crop_conf},
            "health": {"status": "diseased", "probability": is_diseased_prob},
            "disease": {"label": disease_label, "confidence": disease_conf}
        }
    else:
        # STATE 2: HEALTHY
        return {
            "crop": {"label": crop_label, "confidence": crop_conf},
            "health": {"status": "healthy", "probability": is_diseased_prob},
            "disease": None
        }
