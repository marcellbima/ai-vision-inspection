from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from utils.predictor import Predictor
from utils.preprocessor import preprocess_image
import io

app = FastAPI(title="AI Vision Inspection Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

predictor = Predictor()

@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": predictor.model_loaded}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    contents = await file.read()
    image = preprocess_image(contents)
    result = predictor.predict(image)
    return result

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
