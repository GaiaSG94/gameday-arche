# STYLE — Arche · Contour

> V2 · 2026-11-18 · Claude. Style validé par Gaia sur la page `Jeu` (`planches/v2/02-jeu.html`).
> Référence unique pour toutes les planches suivantes : on ne s'en écarte pas sans nouvelle version.
> Cadre : post interactif dans le feed desktop, zone de jeu **740 × 560**. Desktop seul (décision de Gaia, V2).

## 1. Principe

Un dessin au trait blanc épais sur noir. **Plein = ce qui compte maintenant** (choix, case remplie, salle passée), **contour = le reste** (options, futur). La seule couleur est l'orange de la flamme, et l'orange veut toujours dire **lumière de torche**.

## 2. Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | `#000000` | fond du jeu, intérieur des jetons et des cases |
| `--w` | `#ffffff` | traits, texte principal, éléments pleins (choisi, gagné, bouton) |
| `--g` | `#9c9c9c` | texte secondaire, passé, ombre portée du bouton |
| `--d` | `#3d3d3d` | futur, désactivé, utilisé, ombre portée des cases |
| `--l` | `#2b2b2b` | filets de structure discrets (sous la barre du haut) |
| `--flame` | `#e8a33d` | **flamme uniquement** : torche, mini-flamme des jetons de coût, salle actuelle, libellé « Torch » |

Interdit : tout autre teinte, tout dégradé coloré, tout halo lumineux. Les hachures blanc/noir sont le seul motif.

## 3. Typo

Une famille : **Ubuntu Sans** (repli `Inter`, `Segoe UI`, `Roboto`, `system-ui`). Pour l'app Devvit, la police sera embarquée (licence libre, CSP sans requête externe).

| Rôle | Taille / graisse | Détails |
|------|------------------|---------|
| Grand chiffre de fond | 330 px / 800 | contour 2,5 px `rgba(255,255,255,.2)`, remplissage transparent |
| Titre d'écran | 34 px / 800 | interlettrage −0,03 em, interligne 1 |
| Chiffre de compteur | 30 px / 800 | |
| Bouton | 15 px / 800 | capitales, +0,06 em |
| Jeton | 15 px / 800 | centré |
| Texte courant / règle | 12,5 px / 400 | `--g`, interligne 1,4 |
| Étiquette / chip | 10,5–11 px / 700 | capitales, +0,14 à +0,18 em |
| Nom sous case | 10,5 px / 700 | |

## 4. Grille de la zone de jeu (740 × 560)

- Barre du haut **48 px** (wordmark · chip du jour · chip communauté), filet 2 px `--l`.
- Zone centrale flexible.
- Barre du bas (HUD) **128 px**, filet **3 px blanc** au-dessus, colonnes 232 / 1fr / 196, gouttière 22.
- Marges latérales **24 px**, tout s'aligne dessus.
- Pas de 4 px pour les espacements.

## 5. Traits

| Élément | Épaisseur |
|---------|-----------|
| Arches, structure principale | 4 px |
| Silhouette, cases, jetons, cartes de salle, cadres | 3 px |
| Contour du grand chiffre, panneaux, segments | 2,5 px |
| Décor (sol, vagues, perspective) | 2–3 px à 12–50 % d'opacité |

Coins **toujours droits** (rayon 0). Jointures arrondies sur les tracés SVG.

## 6. Composants

- **Arche** : tracé 4 px. Choisie = remplie de blanc + contour pointillé 2,5 px qui défile, décalé de 8 px.
- **Jeton** : cercle r 21, fond noir, trait 3 px, chiffre 15/800. Récompense = jeton plein blanc, chiffre noir. Coût en lumière = mini-flamme au-dessus du chiffre.
- **Panneau** : rectangle 26 px de haut, trait 2,5 px. Actif = plein blanc, texte noir.
- **Torche** : 10 segments 17 × 30, écart 4, trait 2,5 px. Allumé = blanc plein ; éteint = contour `--d` ; perte prévue = hachures qui clignotent.
- **Case d'inventaire** : 56 × 56, trait 3 px, ombre portée dure 4/4 `--d`. Utilisée = trait `--d`, barre diagonale, nom barré. Pastille d'effet = étiquette blanche pleine 10/800.
- **Carte des salles** : six petites arches reliées par un trait 3 px. Passée = pleine, actuelle = plus grande + flamme, future = contour `--d`. Numéros 01–06, passés barrés.
- **Bouton principal** : bloc blanc, texte noir, ombre portée dure 6/6 `--g` ; au clic il s'enfonce (translation 6/6, ombre nulle). Ligne secondaire 11/600 `--d`.
- **Bouton secondaire** : contour 3 px blanc, fond noir, même hauteur, pas d'ombre.
- **Chip** : 26 px de haut, trait 2 px. Communauté = trait `--d`, point blanc.
- **Silhouette** : remplie de noir, trait blanc 3 px, flamme orange.

## 7. Mouvement

| Quoi | Animation |
|------|-----------|
| Contour de sélection | pointillé qui défile, 1,2 s linéaire, en boucle |
| Flèche de sélection | rebond 7 px, 0,9 s, aller-retour |
| Flamme | vacille (échelle + inclinaison), 0,35 s, aller-retour |
| Perte prévue | clignote, 1 s en 2 étapes |
| Bouton | enfoncement 0,1 s |

Tout est coupé avec `prefers-reduced-motion: reduce`. Pas d'autre animation décorative.

## 8. États

| État | Règle |
|------|-------|
| Par défaut / option | contour blanc |
| Sélectionné / actif | plein blanc + indicateur animé |
| Passé / acquis | plein blanc ou gris `--g` barré selon le contexte (salle passée : pleine ; numéro : barré) |
| Futur / verrouillé | contour `--d` |
| Désactivé / utilisé | `--d`, barré |
| Perte imminente | hachures clignotantes |
| Échec (torche éteinte) | la flamme disparaît, le chiffre de fond passe en `--d` |

## 9. Ton des textes

Anglais, phrases courtes, verbes d'action (« Walk through », « Light the torch »). Pas d'emoji, pas de jargon fantasy, pas de référence à Reddit (karma, Snoo).
