from typing import List
from fastapi import UploadFile
from pathlib import Path

ALLOWED_EXTS = {".tf", ".yml", ".yaml", ".json"}

async def save_uploads(files: List[UploadFile], dest_dir: Path) -> List[Path]:
    saved: List[Path] = []
    for uf in files:
        if not uf.filename:
            continue
        # Use basename to avoid client-side path fragments like C:\fakepath\file.tf
        safe_name = Path(uf.filename).name
        suffix = Path(safe_name).suffix.lower()
        # If you want to restrict types strictly, uncomment:
        # if suffix not in ALLOWED_EXTS:
        #     continue
        out_path = dest_dir / safe_name
        out_path.parent.mkdir(parents=True, exist_ok=True)
        with open(out_path, "wb") as out:
            content = await uf.read()
            out.write(content)
        saved.append(out_path)
    return saved
