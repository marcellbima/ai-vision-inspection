from fastapi import FastAPI, UploadFile, File, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn, cv2, numpy as np, base64, json, asyncio
from utils.predictor import Predictor
from utils.preprocessor import preprocess_image

app = FastAPI(title="AI Vision Inspection Service", version="2.0.0")

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

@app.websocket("/ws/inspect")
async def websocket_inspect(websocket: WebSocket):
    await websocket.accept()
    print("WebSocket client connected")
    try:
        while True:
            # Receive frame dari browser (base64)
            data = await websocket.receive_text()
            msg  = json.loads(data)

            if msg.get("type") == "frame":
                # Decode base64 frame
                img_data = msg["data"].split(",")[1] if "," in msg["data"] else msg["data"]
                img_bytes = base64.b64decode(img_data)

                # Preprocess & predict
                tensor = preprocess_image(img_bytes)
                result = predictor.predict(tensor)

                # Kirim hasil ke browser
                response = {
                    "type": "result",
                    "status": "GO" if result["result"] == "no_defect" else "NG",
                    "result": result["result"],
                    "confidence": result["confidence"],
                    "probabilities": result["probabilities"]
                }
                await websocket.send_text(json.dumps(response))

            elif msg.get("type") == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))

    except WebSocketDisconnect:
        print("WebSocket client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket.close()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
