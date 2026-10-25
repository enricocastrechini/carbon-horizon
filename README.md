# 🌍 Carbon Horizon
> Expanding The Frontier Of Trusted Climate Solutions. A responsive React + Vite portfolio page for presenting the Carbon Horizon executive-master capstone as a public-safe case study.

## Overview

Carbon Horizon is an executive-master strategic study of a digital Monitoring,
Reporting and Verification (d-MRV) platform. It explores how satellite Earth
observation, artificial intelligence and digital traceability could support
trusted climate information and auditable reporting workflows.

The repository combines the public case study with a working Rhodes 2023 pilot.
It distinguishes the proposed platform from the capabilities actually demonstrated.

## Core Features

- **Automated Data Acquisition (Sensor Fusion):** The study proposes combining
  Sentinel-2 optical imagery with Sentinel-1 radar. The pilot retrieves and aligns
  real optical bands and corrected radar observations; learned sensor fusion and
  continuous coverage have not been validated.
- **AI-Powered Processing:** The proposed architecture draws on Leonardo's
  davinci-1 HPC capabilities, random-forest biomass regression and CNN change
  detection. The current pilot implements a reproducible spectral baseline;
  trained AI, biomass estimation and HPC deployment remain future work.
- **Blockchain Integrity Layer:** A Solidity prototype registers a report digest,
  records a test review and issues/retires a test unit. Actual signed transactions
  were executed on a local EVM. Units have no certified carbon value; the demo
  does not claim public-chain anchoring or cross-registry double-counting prevention.
- **Regulatory Compliance-by-Design:** The case study explains EU ETS, maritime
  reporting, CRCF and the roles of public institutions. It presents regulatory
  alignment as a design requirement rather than claiming certified compliance.

## Guided Feasibility Demo

The walkthrough follows six steps: source, comparison, coverage, calculation,
live file verification and recorded contract lifecycle. Every step explains the
visitor action, expected observation and the limits of the evidence.

Users can verify all 21 output files and edit a value in a report copy to observe
its different SHA-256 fingerprint. These checks run in the browser. Satellite
processing and local EVM transactions are explicitly labelled as precomputed
or recorded.

[Reproduce the data pipeline and contract execution](pipeline/README.md).
[Read the source-material analysis and next experiments](docs/FEASIBILITY-DEMO.md).

## Technology Stack

- React 18, Vite, Lucide icons and custom responsive CSS.
- Python, NumPy and Rasterio for geospatial processing; Pillow for display layers.
- Solidity, EthereumJS EVM and ethers for local execution and contract tests.
- GitHub Actions verifies pilot outputs and contract execution, then builds and
  deploys the frontend to GitHub Pages.

## Development & Setup

Use Node.js 20 or newer for the frontend and local-contract tooling.

```bash
npm ci
npm run dev
```

Run the local contract checks and production build:

```bash
npm run test:contract
npm run build
npm run preview
```

To regenerate the saved local execution receipt:

```bash
npm run demo:receipt
```

Python processing requirements and commands are in the [pipeline guide](pipeline/README.md).
The existing Pages workflow is [.github/workflows/deploy.yml](.github/workflows/deploy.yml).
Vite uses `base: '/carbon-horizon/'`; change it when publishing under a different
repository path or a custom domain.

## 👥 Project Team
* Alberto Schierano
* Alessandro Rossi
* Enrico Castrechini
* Jacob Pompe
* Nicolò Raponi

## Before publishing


- Confirm that public disclosure of the project title and high-level concept is allowed. The source report was marked **Company Internal**.
- Do not upload the original report or presentation unless you have permission.
- The project section credits the five authors listed in the materials. Add individual contributions only when confirmed by the relevant author.
- Carbon Horizon is presented as a strategic concept. Do not describe it as deployed, independently validated, or as having measured climate impact unless that becomes true.

## Notes

- The interactive experience in `src/Experience.jsx` highlights five team workstreams. `src/PilotLab.jsx` presents the real Rhodes 2023 pilot: aligned Sentinel-2 bands, Sentinel-1 RTC, NDVI/NBR, a spectral-change baseline, output verification and a downloadable evidence bundle.
- The lab is a six-step guided walkthrough: source → comparison → coverage → calculation → live file verification → recorded contract lifecycle. Each step states the question, visitor action, expected observation and limits of the evidence. The last step requires an actual successful file check; navigation alone is never presented as verification.
- Visitors can deliberately change one numeric result in an in-memory report copy and compute its different SHA-256 fingerprint. The original report stays intact. Per-file progress comes from completed browser checks, and the export includes those results and the edited-copy test if performed.
- Satellite processing and EVM execution are explicitly labelled as precomputed/recorded. Only fingerprint checks and the edited-copy test execute in the browser. The final summary distinguishes checks performed in the current session from saved evidence and unfinished scientific work.
- [Run the reproducible pipeline](pipeline/README.md) to regenerate the layers and the actual local-EVM contract execution receipt. `npm run test:contract` tests the Solidity lifecycle; `npm run demo:receipt` also saves its receipt. No public-chain transaction or trained AI inference is claimed.
- The proposed progression to independently evaluated AI, biomass estimation and public testnet anchoring is documented in [the feasibility demo plan](docs/FEASIBILITY-DEMO.md).
- The earlier Tuscany preview fixtures are retained as a data-access example under `public/demo/`; they are no longer the active lab. Refresh them with `python scripts/fetch-scenes.py` (Python 3; network access needed).
- The case study is based on the supplied *Carbon Horizon — Expanding the Frontier of Trusted Climate Solutions* final report and 26-slide presentation. Original documents are not bundled with the site.
- `src/Strategy.jsx` contains regulatory market tabs, stakeholder and revenue models, the three-phase adoption strategy and expandable validation gates. Source sections and slide numbers are shown alongside the new content.
- The architecture describes Sentinel-1/2 sensor fusion, proposed random-forest and CNN models, and blockchain traceability. Coverage, accuracy, certification and commercial outcomes are presented as requiring validation.
- EU ETS allowances, voluntary credits and CRCF certification are distinguished; digital records alone do not establish physical carbon outcomes or eligibility for issuance.
- Regulatory tabs support arrow keys, Home and End. Mobile navigation supports Escape and closes after selecting a section. A skip link, visible focus indicators and reduced-motion support are included.
- The architecture diagram is authored as a React component using Lucide icons and CSS.
- Google Fonts are loaded remotely; if blocked, the page falls back to system fonts.
- The SDG link points to the official United Nations Sustainable Development Goals page.