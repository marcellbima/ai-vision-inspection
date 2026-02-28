import os, shutil, random
from pathlib import Path

# Paths
DATASET_PATH = Path("/home/ubuntu-ai-server/.cache/kagglehub/datasets/akhatova/pcb-defects/versions/1/PCB_DATASET")
OUTPUT_PATH  = Path("/home/ubuntu-ai-server/ai-vision-inspection/data/processed")

TRAIN_RATIO  = 0.8
SEED         = 42
random.seed(SEED)

# Create output folders
for split in ["train", "val"]:
    for cls in ["defect", "no_defect"]:
        (OUTPUT_PATH / split / cls).mkdir(parents=True, exist_ok=True)

def copy_images(src_dir, label, max_images=None):
    images = list(src_dir.glob("*.jpg")) + list(src_dir.glob("*.png")) + list(src_dir.glob("*.JPG"))
    random.shuffle(images)
    if max_images:
        images = images[:max_images]
    split_idx = int(len(images) * TRAIN_RATIO)
    train_imgs = images[:split_idx]
    val_imgs   = images[split_idx:]
    for img in train_imgs:
        shutil.copy(img, OUTPUT_PATH / "train" / label / img.name)
    for img in val_imgs:
        shutil.copy(img, OUTPUT_PATH / "val" / label / img.name)
    print(f"{label} - {src_dir.name}: {len(train_imgs)} train, {len(val_imgs)} val")

# Copy defect images dari semua kategori
defect_dirs = ["Short", "Spurious_copper", "Open_circuit", "Missing_hole", "Mouse_bite", "Spur"]
for d in defect_dirs:
    src = DATASET_PATH / "images" / d
    if src.exists():
        copy_images(src, "defect")

# Copy no_defect dari PCB_USED
no_defect_src = DATASET_PATH / "PCB_USED"
if no_defect_src.exists():
    copy_images(no_defect_src, "no_defect")

# Summary
for split in ["train", "val"]:
    for cls in ["defect", "no_defect"]:
        count = len(list((OUTPUT_PATH / split / cls).glob("*")))
        print(f"{split}/{cls}: {count} images")

print("\nDataset preparation complete!")
