# Akmaral-Project: water law of Kazakhstan, visual web page

A visual web page presenting Akmaral's research on water governance in Kazakhstan.

## Status

First version is live at https://gunjuzone.github.io/kz-water-governance/ and is waiting for Akmaral's review.
The data covers Kazakhstan only (Water Code 2025 and Ecological Code 2021).

## Inputs

| Item | Where it is |
|---|---|
| Coding book and supplementary material | `inputs/data/` |
| Template (Pachama screenshot) | `inputs/template/` |
| Co-worker's notebook | `inputs/reference_notebook/` |

Inputs stay untouched as received. All cleaning and derived files go to `work/` or `site/data/`.

## Layout

| Folder | Purpose |
|---|---|
| `inputs/` | Everything provided, exactly as received. Read-only by convention. |
| `work/notebooks/` | Our exploration and data prep notebooks |
| `work/scripts/` | Reusable conversion and build scripts |
| `site/` | The web page itself: HTML, `assets/`, and `data/` it loads |
| `outputs/figures/` | Static chart exports (PNG/SVG) for slides or the paper |
| `notes/` | Decisions, questions for Akmaral, meeting notes |

## Build, preview and publish

    python3 work/scripts/build_data.py                      # inputs -> site/data/data.json
    cd site && python3 -m http.server 8000                  # preview at http://localhost:8000
    work/scripts/deploy.sh                                  # publish site/ to GitHub Pages
