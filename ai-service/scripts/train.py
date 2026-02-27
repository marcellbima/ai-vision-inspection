import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, models, transforms
import os, time, copy

# Config
DATA_DIR   = os.getenv("DATA_DIR", "/app/data/processed")
MODEL_DIR  = os.getenv("MODEL_DIR", "/app/models")
EPOCHS     = int(os.getenv("EPOCHS", 20))
BATCH_SIZE = int(os.getenv("BATCH_SIZE", 32))
LR         = float(os.getenv("LR", 0.001))

os.makedirs(MODEL_DIR, exist_ok=True)

# Transforms
data_transforms = {
    "train": transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225])
    ]),
    "val": transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225])
    ])
}

def train():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Training on: {device}")

    # Load datasets
    image_datasets = {
        x: datasets.ImageFolder(os.path.join(DATA_DIR, x), data_transforms[x])
        for x in ["train", "val"]
    }
    dataloaders = {
        x: DataLoader(image_datasets[x], batch_size=BATCH_SIZE, shuffle=True, num_workers=4)
        for x in ["train", "val"]
    }

    # Build model (transfer learning from ResNet18)
    model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
    model.fc = nn.Sequential(
        nn.Dropout(0.3),
        nn.Linear(model.fc.in_features, 2)
    )
    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=LR)
    scheduler = torch.optim.lr_scheduler.StepLR(optimizer, step_size=7, gamma=0.1)

    best_acc  = 0.0
    best_model = copy.deepcopy(model.state_dict())

    for epoch in range(EPOCHS):
        print(f"\nEpoch {epoch+1}/{EPOCHS} {'-'*20}")

        for phase in ["train", "val"]:
            model.train() if phase == "train" else model.eval()

            running_loss, running_corrects = 0.0, 0

            for inputs, labels in dataloaders[phase]:
                inputs, labels = inputs.to(device), labels.to(device)
                optimizer.zero_grad()

                with torch.set_grad_enabled(phase == "train"):
                    outputs = model(inputs)
                    loss = criterion(outputs, labels)
                    _, preds = torch.max(outputs, 1)

                    if phase == "train":
                        loss.backward()
                        optimizer.step()

                running_loss     += loss.item() * inputs.size(0)
                running_corrects += torch.sum(preds == labels.data)

            if phase == "train":
                scheduler.step()

            epoch_loss = running_loss / len(image_datasets[phase])
            epoch_acc  = running_corrects.double() / len(image_datasets[phase])
            print(f"{phase.upper()} Loss: {epoch_loss:.4f} | Acc: {epoch_acc:.4f}")

            if phase == "val" and epoch_acc > best_acc:
                best_acc  = epoch_acc
                best_model = copy.deepcopy(model.state_dict())

    print(f"\nBest Validation Accuracy: {best_acc:.4f}")

    # Save best model
    save_path = os.path.join(MODEL_DIR, "model.pth")
    torch.save(best_model, save_path)
    print(f"Model saved to {save_path}")

if __name__ == "__main__":
    train()
