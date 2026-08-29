# ADR 0003 — Commencer par un déploiement Docker Compose local

- Statut : accepté
- Date : 2026-08-29

## Contexte

La CI utilisera GitHub Actions, mais aucun fournisseur cloud n’est encore choisi. Il faut néanmoins valider le build et le mode de service du site.

## Décision

Construire le site versionné dans une image multi-stage et servir l’artefact statique avec Nginx via Docker Compose. Ajouter un second service local `preview` pour travailler sur le rendu Astro et générer les PDF à partir des mêmes contenus versionnés.

## Conséquences

- `docker compose up --build` expose l’image statique sur `4321` et la preview de travail sur `4322` ;
- l’image finale ne contient ni Node.js ni les sources ;
- Docker Compose est une cible locale, pas une architecture de production imposée ;
- Terraform et Terragrunt ne seront ajoutés qu’après le choix documenté de l’hébergeur.
