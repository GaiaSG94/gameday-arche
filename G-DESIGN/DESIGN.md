# DESIGN — Arche · journal

> Tenu par Claude. Versions datées, jamais écrasées.

## LOCK · 2026-11-18 — style verrouillé

**Statut : verrouillé par Gaia (`/lock`, 2026-11-18).** Fin des explorations.

### Ce qui est figé
- Le style **Contour** tel que décrit dans `STYLE.md` (V2).
- Les 4 planches de référence : `planches/v2/01-post.html`, `02-jeu.html`, `03-carte-de-fin.html`, `04-series-classement.html`.
- Le format : desktop seul, zone de jeu 740 × 560 dans le post.

### Règles après le lock
- Plus de `/planches` ni de `/variantes` sur le style.
- Toute modification passe par `/delta` et crée une nouvelle version datée ici (V3…) ; les planches v2 ne sont jamais écrasées.
- Un nouvel écran (par exemple une page `Draft` si le draft a lieu avant la salle 1) se dessine dans ce style, sans en sortir.

### Toujours ouvert (produit, ne bloque pas le lock)
Les 5 questions listées en V2.1 : moment du draft, score, série après un échec, égalités, heure de la nouvelle seed. Elles peuvent changer le contenu des écrans, pas le style.

### Changelog
- 2026-11-18 · Style verrouillé.

## opencode — Revue d'implémentation (07b, 2026-11-20)

Implémentation du style verrouillé (Contour) dans le produit. Aucune nouvelle
direction : tokens, typo, composants et mouvement viennent de `STYLE.md` et des
planches `v2`. PR `GaiaSG94/gameday-arche#7` (mergée, CI verte), base `a2a0db5`.

### Écrans

| Page | Planche | Produit | Écart restant | Raison |
|---|---|---|---|---|
| Post | `planches/v2/01-post.html` | `views/PostView.tsx` (inline `splash.html`) | couloir de six arches en perspective, grand numéro du jour, 3 compteurs (joueurs, % salle six, compte à rebours), série de la semaine, CTA faits ; = 0 | — |
| Jeu | `planches/v2/02-jeu.html` | `views/RunView.tsx` + `components/Scene.tsx` | jetons de coût/récompense, sélection animée (pointillé + flèche), carte des salles avec la salle courante en flammes, aperçu de la perte `7 → 5`, reliques en cases, CTA faits ; = 0 (le HUD déborde de 22 px dans la planche elle-même, reproduit à l'identique) | — |
| Carte de fin | `planches/v2/03-carte-de-fin.html` | `views/EndView.tsx` | score au trait, torche, chemin 6 cases (arche + coût), histogramme **réel** avec la barre « YOU », rang, série +1, aperçu du commentaire, CTA faits ; = 0 | les planches montrent des données de démo, le produit affiche les données live (Redis) |
| Séries & classement | `planches/v2/04-series-classement.html` | `views/BoardView.tsx` | calendrier 4 semaines (jour joué plein, aujourd'hui à la flamme), classement avec le chemin de chacun en petites arches, ligne du joueur en blanc, chemins masqués si non joué, compteurs du jour faits ; = 0 | idem, données live |
| Draft (hors planches) | — | `views/DraftView.tsx` | écran autorisé par le LOCK (« un nouvel écran se dessine dans ce style »), même style | décision produit SPEC R1 |

Typo : **Ubuntu réellement embarquée** (`public/fonts/Ubuntu-*.woff2`, licence UFL
dans `public/fonts/UFL.txt`) — `STYLE.md` demande Ubuntu Sans, une seule famille ;
la Liberation Sans Narrow précédente (condensée) n'était pas la planche.

### Captures côte à côte planche | produit (1440 × 900) : `G-DESIGN/revue/`

Régénérables : `app/capture/README.md` (build capture → serveur statique →
`capture/compare.mjs`). Les captures produit rendent le produit réel (composants
React du dépôt, seed du jour, statistiques de démonstration alignées sur les
planches). Contrôle numérique de la mise en page : `capture/inspect.mjs` —
cadre 740 × 560, barre 48 px, scène 384 px, HUD 128 px, torche 10 × (17 × 30),
chemin 6 × (44 × 52), histogramme 332 × 140, calendrier 24 px, CTA 190 × 72,
chiffre de fond 330/800 : identiques aux planches.

### Écarts soumis à Gaia (aucun bloquant)

1. **Pastille d'effet** : `STYLE.md` §6 dit « pastille = effet prêt ». Les
   planches (données de démo hypothétiques, cf `PAGES.md`) la montraient sur
   l'Ember Ring ; implémenté selon le style : Salt Compass « −1 next », Ash Veil
   « +1 next », Ember Ring sans pastille (appliqué immédiatement).
2. **Commentaire** : la planche montre « Path ▇▇ hidden as a spoiler ». L'anti-
   spoiler du SPEC (aucune donnée de parcours divulguée, test dédié) est gardé :
   1ʳᵉ ligne alignée sur la planche, 2ᵉ ligne annonce le chemin masqué sans
   donnée.
3. **« Discuss today »** (page Séries) : sous-titre « One tap · adds a comment »
   au lieu de « Opens the comments » — l'iframe Devvit n'ouvre pas la page de
   commentaires ; l'action réelle est le commentaire pré-rempli.
4. **Hors produit** : le mock de feed et le `border-radius` des planches
   appartiennent au cadre Reddit ; non implémentables depuis l'app.

### Défauts de moteur corrigés au passage (l'UI disait une chose, le moteur une autre)

1. Le draft des reliques se faisait au mauvais moment (le client demandait les
   3 reliques d'un coup puis en redemandait → chemin rejeté `invalid run`) ;
   désormais avant les salles 1, 3 et 5, comme le SPEC et le serveur.
2. **Ash Veil** créditée à la salle suivante (son libellé et le SPEC le
   disaient), plus dans la salle du draft. Test dédié.
3. Une torche éteinte **dans la salle 6** n'est plus comptée comme une victoire.

Données serveur ajoutées pour le design : histogramme de la lumière par jour
(`arche:hist:`), chemin de chaque joueur (`arche:paths:`, classement +
anti-spoiler), heure de fin (`arche:times:`, départage des égalités — même
lumière = même rang), jours joués (`arche:days:`, calendrier + points semaine).

Gates : `npm test` 11/11, types OK, lint 0 erreur (1 warning react-refresh
préexistant), build OK, check-limits 0.

## V2.1 · 2026-11-18 — style validé, déclinaison des pages

**Statut : les 4 pages sont validées par Gaia (2026-11-18).** Style verrouillé ensuite (voir LOCK). Les questions produit ci-dessous restent ouvertes.

### Livré
- `STYLE.md` : palette, typo, grille 740 × 560, épaisseurs, composants, mouvement, états, ton. Tiré de la planche `Jeu` V2 validée.
- `planches/v2/01-post.html` : le post avant de jouer. Couloir de six arches en perspective, grand « 12 » du jour, trois compteurs communautaires (joueurs, % arrivés en salle six, compte à rebours), série, bouton « Light the torch ». Vignette de contexte dans le feed.
- `planches/v2/03-carte-de-fin.html` : salle six atteinte. Score = lumière restante (grand « 4 »), chemin en six cases, histogramme de la communauté avec ta barre pleine, rang, série +1, aperçu du commentaire en un tap (chemin en spoiler). Variante : torche éteinte en salle 4.
- `planches/v2/04-series-classement.html` : série (calendrier de quatre semaines, aujourd'hui avec la flamme) et classement du jour (chemin de chacun en petites arches, ta ligne en blanc plein). Variante : premier jour, pas encore joué, chemins masqués.

### Décisions
- Chaque planche montre un état principal à 100 % et un deuxième état (ou le contexte du feed) en vignette.
- Le chemin d'un joueur est un spoiler : masqué dans le commentaire partagé et dans le classement tant qu'on n'a pas joué.
- Le chiffre de fond au trait change de sens selon la page : salle (Jeu), jour (Post), score (Carte de fin), série (Séries).

### Questions produit ouvertes
1. Le draft des reliques : avant la salle 1 (page `Draft` en plus) ou pendant les salles ?
2. Le score = la lumière restante en salle six, seulement ?
3. La série continue-t-elle si la torche s'éteint ?
4. Départage des égalités au classement.
5. Nouvelle seed à heure fixe pour tout le monde (compte à rebours) ?

### Changelog
- 2026-11-18 · `STYLE.md` créé ; planches Post, Carte de fin, Séries & classement en V2.
- 2026-11-18 · Post, Carte de fin, Séries & classement validées par Gaia.

## V2 · 2026-11-18 — Contour retenu, version gamifiée (page `Jeu`)

**Statut : validée par Gaia (2026-11-18).** Planche : `planches/v2/02-jeu.html`. La V1 reste intacte dans `planches/v1/`.

### Décisions de Gaia
- **Direction retenue : 03 Contour.** 01 Lueur et 02 Brume sont abandonnées.
- **Traits blancs à épaissir.**
- **Rendre le jeu visuellement plus « jeu ».**
- **Desktop seul, pas de version mobile.** Cela remplace le §6 du brief (qui imposait les deux cadres) pour la suite.

### Ce qui change
- Épaisseurs : arches 4 px, silhouette, cases et jetons 3 px, contour du grand « 3 » 2,5 px, filet blanc de 3 px au-dessus du HUD (V1 : 1 à 1,5 px).
- Jetons de coût ronds au-dessus des arches (−1 ; −3 et +5 en blanc plein pour la récompense), avec une petite flamme : l'orange signifie toujours « lumière ».
- Sélection animée : arche pleine, contour pointillé qui défile, flèche qui rebondit au-dessus.
- Aperçu de la conséquence : le segment de torche qui va s'éteindre clignote en hachures, compteur « 7 → 6 ».
- Le rail 01 → 06 devient une carte de six petites arches reliées (passées pleines, actuelle avec la flamme, à venir en gris).
- Reliques en cases d'inventaire 56 px avec ombre portée dure ; relique utilisée barrée ; effet prêt signalé par une pastille (« +1 next »).
- Bouton d'action en bloc blanc avec ombre portée dure qui s'enfonce au clic, rappel du choix et du coût dessous.
- Décor au trait : sol en perspective, marches qui plongent dans l'eau, trois lignes de vagues.
- Le jeu est montré à 100 % (740 × 560) dans son post ; le feed complet n'apparaît plus qu'en vignette de contexte.
- Animations coupées si l'utilisateur demande moins de mouvement (`prefers-reduced-motion`).

### Changelog
- 2026-11-18 · V2 créée (Contour gamifié, desktop seul).

## V1 · 2026-11-18 — exploration du style (page principale `Jeu`)

**Statut : en attente de validation de Gaia.** Rien n'est verrouillé ; `STYLE.md` sera écrit après le choix.

### Livré
- `PAGES.md` : 4 pages proposées (Post, Jeu, Carte de fin, Séries & classement) + 1 question ouverte (où a lieu le draft des reliques).
- `REFS.md` : décodage d'Igloo et de Defy the Current.
- `planches/v1/01-lueur.html`, `02-brume.html`, `03-contour.html` : trois directions sur la page `Jeu`, chacune en desktop 1440 × 900 (état « arche choisie ») et mobile 390 × 844 (état « rien de choisi »), dans le cadre d'un post de feed.

### Les 3 directions
| # | Nom | Palette | Typo | Motif |
|---|-----|---------|------|-------|
| 01 | Lueur | noir `#0b0b0d`, brume `#2a2622`, flamme `#e8a33d` | sans condensée large en capitales | halo de torche, arches = vides noirs, silhouette à contre-jour |
| 02 | Brume | brouillard `#a9adb5`, encre `#141519`, braise `#d97a26` | sans fine + mono minuscule | portes monolithes dans la brume, seule la flamme est chaude |
| 03 | Contour | `#000` / `#fff` / `#9c9c9c`, flamme `#e8a33d` sur la flamme seule | sans grasse, contour vs plein | dessin au trait, grand « 3/6 » en contour, rail 01 → 06 |

02 est la direction qui s'écarte du brief (abandon du noir).

### Décisions et constats
- **dfy.co est un domaine parqué** : la réf n'existe plus que sur sa fiche Awwwards 2018, et sa palette est noir/gris/blanc, **sans accent chaud**. L'accent flamme reste un choix du brief, pas un emprunt.
- **igloo.inc ne s'affiche pas** dans le navigateur utilisé (crash de la scène 3D) ; analysé via la fiche archivée. La réf est **claire et brumeuse**, pas sombre.
- Les mêmes données de démo dans les trois planches, pour comparer le style seulement. Règle de démo (lumière de torche, coût par arche) = hypothèse, voir `PAGES.md`.
- Polices : uniquement des polices système (Ubuntu Sans / Ubuntu Sans Mono, repli sans-serif) pour que tout s'ouvre hors ligne. Le rendu exact dépend de la machine ; la police finale (libre, embarquée dans l'app à cause de la CSP Devvit) sera fixée dans `STYLE.md`.
- Chrome du feed volontairement neutre (pas de logo, pas de Snoo, pas de karma) : seul le jeu porte une identité.
- Sur le post desktop (740 px de large), la jauge de torche passe en haut à droite de la scène ; sur mobile elle rejoint la barre du bas.

### Changelog
- 2026-11-18 · V1 créée.
