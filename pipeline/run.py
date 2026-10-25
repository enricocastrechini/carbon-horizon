"""Reproducible, bounded Sentinel-2 / Sentinel-1 spectral pilot. No credentials saved."""
import argparse
import hashlib
import json
import math
from pathlib import Path
from urllib.parse import quote
from urllib.request import urlopen

import certifi
import numpy as np
import rasterio
from PIL import Image
from rasterio.enums import Resampling
from rasterio.features import geometry_mask
from rasterio.transform import from_origin
from rasterio.vrt import WarpedVRT
from rasterio.warp import transform_bounds, transform_geom

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / '.cache' / 'rhodes'
OUT = ROOT / '.cache' / 'rhodes-output'
PUBLISHED = ROOT / 'public' / 'pilot'
S2 = 'https://earth-search.aws.element84.com/v1/collections/sentinel-2-c1-l2a/items/'
S1 = 'https://planetarycomputer.microsoft.com/api/stac/v1/collections/sentinel-1-rtc/items/'


def digest(data):
    return hashlib.sha256(data).hexdigest()


def read_json(url):
    with urlopen(url, timeout=60) as response:
        return json.load(response)


def item(item_id, endpoint, offline):
    path = CACHE / f'{item_id}.json'
    if not path.exists():
        if offline:
            raise RuntimeError(f'Missing cached metadata: {item_id}')
        path.write_text(json.dumps(read_json(endpoint + item_id)), encoding='utf-8')
    return json.loads(path.read_text(encoding='utf-8'))


def normalized_difference(a, b):
    total = a + b
    return np.divide(a - b, total, out=np.full(a.shape, np.nan, dtype='float32'), where=np.abs(total) > 1e-6)


def reflectance(raw, asset, properties):
    band = asset['raster:bands'][0]
    # Collection 1 declares physical-value conversion on each asset.
    return raw * band['scale'] + band.get('offset', 0)


def raster(array, path, grid, dtype='float32', nodata=-9999):
    clean = np.where(np.isfinite(array), array, nodata).astype(dtype)
    with rasterio.open(path, 'w', driver='GTiff', count=1, dtype=dtype,
                       nodata=nodata, compress='deflate', **grid) as dst:
        dst.write(clean, 1)


def band_data(source, key, grid, offline):
    cached = CACHE / f'{source["id"]}-{key}.tif'
    if cached.exists():
        with rasterio.open(cached) as src:
            if src.crs.to_string() != grid['crs'] or src.transform != grid['transform'] or src.shape != (grid['height'], grid['width']):
                raise RuntimeError('Cached grid differs from config. Use a fresh cache directory.')
            raw = src.read(1).astype('float32')
            raw[raw == src.nodata] = np.nan
        return raw
    if offline:
        raise RuntimeError(f'Missing cached band: {cached.name}')
    href = source['assets'][key]['href']
    if source['collection'] == 'sentinel-1-rtc':
        # Signed URLs are short-lived: never serialize them into public provenance.
        href = read_json('https://planetarycomputer.microsoft.com/api/sas/v1/sign?href=' + quote(href, safe=''))['href']
    print(f'Reading bounded window: {source["id"]} / {key}', flush=True)
    with rasterio.Env(GDAL_DISABLE_READDIR_ON_OPEN='EMPTY_DIR', GDAL_HTTP_TIMEOUT='90',
                      GDAL_HTTP_MAX_RETRY='2', CURL_CA_BUNDLE=certifi.where()):
        with rasterio.open(href) as src:
            with WarpedVRT(src, **grid, resampling=Resampling.nearest if key == 'scl' else Resampling.bilinear,
                           dtype='float32', nodata=-9999) as vrt:
                raw = vrt.read(1, masked=True).filled(np.nan)
    raster(raw, cached, grid)
    return raw


def save_image(name, rgb, valid=None):
    clean = np.nan_to_num(np.clip(rgb, 0, 1), nan=0)
    if valid is not None:
        clean[~valid] = [0.08, 0.11, 0.1]
    Image.fromarray((clean * 255).astype('uint8')).save(OUT / name)


def colour_index(array, valid):
    t = np.clip((array + 0.2) / 1.1, 0, 1)
    return np.stack([0.6 * (1 - t), 0.18 + 0.65 * t, 0.12 + 0.12 * t], axis=-1)


def rectangle(bbox):
    w, s, e, n = bbox
    return dict(type='Polygon', coordinates=[[[w,s],[e,s],[e,n],[w,n],[w,s]]])


def main(offline=False):
    config = json.loads((ROOT / 'pipeline' / 'rhodes.json').read_text())
    OUT.mkdir(parents=True, exist_ok=True)
    CACHE.mkdir(parents=True, exist_ok=True)
    west, south, east, north = transform_bounds('EPSG:4326', config['crs'], *config['bbox'])
    resolution = config['resolution']
    west, south = math.floor(west / resolution) * resolution, math.floor(south / resolution) * resolution
    east, north = math.ceil(east / resolution) * resolution, math.ceil(north / resolution) * resolution
    grid = dict(crs=config['crs'], transform=from_origin(west, north, resolution, resolution),
                width=round((east - west) / resolution), height=round((north - south) / resolution))
    pixel_ha = resolution ** 2 / 10000
    inside = geometry_mask([transform_geom('EPSG:4326', config['crs'], rectangle(config['bbox']))],
                           out_shape=(grid['height'], grid['width']), transform=grid['transform'], invert=True)
    comparison = geometry_mask([transform_geom('EPSG:4326', config['crs'], rectangle(config['comparisonBbox']))],
                               out_shape=inside.shape, transform=grid['transform'], invert=True)
    optical, provenance, quality = [], [], []
    files = []
    for index, source_id in enumerate(config['optical']):
        source = item(source_id, S2, offline)
        bands = {}
        for key in ['red', 'green', 'blue', 'nir', 'swir22', 'scl']:
            raw = band_data(source, key, grid, offline)
            bands[key] = raw if key == 'scl' else reflectance(raw, source['assets'][key], source['properties'])
        valid = inside & np.isin(bands['scl'], config['validScl'])
        for key in ['red', 'green', 'blue', 'nir', 'swir22']:
            valid &= np.isfinite(bands[key])
        ndvi = normalized_difference(bands['nir'], bands['red'])
        nbr = normalized_difference(bands['nir'], bands['swir22'])
        valid &= np.isfinite(ndvi) & np.isfinite(nbr)
        ndvi[~valid] = np.nan
        nbr[~valid] = np.nan
        optical.append(dict(ndvi=ndvi, nbr=nbr, valid=valid, scl=bands['scl']))
        quality.append(dict(date=source['properties']['datetime'], validFraction=float(valid.sum() / inside.sum()),
                            sceneCloudCover=source['properties']['eo:cloud_cover']))
        tag = 'before' if index == 0 else 'after'
        for key, array in [('ndvi', ndvi), ('nbr', nbr), ('quality', valid.astype('float32'))]:
            name = f'{tag}-{key}.tif'
            raster(array, OUT / name, grid)
            files.append(name)
        for name, rgb in [
            (f'{tag}-rgb.png', np.stack([bands[k] for k in ['red', 'green', 'blue']], axis=-1) / 0.3),
            (f'{tag}-false-colour.png', np.stack([bands[k] for k in ['nir', 'red', 'green']], axis=-1) / 0.5),
            (f'{tag}-ndvi.png', colour_index(ndvi, valid)),
        ]:
            save_image(name, rgb, valid)
            files.append(name)
        provenance.append(dict(id=source_id, sensor='Sentinel-2 L2A', date=source['properties']['datetime'],
                               url=S2 + source_id, offsetAlreadyApplied=source['properties'].get('earthsearch:boa_offset_applied'),
                               assets={k: dict(url=source['assets'][k]['href'], cropSha256=digest((CACHE / f'{source_id}-{k}.tif').read_bytes()), raster=source['assets'][k].get('raster:bands')) for k in bands}))
    pair_valid = optical[0]['valid'] & optical[1]['valid']
    vegetation = pair_valid & (optical[0]['scl'] == 4) & (optical[0]['ndvi'] > config['vegetationNdvi'])
    dnbr = optical[0]['nbr'] - optical[1]['nbr']
    dnbr[~pair_valid] = np.nan
    flagged = vegetation & (dnbr > config['changeDnbr'])
    fraction = float(pair_valid.sum() / inside.sum())
    if fraction < config['minimumValidFraction']:
        raise RuntimeError(f'Insufficient paired coverage: {fraction:.1%}. No result published.')
    raster(dnbr, OUT / 'dnbr.tif', grid)
    files.append('dnbr.tif')
    save_image('change.png', np.stack([np.where(flagged, 1, 0.12), np.where(flagged, 0.4, 0.27), np.where(flagged, 0.2, 0.21)], axis=-1), pair_valid)
    files.append('change.png')
    radar_sources = [item(source_id, S1, offline) for source_id in config['radar']]
    if len({(s['properties']['sat:relative_orbit'], s['properties']['sat:orbit_state']) for s in radar_sources}) != 1:
        raise RuntimeError('Radar orbit geometry differs.')
    for index, source in enumerate(radar_sources):
        channels = []
        for key in ['vv', 'vh']:
            linear = band_data(source, key, grid, offline)
            db = np.full(linear.shape, np.nan, dtype='float32')
            np.log10(linear, out=db, where=linear > 0)
            db *= 10
            db[~inside] = np.nan
            channels.append(db)
            tag = 'before' if index == 0 else 'after'
            name = f'{tag}-{key}.tif'
            raster(db, OUT / name, grid)
            files.append(name)
        vv, vh = channels
        valid = np.isfinite(vv) & np.isfinite(vh)
        colour = np.stack([np.clip((vv + 25) / 25, 0, 1), np.clip((vh + 32) / 25, 0, 1), np.clip((vv - vh) / 15, 0, 1)], axis=-1)
        name = f'{"before" if index == 0 else "after"}-radar.png'
        save_image(name, colour, valid)
        files.append(name)
        provenance.append(dict(id=source['id'], sensor='Sentinel-1 RTC', date=source['properties']['datetime'], url=S1 + source['id'],
                               relativeOrbit=source['properties']['sat:relative_orbit'], direction=source['properties']['sat:orbit_state'],
                               validFraction=float(valid.sum() / inside.sum()), assets={k: dict(url=source['assets'][k]['href'], cropSha256=digest((CACHE / f'{source["id"]}-{k}.tif').read_bytes())) for k in ['vv', 'vh']}))
    aoi = dict(type='Feature', properties=dict(id=config['id'], role='Exploratory analysis window'),
               geometry=rectangle(config['bbox']))
    (OUT / 'aoi.geojson').write_bytes(json.dumps(aoi, indent=2).encode('utf-8'))
    files.append('aoi.geojson')
    result = dict(schema='carbon-horizon-pilot/v1', config=config, grid=dict(crs=grid['crs'], resolution=resolution, width=grid['width'], height=grid['height'], bounds=[west,south,east,north], transform=list(grid['transform'])),
                  quality=quality, pairedValidFraction=fraction, analysisAreaHa=int(inside.sum()) * pixel_ha,
                  vegetationAreaHa=int(vegetation.sum()) * pixel_ha, flaggedAreaHa=int(flagged.sum()) * pixel_ha,
                  meanNdviBefore=float(np.nanmean(optical[0]['ndvi'][vegetation])), meanNdviAfter=float(np.nanmean(optical[1]['ndvi'][vegetation])),
                  method='SCL-masked NDVI/NBR; exploratory dNBR rule, no trained AI',
                  biomass=None, carbon=None, independentValidation=False, blockchain='Not anchored',
                  attribution='Contains modified Copernicus Sentinel data (2023). Optical via Element 84 Earth Search; Sentinel-1 RTC via Microsoft Planetary Computer (RTC processing: Microsoft, CC-BY-4.0).',
                  sources=provenance, files={name: digest((OUT / name).read_bytes()) for name in files},
                  configSha256=digest((ROOT / 'pipeline' / 'rhodes.json').read_bytes()),
                  codeSha256=digest(Path(__file__).read_bytes()),
                  software=dict(numpy=np.__version__, rasterio=rasterio.__version__, gdal=rasterio.__gdal_version__),
                  limitations=['Rectangle is not a forest inventory or official fire perimeter.', 'Flagged area is not validated burned area or carbon loss.', 'Optical and radar are aligned and displayed together; no learned sensor fusion has been evaluated.', 'No biomass inference, credit certification or public-chain anchoring.'])
    comparison_pixels = comparison & vegetation
    if comparison_pixels.any():
        result['comparisonWindow'] = dict(bbox=config['comparisonBbox'], vegetationAreaHa=int(comparison_pixels.sum()) * pixel_ha,
                                        meanNdviBefore=float(np.nanmean(optical[0]['ndvi'][comparison_pixels])),
                                        meanNdviAfter=float(np.nanmean(optical[1]['ndvi'][comparison_pixels])),
                                        flaggedAreaHa=int((comparison_pixels & flagged).sum()) * pixel_ha,
                                        note='Exploratory within-scene comparison window, selected visually; not independent validation or a certified control forest.')
    report_bytes = (json.dumps(result, indent=2, allow_nan=False) + '\n').encode('utf-8')
    # Build in the ignored staging directory: network/quality failures must not
    # overwrite the currently published pilot. Publish the report last.
    PUBLISHED.mkdir(parents=True, exist_ok=True)
    for name in files:
        (PUBLISHED / name).write_bytes((OUT / name).read_bytes())
    (PUBLISHED / 'result.json').write_bytes(report_bytes)
    print(json.dumps({key: result[key] for key in ['pairedValidFraction','vegetationAreaHa','flaggedAreaHa','meanNdviBefore','meanNdviAfter']}, indent=2), flush=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--offline', action='store_true', help='Rebuild from cached source crops without network access.')
    main(parser.parse_args().offline)
