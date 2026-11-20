# Capture — planche vs produit

Outil local (hors build applicatif) pour prouver l'ecart entre le design
verrouille (`G-DESIGN/planches/v2/*.html`) et le produit (app React).

Il rend les quatre ecrans verrouilles avec des donnees de fixture (meme seed
que le jour reel du run, statistiques de demonstration alignees sur les
planches), puis capture :

- `planche-<ecran>.png` : le cadre 740 x 560 de la planche ;
- `produit-<ecran>.png` : le cadre 740 x 560 du produit ;
- `compare-<ecran>.png` : les deux cotes a cotes.

## Usage

```bash
npx vite build --config vite.capture.config.ts
python -m http.server 8767 --bind 127.0.0.1 --directory capture/dist
node capture/compare.mjs <dossier-de-sortie>
node capture/inspect.mjs      # vidage de geometrie (verification numerique)
```

Fichiers :

- `index.html` / `main.tsx` : la page de capture (fixtures + ecrans) ;
- `compare.mjs` : capture planche + produit + collage ;
- `inspect.mjs` : controle de mise en page (positions, tailles, polices).

`capture/dist/` est genere, il n'est pas versionne.
