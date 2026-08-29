# Plan de réalisation

## Objectif

Construire un CV bilingue à partir de données structurées, le valider automatiquement, le servir comme site statique et automatiser ensuite son déploiement avec GitHub Actions, Terraform et Terragrunt.

## État des lots

| Lot | Résultat attendu                                                   | État    |
| --- | ------------------------------------------------------------------ | ------- |
| 1   | Cadrage, architecture, décisions techniques et environnement local | Terminé |
| 2   | Modèle de contenu bilingue, schéma et validation                   | Terminé |
| 3   | Premier site statique Astro responsive et imprimable               | Terminé |
| 4   | Tests, lint, accessibilité et génération PDF                       | Terminé |
| 5   | CI GitHub Actions                                                  | Terminé |
| 6   | Infrastructure Terraform/Terragrunt                                | À faire |
| 7   | Déploiement de préproduction puis production                       | À faire |
| 8   | Outillage d’import web/PDF avec revue humaine                      | À faire |

## Lot 1 — Cadrage

Décisions prises :

- un dépôt unique pour le contenu, le site et l’infrastructure ;
- Astro et TypeScript pour produire un site entièrement statique ;
- contenu YAML bilingue validé par JSON Schema ;
- GitHub Actions pour la future CI/CD ;
- Docker Compose comme première cible de déploiement local ;
- fournisseur cloud volontairement non choisi avant le lot infrastructure.

## Lot 2 — Contenu

Le contenu de départ est retranscrit depuis les CV publics DoYouBuzz français et anglais. Les fichiers importés restent relisibles et modifiables. Ils sont validés avant chaque build.

L’import actuel est manuel. Son automatisation sera isolée dans `scripts/import/` lors du lot 8 et ne modifiera jamais le contenu publié sans revue humaine.

## Lot 3 — Site

Le MVP doit :

- générer les routes `/` en français et `/en/` en anglais ;
- utiliser les mêmes composants pour les deux langues ;
- rester lisible sans JavaScript côté client ;
- être responsive, accessible et imprimable ;
- être servi localement par `docker compose up --build`.

## Lots 4 et 5 — Qualité et intégration continue

Le projet applique Prettier et ESLint, puis Playwright contrôle les versions française et anglaise sur Chromium desktop et mobile. Axe vérifie automatiquement les règles d’accessibilité détectables.

Les PDF A4 sont générés par Chromium depuis le rendu statique et intégrés à l’artefact. GitHub Actions exécute les mêmes contrôles, publie l’artefact `dist/` et vérifie que l’image Docker se construit, sans aucun déploiement.

## Prochain jalon

Relire le contenu et le rendu PDF, puis améliorer les tests ou le design selon les retours. L’infrastructure, le CD et les imports automatisés restent volontairement reportés.
