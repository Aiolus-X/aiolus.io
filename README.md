# Aiolus personal website

A dependency-free personal research website designed for GitHub Pages.

## Preview locally

```bash
python3 -m http.server 8000
```

Open <http://localhost:8000>.

## Structure

- `index.html` — site content and semantic structure
- `styles.css` — responsive layout, brand system, and transitions
- `app.js` — Canvas animations and interaction
- `logo.png` and `aiolus.png` — temporary emblem and wordmark supplied for the first visual pass
- `assets/visuals/earth-horizon-v2.webp` — splash-screen orbital photograph, NASA image `ISS073-E-0118626`
- `assets/visuals/earth-clouds-v2.webp` — lower-atmosphere cloud detail, NASA image `ISS048-E-002082`
- `assets/visuals/planet-night-v3.webp` — giant planet treatment built from NASA Blue Marble `GSFC_20171208_Archive_e002130`
- The intro slogan is “Decode the Universe, Encode a New One”; the supporting line is intentionally bilingual and can be edited in `index.html`.
- `assets/branding/` — earlier brand explorations retained for reference

The introductory scene supports click, mouse wheel, upward swipe, Enter, Space, Arrow Down, and Page Down.

The biography, project, publication, email, and research-copy sections currently contain placeholders and are ready to be replaced with real content.
