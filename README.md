# 🌍 Carbon Horizon
> Expanding The Frontier Of Trusted Climate Solutions. A responsive React + Vite portfolio page for presenting the Carbon Horizon executive-master capstone as a public-safe case study.

## 📖 Overview
Carbon Horizon is a Digital Monitoring Reporting Verification (d-MRV) platform designed to replace manual, error-prone carbon verification with an automated, industrial-scale operation. By leveraging space-based earth observation technologies, artificial intelligence, and blockchain, it delivers trusted, transparent, and verifiable climate performance measurements aligned with European regulatory frameworks. 

The platform addresses the fragmentation of current carbon credit ecosystems and evaluates whether estimated emissions remain under regulated thresholds to facilitate the monetization of verified carbon performance.

## ✨ Core Features
* **Automated Data Acquisition (Sensor Fusion):** Combines Sentinel-2 optical imagery (for vegetation indices and chlorophyll content) with Sentinel-1 Synthetic Aperture Radar (SAR) to penetrate cloud cover, guaranteeing continuous, all-weather monitoring of biomass and land-use changes.
* **AI-Powered Processing:** Utilizes High Performance Computer (HPC) alongside artificial intelligence models. It applies random-forest regression for autonomous biomass calculation and Convolutional Neural Networks (CNN) for environmental change detection.
* **Blockchain Integrity Layer:** Acts as a digital notary by generating a unique digital token via a smart contract for every verified ton of sequestered carbon, ensuring data immutability and permanently eliminating the risk of double-counting.
* **Regulatory Compliance-by-Design:** Supports the EU Emissions Trading System (EU ETS), including maritime transport, and aligns with the Carbon Removal Certification Framework (CRCF) and national bodies like MASE and ISPRA.

## 🛠️ Technology Stack
* **Frontend Framework:** Built with React (v18.x) and bundled via Vite for a fast, modern user interface.
* **Styling & Assets:** Custom interface styling integrated via `styles.css` and main application logic in `App.jsx`.
* **Continuous Integration:** Features an automated GitHub Actions deployment pipeline (`deploy.yml`) for seamless updates to GitHub Pages.

## 🚀 Development & Setup
To run the Carbon Horizon frontend locally:

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the development server:**
   ```bash
   npm run dev
   ```
3. **Build for production:**
   ```bash
   npm run build
   ```

## 👥 Project Team
* Alberto Schierano
* Alessandro Rossi
* Enrico Castrechini
* Jacob Pompe
* Nicolò Raponi
