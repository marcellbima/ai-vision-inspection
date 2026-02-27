import torch
import torch.nn as nn
from torchvision import models
import os
import logging

logger = logging.getLogger(__name__)

CLASS_NAMES = ["no_defect", "defect"]
DEFECT_TYPES = {
    0: None,
    1: "surface_defect"
}

MODEL_PATH = os.getenv("MODEL_PATH", "/app/models/model.pth")

class Predictor:
    def __init__(self):
        self.model = None
        self.model_loaded = False
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self._load_model()

    def _build_model(self) -> nn.Module:
        """
        Build ResNet18 with custom classifier head for binary classification.
        """
        model = models.resnet18(weights=None)
        model.fc = nn.Sequential(
            nn.Dropout(0.3),
            nn.Linear(model.fc.in_features, 2)
        )
        return model

    def _load_model(self):
        try:
            self.model = self._build_model()
            if os.path.exists(MODEL_PATH):
                state_dict = torch.load(MODEL_PATH, map_location=self.device)
                self.model.load_state_dict(state_dict)
                self.model_loaded = True
                logger.info(f"Model loaded from {MODEL_PATH}")
            else:
                # No trained model yet — run in demo mode
                logger.warning("No model file found. Running in DEMO mode.")
                self.model_loaded = False
            self.model.to(self.device)
            self.model.eval()
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            self.model_loaded = False

    def predict(self, tensor: torch.Tensor) -> dict:
        """
        Run inference and return result with confidence score.
        """
        tensor = tensor.to(self.device)

        with torch.no_grad():
            outputs = self.model(tensor)
            probabilities = torch.softmax(outputs, dim=1)
            confidence, predicted = torch.max(probabilities, 1)

        class_idx = predicted.item()
        confidence_score = round(confidence.item(), 4)

        return {
            "result": CLASS_NAMES[class_idx],
            "confidence": confidence_score,
            "defect_type": DEFECT_TYPES[class_idx],
            "class_index": class_idx,
            "probabilities": {
                "no_defect": round(probabilities[0][0].item(), 4),
                "defect": round(probabilities[0][1].item(), 4)
            }
        }
