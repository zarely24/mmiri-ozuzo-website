#!/usr/bin/env python3
"""Responsive image pipeline (Pillow only).

Put approved, licensed originals in src/img/originals/ named by slot id, e.g.
  hero.jpg, shop.jpg, shop-detail.jpg, story.jpg, gallery-01.jpg …
Run:  python tools/images.py
Writes src/img/generated/<id>-<width>.{avif,webp,jpg} and manifest.json, which build.mjs
turns into <picture> elements with srcset/sizes, width/height (no layout shift) and lazy-loading.
Then reference each id in site.config.json → images (with alt_el / alt_en / caption_*).
"""
import json, sys
from pathlib import Path
from PIL import Image, ImageOps, features

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'src' / 'img' / 'originals'
OUT = ROOT / 'src' / 'img' / 'generated'
WIDTHS = [480, 800, 1200, 1600, 2000]
AVIF = features.check('avif')

def main():
    if not SRC.exists() or not any(SRC.iterdir()):
        print(f'No originals in {SRC}. Nothing to do.')
        return 0
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = {}
    for f in sorted(SRC.iterdir()):
        if f.suffix.lower() not in ('.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff'):
            continue
        img = ImageOps.exif_transpose(Image.open(f)).convert('RGB')
        w, h = img.size
        widths = [x for x in WIDTHS if x <= w] or [w]
        if widths[-1] != w and w < WIDTHS[-1]:
            widths.append(w)
        formats = ['jpg', 'webp'] + (['avif'] if AVIF else [])
        for tw in widths:
            th = round(h * tw / w)
            r = img.resize((tw, th), Image.LANCZOS)
            r.save(OUT / f'{f.stem}-{tw}.jpg', 'JPEG', quality=82, optimize=True, progressive=True)
            r.save(OUT / f'{f.stem}-{tw}.webp', 'WEBP', quality=80, method=6)
            if AVIF:
                r.save(OUT / f'{f.stem}-{tw}.avif', 'AVIF', quality=60)
        manifest[f.stem] = {'width': w, 'height': h, 'widths': widths, 'formats': formats, 'source': f.name}
        print(f'{f.name}: {w}x{h} -> {len(widths)} widths x {len(formats)} formats')
    (OUT / 'manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
    print(f'Wrote {OUT / "manifest.json"} (AVIF {"on" if AVIF else "off - Pillow built without libavif"})')
    return 0

if __name__ == '__main__':
    sys.exit(main())
