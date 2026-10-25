"""Refresh the two public Sentinel-2 preview fixtures (Python standard library only)."""
import hashlib
import json
from pathlib import Path
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public' / 'demo'
IDS = ['S2B_32TPP_20240731_0_L2A', 'S2C_32TPP_20250711_0_L2A']
API = 'https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a/items/'


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    scenes = []
    for index, item_id in enumerate(IDS):
        with urlopen(API + item_id, timeout=60) as response:
            item = json.load(response)
        preview = item['assets']['thumbnail']['href']
        with urlopen(preview, timeout=60) as response:
            image = response.read()
        filename = f'scene-{index + 1}.jpg'
        (OUT / filename).write_bytes(image)
        scenes.append({
            'id': item_id, 'datetime': item['properties']['datetime'],
            'cloudCover': item['properties']['eo:cloud_cover'],
            'bbox': item['bbox'], 'image': filename, 'previewUrl': preview,
            'itemUrl': API + item_id,
            'sha256': hashlib.sha256(image).hexdigest(),
            'assets': {key: value['href'] for key, value in item['assets'].items()
                       if key in ['red', 'nir', 'scl', 'visual']},
        })
    manifest = {'collection': 'sentinel-2-l2a', 'tile': '32TPP',
                'attribution': 'Contains modified Copernicus Sentinel data (2024, 2025), accessed through Element 84 Earth Search / AWS Open Data.',
                'note': 'Whole-tile RGB previews for visual exploration; not analysis-ready bands or measured carbon outcomes.',
                'scenes': scenes}
    (OUT / 'scenes.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
    print('Saved two real Sentinel-2 previews and their provenance manifest.')


if __name__ == '__main__':
    main()
