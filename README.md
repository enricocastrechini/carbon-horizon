# Carbon Horizon — React portfolio site

A responsive React + Vite portfolio page for presenting the Carbon Horizon executive-master capstone as a public-safe case study.

## Run locally

Requirements: Node.js 18 or newer.

```bash
npm install
npm run dev
```

Vite will print a local URL, usually `http://localhost:5173`.

To create and test the production build:

```bash
npm run build
npm run preview
```

## Publish with GitHub Pages

1. Create a public repository, for example `carbon-horizon`.
2. Upload the contents of this project to the repository root.
3. In GitHub, open **Settings → Pages**.
4. Under **Build and deployment**, choose **GitHub Actions**.
5. Add the workflow below as `.github/workflows/deploy.yml`.
6. Push to the `main` branch. The Actions workflow builds the site and deploys it to GitHub Pages.

Create `.github/workflows/deploy.yml` with:

```yaml
name: Deploy React site to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - name: Install dependencies
        run: npm install
      - name: Build
        run: npm run build
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v4
```

This uses a GitHub Actions deployment, so Vite's default root base path works for both a project repository and a user site.

## Before publishing

- Confirm that public disclosure of the project title and high-level concept is allowed. The source report was marked **Company Internal**.
- Do not upload the original report or presentation unless you have permission.
- Update the “My perspective” section to reflect your actual individual contribution. The current wording says your role focused on the technology dimension; refine it to describe what you personally owned.
- Carbon Horizon is presented as a strategic concept. Do not describe it as deployed, independently validated, or as having measured climate impact unless that becomes true.

## Notes

- The architecture diagram is authored as a React component using Lucide icons and CSS.
- Google Fonts are loaded remotely; if blocked, the page falls back to system fonts.
- The SDG link points to the official United Nations Sustainable Development Goals page.
