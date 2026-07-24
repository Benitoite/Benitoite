# Hilbert3D website

This is the static GitHub Pages site for **Hilbert3D**, a real-time Hilbert
transform visualizer and pitch display for iPhone and iPad.

The production files belong in the `hilbert3D/` directory of the
[`benitoite/benitoite`](https://github.com/benitoite/benitoite) profile
repository.

## Publish with GitHub Pages

Copy `index.html`, `styles.css`, `script.js`, and `assets/` into the
`hilbert3D/` directory of the profile repository, then push its `master`
branch. The repository already supplies the root Pages configuration and custom
domain.

The published address will be:

`https://r42.us/hilbert3D/`

## Preview locally

From this directory:

```bash
python3 -m http.server 3000
```

Then open `http://localhost:3000`.

## App Store copy

`promo-text.txt` contains the long-form product copy. Its entire file is exactly
3,999 characters, including paragraph breaks and its final newline.

## Files

- `index.html` — complete page content and metadata
- `styles.css` — responsive visual system
- `script.js` — interactive Hilbert-style scope preview
- `assets/hilbert3d-icon.png` — app icon
- `assets/og.png` — 1,200 × 630 social-sharing card
- `promo-text.txt` — 3,999-character promotional description

There is no build step, package manager, server runtime, analytics script, or
external content dependency.
