# CV — Yoann Lascaux

Site statique bilingue du CV de Yoann Lascaux. Le contenu éditorial est stocké dans des fichiers YAML versionnés, validé par JSON Schema, puis rendu avec Astro en HTML et en PDF.

Le dépôt contient le contenu du CV, le site, les contrôles de qualité, les images Docker et l’infrastructure OpenTofu/Terragrunt destinée à sa publication sur OVHcloud Object Storage derrière Cloudflare.

## Fonctionnalités

- versions française (`/`) et anglaise (`/en/`) générées depuis un modèle commun ;
- contenu séparé de la présentation dans `content/cv.fr.yaml` et `content/cv.en.yaml` ;
- validation structurelle et contrôle de cohérence entre les deux langues ;
- rendu statique responsive, accessible et utilisable sans JavaScript côté client ;
- détails complémentaires des expériences repliables sur le site et repris dans le PDF, hors stacks techniques redondantes ;
- génération de deux PDF A4 avec Chromium ;
- tests Playwright sur Chromium desktop et mobile, avec contrôles Axe ;
- images Docker pour servir l’artefact statique ou le prévisualiser localement ;
- CI/CD GitHub Actions pour valider, construire, planifier l’infrastructure et publier des artefacts identifiés par révision ;
- infrastructure OVHcloud Object Storage et Cloudflare décrite avec OpenTofu et Terragrunt.

## Prérequis

### Développement avec Node.js

- Node.js 24 ;
- npm 11 ;
- Chromium installé par Playwright pour les tests E2E et la génération PDF.

### Exécution avec Docker

- Docker ;
- Docker Compose.

### Infrastructure avec Nix

- Nix avec les flakes activées ;
- direnv, facultatif mais recommandé.

Le `flake.nix` fournit OpenTofu 1.12.6, Terragrunt 1.1.4, Node.js 24, `actionlint`, `s3cmd` et `jq` :

```shell
direnv allow
# ou, sans direnv
nix develop
```

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
