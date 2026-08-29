# CV — Yoann Lascaux

Site statique bilingue du CV de Yoann Lascaux. Le contenu éditorial est stocké dans des fichiers YAML versionnés, validé par JSON Schema, puis rendu avec Astro en HTML et en PDF.

Le dépôt contient le contenu du CV, le site, les contrôles de qualité et les images Docker nécessaires à son exécution locale. Il ne contient pas encore d’infrastructure de déploiement public.

## Fonctionnalités

- versions française (`/`) et anglaise (`/en/`) générées depuis un modèle commun ;
- contenu séparé de la présentation dans `content/cv.fr.yaml` et `content/cv.en.yaml` ;
- validation structurelle et contrôle de cohérence entre les deux langues ;
- rendu statique responsive, accessible et utilisable sans JavaScript côté client ;
- détails complémentaires des expériences repliables sur le site et repris dans le PDF, hors stacks techniques redondantes ;
- génération de deux PDF A4 avec Chromium ;
- tests Playwright sur Chromium desktop et mobile, avec contrôles Axe ;
- images Docker pour servir l’artefact statique ou le prévisualiser localement ;
- CI GitHub Actions pour valider, construire et archiver le résultat sans le déployer.

## Prérequis

### Développement avec Node.js

- Node.js 24 ;
- npm 11 ;
- Chromium installé par Playwright pour les tests E2E et la génération PDF.

### Exécution avec Docker

- Docker ;
- Docker Compose.

## Démarrage rapide

### Développement local

```shell
npm ci
npx playwright install chromium
npm run dev
```

Le serveur Astro avec rechargement automatique est disponible sur <http://localhost:4321>. Les routes principales sont :

- français : <http://localhost:4321/> ;
- anglais : <http://localhost:4321/en/>.

Le serveur de développement ne génère pas les PDF. Utiliser `npm run pdf` ou le service Docker `preview` pour obtenir les documents téléchargeables.

### Prévisualisation avec Docker Compose

```shell
docker compose up --build
```

Deux services sont alors lancés :

| Service   | Description                                                       | Français                | Anglais                     |
| --------- | ----------------------------------------------------------------- | ----------------------- | --------------------------- |
| `cv`      | build complet servi par Nginx, proche d’un artefact de production | <http://localhost:4321> | <http://localhost:4321/en/> |
| `preview` | build Astro et PDF servi par le serveur de preview Astro          | <http://localhost:4322> | <http://localhost:4322/en/> |

Le service `preview` reconstruit le site et les PDF au démarrage. Il ne monte pas les sources et n’offre donc pas de rechargement automatique : après une modification, relancer le build avec `docker compose up --build`.

Pour arrêter et supprimer les conteneurs :

```shell
docker compose down
```

## Modifier le contenu

Les sources éditoriales sont :

- `content/cv.fr.yaml` pour le français ;
- `content/cv.en.yaml` pour l’anglais ;
- `content/schema.json` pour la structure autorisée.

Après une modification :

```shell
npm run validate:content
npm run dev
```

Les collections traduites doivent conserver les mêmes identifiants. Les dates utilisent le format `YYYY-MM` et une date de fin à `null` indique une expérience en cours.

Les logos d’entreprise sont conservés dans `site/public/logos/companies/`. Leur provenance et leurs conditions d’utilisation sont documentées dans [`site/public/logos/companies/README.md`](site/public/logos/companies/README.md).

Consulter [`docs/content.md`](docs/content.md) pour le modèle détaillé, les règles de validation et l’origine des données importées.

## Commandes npm

| Commande                   | Effet                                                                 |
| -------------------------- | --------------------------------------------------------------------- |
| `npm run dev`              | démarre le serveur de développement Astro                             |
| `npm run validate:content` | valide les YAML et leur cohérence bilingue                            |
| `npm run format`           | formate les sources et la documentation avec Prettier                 |
| `npm run format:check`     | vérifie le formatage sans modifier les fichiers                       |
| `npm run lint`             | analyse JavaScript, TypeScript et Astro avec ESLint                   |
| `npm run check`            | valide le contenu et exécute les vérifications Astro/TypeScript       |
| `npm run build:site`       | valide le contenu et génère uniquement le site statique dans `dist/`  |
| `npm run pdf:generate`     | génère les PDF à partir d’un site déjà construit dans `dist/`         |
| `npm run pdf`              | construit le site puis génère les PDF                                 |
| `npm run build`            | produit le site statique et les PDF dans `dist/`                      |
| `npm run preview`          | sert le dernier build présent dans `dist/`                            |
| `npm run test:e2e`         | construit le site puis lance les tests Playwright desktop et mobile   |
| `npm run quality`          | exécute formatage, lint, validation, vérifications Astro et tests E2E |

## Artefacts générés

Le build complet :

```shell
npm run build
```

produit dans `dist/` :

- le site statique français et anglais ;
- `dist/downloads/yoann-lascaux-cv-fr.pdf` ;
- `dist/downloads/yoann-lascaux-cv-en.pdf`.

Les fichiers de `dist/` sont générés et ne doivent pas être modifiés à la main ni versionnés.

## Organisation du dépôt

```text
content/                 Contenu YAML bilingue et JSON Schema
site/
  public/                Polices, favicon et logos
  src/                   Pages, layouts, composants et styles Astro
scripts/                 Validation du contenu, preview et génération PDF
tests/e2e/               Tests Playwright et contrôles d’accessibilité
docs/                    Architecture, contenu, décisions et feuille de route
.github/workflows/       Intégration continue
Dockerfile               Build complet servi par Nginx
Dockerfile.preview       Build et preview locale avec Node.js
compose.yaml             Orchestration des deux images locales
```

## Intégration continue

Le workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) s’exécute sur les pull requests et sur les pushes vers `main`. Il :

1. installe les dépendances avec `npm ci` ;
2. installe Chromium ;
3. exécute `npm run quality` ;
4. génère les PDF ;
5. audite les dépendances de production ;
6. archive `dist/` pendant 14 jours ;
7. construit, sans les publier, les images `Dockerfile` et `Dockerfile.preview`.

En cas d’échec des tests, le rapport Playwright est conservé pendant 7 jours.

## Publication

Le projet produit un artefact entièrement statique, mais aucun déploiement automatique ni environnement public n’est encore configuré. Le choix de l’hébergement, l’infrastructure Terraform/Terragrunt et le CD vers une préproduction puis la production restent à réaliser.

## Documentation

- [Architecture](docs/architecture.md)
- [Gestion du contenu](docs/content.md)
- [Plan de réalisation](docs/roadmap.md)
- [ADR 0001 — choix d’Astro](docs/decisions/0001-astro.md)
- [ADR 0002 — contenu YAML](docs/decisions/0002-contenu-yaml.md)
- [ADR 0003 — Docker Compose local](docs/decisions/0003-deploiement-local-compose.md)
