# PAGES — Arche

> Version V1 · 2026-11-18 · proposé par Claude, **à valider par Gaia**.
> Le nombre de pages découle de la boucle décrite dans `IDEE.md` (draft → 6 salles → carte de fin → série/classement) et des 4 critères Stage 2.
> ~~Chaque planche montre deux cadres : desktop 1440 × 900 et mobile 390 × 844 (§6 du brief).~~
> **Depuis V2 (2026-11-18, décision de Gaia) : desktop 1440 × 900 seul, pas de version mobile.** Style retenu : Contour.

| # | Page | Rôle | Contenu clé | Critère servi | Statut |
|---|------|------|-------------|---------------|--------|
| 1 | **Post** | Ce que le joueur voit en scrollant le feed, avant de toucher | En-tête du post (sub, titre du jour), aperçu de la salle du jour, numéro du jour, nombre de joueurs du jour, bouton d'entrée | Daily Content, Delightful UX | à dessiner |
| 2 | **Jeu** (page principale) | Traverser une salle : choisir une arche | Salle n/6 et son nom, deux arches avec leur coût, torche (lumière restante), 3 reliques, une seule règle affichée, bouton de confirmation | Delightful UX, Polish | **en revue (v2 Contour gamifié)** |
| 3 | **Carte de fin** | Résultat, série, invitation à commenter | Résultat (atteint la salle 6 ou non, lumière restante), série de jours, comparaison avec la communauté, prompt de commentaire en un tap | Reddit-y, Daily Content | à dessiner |
| 4 | **Séries & classement** | Revenir demain | Série perso, classement du jour sur la seed partagée, historique court | Reddit-y | à dessiner |

## Question ouverte (décision produit, je ne tranche pas)

**Le draft des reliques** : `IDEE.md` dit « draft relics then walk ». Le draft a-t-il lieu **avant** la salle 1 (écran à part → une 5ᵉ page `Draft`) ou **dans** les salles (une relique gagnée de temps en temps → reste dans `Jeu`) ? Les planches v1 montrent les 3 reliques déjà draftées, donc compatibles avec les deux options.

## Hypothèses de démo (à confirmer, utilisées seulement pour remplir les planches)

`IDEE.md` ne fixe pas les règles fines. Pour avoir de vraies données et de vrais états, les 3 planches utilisent la même hypothèse :
- une ressource **lumière de torche** (10 max) ; chaque arche coûte de la lumière ; à 0 la partie s'arrête ;
- règle affichée : « Choose an arch. Reach room six with your torch still lit. » ;
- reliques de démo : Ember Ring, Salt Compass, Ash Veil (noms et effets jetables).
Si la vraie règle diffère, seul le contenu change ; le système visuel reste.
