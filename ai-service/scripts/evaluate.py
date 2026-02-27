import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, models, transforms
from sklearn.metrics import classification_report, confusion_matrix
import os

DATA_DIR  = os.getenv("DATA_DIR", "/app/data/processed")
MODEL_PATH = os.getenv("MODEL_PATH", "/app/models/model.pth")

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

def evaluate():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    dataset   = datasets.ImageFolder(os.path.join(DATA_DIR, "val"), transform)
    loader    = DataLoader(dataset, batch_size=32, shuffle=False, num_workers=4)

    model     = models.resnet18(weights=None)
    model.fc  = nn.Sequential(nn.Dropout(0.3), nn.Linear(model.fc.in_features, 2))
    model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
    model.to(device)
    model.eval()

    all_preds, all_labels = [], []

    with torch.no_grad():
        for inputs, labels in loader:
            inputs = inputs.to(device)
            outputs = model(inputs)
            _, preds = torch.max(outputs, 1)
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.numpy())

    print("\nClassification Report:")
    print(classification_report(all_labels, all_preds,
                                target_names=["no_defect", "defect"]))
    print("Confusion Matrix:")
    print(confusion_matrix(all_labels, all_preds))

if __name__ == "__main__":
    evaluate()
