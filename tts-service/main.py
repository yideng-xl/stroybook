import os
import sys
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import torch
import soundfile as sf
import numpy as np
from phonemizer.backend import EspeakBackend

# Add neutts-air to sys.path
# Assuming neutts-air is cloned into /app/neutts-air within the Docker container
sys.path.append(os.path.join(os.path.dirname(__file__), "neutts-air", "neuttsair"))

# Import NeuTTSAir
try:
    from neutts import NeuTTSAir
except ImportError as e:
    print(f"Error importing NeuTTSAir: {e}")
    # Fallback for local testing if path structure is different
    try:
        sys.path.append(os.path.join(os.path.dirname(__file__), "neutts-air"))
        from neuttsair.neutts import NeuTTSAir
    except ImportError:
        print("Make sure you have cloned the neutts-air repository into the tts-service/neutts-air directory.")
        sys.exit(1)

app = FastAPI(title="StoryBook Custom TTS Service (NeuTTS-Air)")

# Global Model
tts_model = None
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

DEFAULT_REF_TEXT = "This is a reference audio for voice cloning." 

class TTSRequest(BaseModel):
    text: str
    reference_audio_path: str
    reference_text: str = DEFAULT_REF_TEXT
    language: str = "zh" 

@app.on_event("startup")
async def load_model():
    global tts_model
    print(f"Loading NeuTTS-Air model on {DEVICE}...")
    try:
        # Initialize model
        tts_model = NeuTTSAir(
            backbone_repo="neuphonic/neutts-air",
            backbone_device=DEVICE,
            codec_repo="neuphonic/neucodec",
            codec_device=DEVICE
        )
        # Initialize a custom attribute to track current phonemizer language
        tts_model.current_lang = 'en-us' 
        
        print("Model loaded successfully!")
    except Exception as e:
        print(f"Error loading model: {e}")
        import traceback
        traceback.print_exc()

@app.post("/tts")
async def generate_speech(request: TTSRequest):
    if tts_model is None:
        raise HTTPException(status_code=503, detail="TTS Model not initialized")

    if not os.path.exists(request.reference_audio_path):
        # Check if user provided a relative path, prepend default storage path if needed
        # But for safety, we expect absolute paths or mapped paths in Docker
        raise HTTPException(status_code=400, detail=f"Reference audio file not found: {request.reference_audio_path}")
    
    try:
        # 1. Dynamic Language Switching
        # Map 'zh' to 'cmn' (Mandarin) for espeak-ng
        target_lang = 'cmn' if request.language == 'zh' else 'en-us'
        
        if getattr(tts_model, 'current_lang', None) != target_lang:
            print(f"Switching phonemizer language to: {target_lang}")
            try:
                tts_model.phonemizer = EspeakBackend(
                    language=target_lang,
                    preserve_punctuation=True,
                    with_stress=True
                )
                tts_model.current_lang = target_lang
            except Exception as e:
                print(f"Warning: Failed to switch language to {target_lang}. Falling back to default. Error: {e}")

        print(f"Generating TTS for text: {request.text[:20]}... (Lang: {target_lang})")
        
        # 2. Encode Reference Audio
        ref_codes = tts_model.encode_reference(request.reference_audio_path)
        
        # 3. Inference
        wav = tts_model.infer(
            text=request.text,
            ref_codes=ref_codes,
            ref_text=request.reference_text
        )
        
        # 4. Save to temporary file
        output_path = "output_temp.wav"
        sf.write(output_path, wav, 24000)
        
        from fastapi.responses import FileResponse
        return FileResponse(output_path, media_type="audio/wav", filename="output.wav")

    except Exception as e:
        print(f"TTS Generation failed: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {
        "status": "ok", 
        "device": DEVICE, 
        "model_loaded": tts_model is not None,
        "cuda_available": torch.cuda.is_available()
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)