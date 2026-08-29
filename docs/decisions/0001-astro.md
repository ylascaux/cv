# ADR 0001 — Utiliser Astro pour le site statique

- Statut : accepté
- Date : 2026-08-29

## Contexte

Le CV doit être statique, rapide, bilingue, accessible, imprimable et alimenté par des données séparées de la présentation.

## Décision

Utiliser Astro avec TypeScript strict et sans composant hydraté par défaut.

## Conséquences

- le résultat est du HTML/CSS statique avec très peu de JavaScript ;
- les routes linguistiques sont générées pendant le build ;
- les composants de présentation peuvent être partagés ;
- Node.js est requis pour développer et construire, mais pas pour servir le résultat ;
- tout ajout de framework client devra répondre à un besoin démontré.
