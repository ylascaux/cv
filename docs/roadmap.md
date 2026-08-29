# Plan de réalisation

## Objectif

Construire un CV bilingue à partir de données structurées, le valider automatiquement, le servir comme site statique et automatiser ensuite son déploiement avec GitHub Actions, Terraform et Terragrunt.

## État des lots

| Lot | Résultat attendu                                                   | État    |
| --- | ------------------------------------------------------------------ | ------- |
| 1   | Cadrage, architecture, décisions techniques et environnement local | Terminé |
| 2   | Modèle de contenu bilingue, schéma et validation                   | Terminé |
| 3   | Site statique Astro responsive et imprimable                       | Terminé |
| 4   | Tests, lint, accessibilité et génération PDF                       | Terminé |
| 5   | CI GitHub Actions                                                  | Terminé |
| 6   | Infrastructure Terraform/Terragrunt                                | À faire |
| 7   | Déploiement de préproduction puis production                       | À faire |

## Lot 1 — Cadrage

Décisions prises :

- un dépôt unique pour le contenu, le site et l’infrastructure ;
- Astro et TypeScript pour produire un site entièrement statique ;
- contenu YAML bilingue validé par JSON Schema ;
- GitHub Actions pour la CI ;
- Docker Compose comme première cible de déploiement local ;
- fournisseur cloud volontairement non choisi avant le lot infrastructure.

## Lot 2 — Contenu

Les contenus français et anglais sont stockés dans des fichiers YAML versionnés. Ils restent relisibles et modifiables, et sont validés avant chaque build.

## Lot 3 — Site

Le site :

- génère les routes `/` en français et `/en/` en anglais ;
- utilise les mêmes composants pour les deux langues ;
- reste lisible sans JavaScript côté client ;
- est responsive, accessible et imprimable ;
- est servi localement par `docker compose up --build`.

## Lots 4 et 5 — Qualité et intégration continue

Le projet applique Prettier et ESLint, puis Playwright contrôle les versions française et anglaise sur Chromium desktop et mobile. Axe vérifie automatiquement les règles d’accessibilité détectables.

Les PDF A4 sont générés par Chromium depuis le rendu statique et intégrés à l’artefact. GitHub Actions exécute les mêmes contrôles, publie l’artefact `dist/` et vérifie les images Docker, sans aucun déploiement.

## Prochain jalon

Choisir la cible d’hébergement, puis préparer l’infrastructure Terraform/Terragrunt et le déploiement continu avec une préproduction protégée.
