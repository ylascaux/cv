# ADR 0002 — Stocker le CV en YAML validé

- Statut : accepté
- Date : 2026-08-29

## Contexte

Le contenu doit être relisible en pull request, modifiable manuellement et compatible avec de futurs imports web/PDF.

## Décision

Utiliser un fichier YAML par langue, avec une structure identique validée par `content/schema.json`.

## Conséquences

- le contenu est indépendant des composants Astro ;
- une erreur structurelle bloque le build ;
- les imports futurs produiront un diff éditorial explicite ;
- le schéma et les types TypeScript devront évoluer ensemble ;
- les traductions restent volontairement explicites plutôt qu’automatiques.
