import cv2
import numpy as np
import torch
from torchvision import transforms
from PIL import Image
import io

# ImageNet normalization standards
MEAN = [0.485, 0.456, 0.406]
STD  = [0.229, 0.224, 0.225]

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=MEAN, std=STD)
])

def preprocess_image(image_bytes: bytes) -> torch.Tensor:
    """
    Convert raw image bytes to normalized tensor for model inference.
    """
    # Decode bytes to numpy array
    nparr = np.frombuffer(image_bytes, np.uint8)
    img_cv = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img_cv is None:
        raise ValueError("Cannot decode image")

    # Convert BGR (OpenCV) to RGB (PIL)
    img_rgb = cv2.cvtColor(img_cv, cv2.COLOR_BGR2RGB)
    img_pil = Image.fromarray(img_rgb)

    # Apply transforms
    tensor = transform(img_pil)
    return tensor.unsqueeze(0)  # Add batch dimension
