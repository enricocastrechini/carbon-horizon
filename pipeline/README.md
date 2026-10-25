# Reproducible Rhodes pilot

This pilot implements the first real optical/radar processing slice of the
Carbon Horizon study. The selected event is the July 2023 Rhodes wildfire,
documented by [Copernicus EMS](https://mapping.emergency.copernicus.eu/activations/EMSN159/).
The analysis rectangle is exploratory, not an official fire perimeter or a
certified forest-carbon project. Event documentation is not pixel-level training data.

## Run on Windows

Python 3.14 was used for the pinned library versions. From the repository root:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r pipeline/requirements.txt
.\.venv\Scripts\python.exe pipeline/run.py
.\.venv\Scripts\python.exe -m unittest discover -s pipeline -p 'test_*.py'
npm ci
npm run demo:receipt
npm run build
```

The first processing run needs network access. It reads bounded windows from
Cloud Optimized GeoTIFFs, rather than downloading entire tiles. Cached source
crops and metadata are in `.cache/rhodes/`, which is excluded from Git. Rebuild
from those exact inputs without network access:

```powershell
.\.venv\Scripts\python.exe pipeline/run.py --offline
npm run demo:receipt
```

Outputs are staged under `.cache/rhodes-output/` and published only after the
full calculation succeeds; the report is written last. A failed input download
or coverage check therefore leaves the previous published pilot intact.

Regenerate the receipt after changing the report. The frontend suppresses a
receipt whose report digest does not match. Source/crop cache entries are tied
to scene IDs, band names and a fixed grid. Changing the area/grid needs a fresh
cache directory (rename the existing cache if it must be retained).

## Inputs and processing

- Sentinel-2 Collection 1 L2A: 8 July and 2 August 2023, tile 35SNA.
- Sentinel-1 RTC: 17 and 29 July 2023, relative orbit 36, descending, VV/VH.
- Fixed polygon in [rhodes.json](./rhodes.json); EPSG:32635, 20 m grid.
- Optical continuous bands resampled bilinearly; SCL resampled with nearest
  neighbour. A pixel-centre AOI mask excludes the envelope outside the polygon.
- Physical reflectance uses each Collection 1 asset's scale and offset. The
  older Earth Search collection is avoided because offset metadata can be
  ambiguous; do not reuse its conversion rules blindly.
- SCL classes 4, 5 and 6 are allowed for optical indices; all other classes,
  invalid bands and undefined ratios are excluded. Cloud-edge dilation is not
  implemented. Low paired coverage stops the calculation.
- NDVI: `(B08 - B04) / (B08 + B04)`.
- NBR: `(B08 - B12) / (B08 + B12)`; dNBR is before minus after.
- Vegetation candidates: pre-event SCL class 4 and NDVI > 0.35, valid on both dates.
- Candidate change: dNBR > 0.27 within those vegetation pixels. These exploratory
  thresholds have not been tuned against independent labels or validated as burn severity.
- Radar RTC gamma-nought linear values are converted to dB, aligned and displayed.
  There is no trained optical/radar fusion or claim of continuous sensing.

RGB and false-colour previews use a fixed stretch across dates. NDVI uses a
fixed colour scale. Radar uses fixed VV/VH/difference display ranges. Invalid
pixels are dark; they are not unburned pixels. The change layer is a binary
candidate flag, not a probability or a measured carbon result.

The extra comparison window in the northwest is a visually selected within-scene
check. Its statistics are exported, but it is not independently validated as a
stable forest and is not a held-out evaluation dataset.

## Outputs and provenance

[public/pilot](../public/pilot/) contains display layers, quantitative GeoTIFFs,
AOI GeoJSON, the result report and local-contract receipt. The report records
source catalogue URLs, acquisition dates, crop checksums, conversion metadata,
grid, parameters, quality statistics, code/config hashes, software versions and
output checksums. No signed asset tokens or private credentials are saved.

`result.json` is deterministic for the same cached inputs, configuration and
processing version. Float values are exported without rounding; the UI rounds
only for display. Hectares are computed from flagged pixel counts on the
projected 20 m grid, not from image dimensions in browser pixels.

The frontend verifies every listed output file against the report. This detects
inconsistency with the bundled report, not substitution of an entire bundle by
an attacker who can replace both the files and their manifest.
The exported evidence includes `reportSerialized`: hash its exact UTF-8 bytes to
verify `reportSha256`. Reformatting a JSON object can change its byte digest.

## Local contract execution

[EvidenceRegistry.sol](../contracts/EvidenceRegistry.sol) is compiled and executed
with signed transactions in locally built EthereumJS EVM blocks, chain ID 1337.
`npm run demo:receipt` writes the receipt; `npm run test:contract` reruns the tests.
The latter also checks every published file hash and reproduces the saved
transaction receipts; the GitHub Pages workflow runs this check before building.
The in-memory chain is discarded after the process; the saved transaction hashes
cannot be looked up on a public explorer. No RPC service or wallet is required.

The test demonstrates anchoring, reviewer approval, issuance of one arbitrary
test unit and retirement. It checks missing evidence, empty/duplicate digests,
reviewer-only operations, zero units, repeated issuance, evidence reuse under
another project key and reuse after retirement. The evidence digest is SHA-256
of the exact report bytes, stored in a Solidity `bytes32`.

Test units carry no certified carbon value. The contract is a prototype, without
transfers, key rotation, accredited identities, methodology validation, reversal
handling or cross-registry double-counting controls. Project/vintage identity
is a test key; real boundary overlap and project identity require governance.

## Remaining scientific work

The UI deliberately exports `biomass: null`, `carbon: null` and
`independentValidation: false`. Next acquire appropriate independent disturbance
labels and biomass references for the area and dates. Only then train/evaluate
the study's random forest and CNN with geographic/temporal separation and
uncertainty reporting. Do not train on this dNBR rule and present agreement with
the same rule as independent accuracy. Biomass, carbon-stock change and eligible
credits require different validation steps.
