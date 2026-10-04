# Akmaral-Project: water policy in Central Asia, visual / webpage

Build a visual web page presenting Akmaral's research on water policy in Central Asia.

## Status

Waiting on inputs. Nothing can be built until the three items below arrive.

## Expected inputs (drop them here)

| Item | Where it goes | Arrived |
|---|---|---|
| Research data (tables, spreadsheets, spatial files) | `inputs/data/` | [ ] |
| Template web page to follow | `inputs/template/` | [ ] |
| Co-worker's notebook using similar data | `inputs/reference_notebook/` | [ ] |
| Akmaral's text, paper or slides (if any) | `inputs/docs/` | [ ] |

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

## Build and preview

Static page, so a local server is enough:

    cd ~/Akmaral-Project/site && python3 -m http.server 8000

Then open http://localhost:8000
