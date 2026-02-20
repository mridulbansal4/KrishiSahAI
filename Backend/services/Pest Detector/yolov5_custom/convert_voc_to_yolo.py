"""
Convert Pascal VOC XML annotations → YOLO TXT labels
Dataset: IP102 (Detection/VOC2007)

Structure expected:
  VOC2007/
    JPEGImages/JPEGImages/  ← images
    Annotations/Annotations/ ← XML files
    ImageSets/Main/trainval.txt, test.txt

Output:
  VOC2007/
    labels/                 ← YOLO .txt files (one per image)
    images/                 ← symlink/copy of JPEGImages/JPEGImages (updated in insect.yaml)
"""

import os
import xml.etree.ElementTree as ET
from pathlib import Path

# ── Paths ──────────────────────────────────────────────────────────────────────
VOC_ROOT = Path(r"C:\Users\mridu\Downloads\IP102_v1.1-20260202T161558Z-3-001\IP102_v1.1\Detection\VOC2007")
ANN_DIR  = VOC_ROOT / "Annotations" / "Annotations"
IMG_DIR  = VOC_ROOT / "JPEGImages"  / "JPEGImages"
LBL_DIR  = VOC_ROOT / "labels"

LBL_DIR.mkdir(exist_ok=True)
print(f"Output labels → {LBL_DIR}")

errors = 0
converted = 0

for xml_file in ANN_DIR.glob("*.xml"):
    try:
        tree = ET.parse(xml_file)
        root = tree.getroot()

        size = root.find("size")
        w = int(size.find("width").text)
        h = int(size.find("height").text)

        if w == 0 or h == 0:
            print(f"  SKIP {xml_file.name}: zero image size")
            continue

        lines = []
        for obj in root.findall("object"):
            cls = obj.find("name").text.strip()
            # class label is already an integer index in this dataset
            try:
                cls_id = int(cls)
            except ValueError:
                print(f"  WARN {xml_file.name}: non-integer class '{cls}', skipping object")
                continue

            bb = obj.find("bndbox")
            xmin = float(bb.find("xmin").text)
            ymin = float(bb.find("ymin").text)
            xmax = float(bb.find("xmax").text)
            ymax = float(bb.find("ymax").text)

            # YOLO format: class cx cy bw bh  (normalised 0-1)
            cx = ((xmin + xmax) / 2) / w
            cy = ((ymin + ymax) / 2) / h
            bw = (xmax - xmin) / w
            bh = (ymax - ymin) / h

            lines.append(f"{cls_id} {cx:.6f} {cy:.6f} {bw:.6f} {bh:.6f}")

        txt_path = LBL_DIR / (xml_file.stem + ".txt")
        with open(txt_path, "w") as f:
            f.write("\n".join(lines))
        converted += 1

    except Exception as e:
        print(f"  ERROR {xml_file.name}: {e}")
        errors += 1

print(f"\nDone. Converted {converted} files, {errors} errors.")
print(f"Labels saved to: {LBL_DIR}")
