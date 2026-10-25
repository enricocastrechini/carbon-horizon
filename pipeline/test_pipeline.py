import unittest
import hashlib
import json
from pathlib import Path
import numpy as np
import rasterio
from run import normalized_difference, reflectance


class SpectralTests(unittest.TestCase):
    def test_zero_denominator_is_unavailable(self):
        result = normalized_difference(np.array([0., 0.6]), np.array([0., 0.2]))
        self.assertTrue(np.isnan(result[0]))
        self.assertAlmostEqual(float(result[1]), 0.5)

    def test_physical_reflectance_applies_scale_and_offset(self):
        asset = {'raster:bands': [{'scale': 0.0001, 'offset': -0.1}]}
        value = reflectance(np.array([3000.]), asset, {})
        self.assertAlmostEqual(float(value[0]), 0.2)

    def test_no_data_propagates(self):
        result = normalized_difference(np.array([np.nan]), np.array([0.2]))
        self.assertTrue(np.isnan(result[0]))


class PublishedPilotTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.root = Path(__file__).resolve().parents[1]
        cls.out = cls.root / 'public' / 'pilot'
        cls.result = json.loads((cls.out / 'result.json').read_text())

    def test_all_published_files_match_report(self):
        for name, expected in self.result['files'].items():
            with self.subTest(file=name):
                self.assertEqual(hashlib.sha256((self.out / name).read_bytes()).hexdigest(), expected)

    def test_all_geotiffs_share_grid(self):
        expected = self.result['grid']
        for path in self.out.glob('*.tif'):
            with self.subTest(file=path.name), rasterio.open(path) as src:
                self.assertEqual(src.shape, (expected['height'], expected['width']))
                self.assertEqual(src.crs.to_string(), expected['crs'])
                self.assertEqual(list(src.transform), expected['transform'])

    def test_change_area_is_computed_from_published_rasters(self):
        with rasterio.open(self.out / 'before-ndvi.tif') as src:
            ndvi = src.read(1, masked=True)
        with rasterio.open(self.out / 'dnbr.tif') as src:
            dnbr = src.read(1, masked=True)
        source = self.result['config']['optical'][0]
        with rasterio.open(self.root / '.cache' / 'rhodes' / f'{source}-scl.tif') as src:
            scl = src.read(1)
        flag = ((scl == 4) & (ndvi.filled(-9999) > self.result['config']['vegetationNdvi']) &
                (dnbr.filled(-9999) > self.result['config']['changeDnbr']))
        area = int(flag.sum()) * self.result['grid']['resolution'] ** 2 / 10000
        self.assertAlmostEqual(area, self.result['flaggedAreaHa'])

    def test_no_fabricated_biomass_or_validation(self):
        self.assertIsNone(self.result['biomass'])
        self.assertIsNone(self.result['carbon'])
        self.assertFalse(self.result['independentValidation'])


if __name__ == '__main__':
    unittest.main()
