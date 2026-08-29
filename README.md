# CV — Yoann Lascaux

Site statique bilingue du CV de Yoann Lascaux, construit avec Astro à partir de contenus YAML versionnés.

## Prérequis

Pour le développement direct :

- Node.js 24 ;
- npm 11.

Pour l’exécution avec Docker Compose :

- Docker ;
- Docker Compose.

## Démarrage avec Docker Compose

```shell
docker compose up --build
```

Deux services utilisant les contenus versionnés sont disponibles :

| Service   | Usage                                    | Français                | Anglais                     |
| --------- | ---------------------------------------- | ----------------------- | --------------------------- |
| `cv`      | image statique Nginx proche de la cible  | <http://localhost:4321> | <http://localhost:4321/en/> |
| `preview` | prévisualisation de travail avec les PDF | <http://localhost:4322> | <http://localhost:4322/en/> |

Le service `preview` construit Astro, génère les PDF français et anglais, puis sert l’artefact sur le port `4322`.

Arrêter et supprimer les conteneurs :

```shell
docker compose down
```

## Développement local

```shell
npm ci
npm run dev
```

Commandes disponibles :

```shell
npm run format            # Formate les sources et la documentation
npm run lint              # Analyse JavaScript, TypeScript et Astro
npm run validate:content  # Valide les YAML et leur cohérence
npm run check             # Vérifie le contenu et les composants Astro
npm run test:e2e          # Teste les pages, le responsive et l’accessibilité
npm run pdf               # Génère les deux PDF A4 dans dist/downloads/
npm run build             # Produit le site et les PDF dans dist/
npm run quality           # Exécute tous les contrôles
npm run preview           # Sert localement le dernier build
```

## Organisation

```text
content/             Données du CV en français et anglais + JSON Schema
site/                Pages, composants, styles et ressources Astro
scripts/             Validation, preview et génération PDF
docs/                Architecture, usage, roadmap et décisions
compose.yaml          Site statique et preview locale
Dockerfile            Build Astro puis image Nginx minimale
Dockerfile.preview    Preview Astro avec génération des PDF
```

## Documentation

- [Plan de réalisation](docs/roadmap.md)
- [Architecture](docs/architecture.md)
- [Gestion du contenu](docs/content.md)
- [ADR 0001 — Astro](docs/decisions/0001-astro.md)
- [ADR 0002 — contenu YAML](docs/decisions/0002-contenu-yaml.md)
- [ADR 0003 — Docker Compose local](docs/decisions/0003-deploiement-local-compose.md)

## PDF

Le build génère deux documents depuis le rendu Astro avec Chromium :

- `dist/downloads/yoann-lascaux-cv-fr.pdf` ;
- `dist/downloads/yoann-lascaux-cv-en.pdf`.

Installer Chromium une première fois pour les commandes exécutées hors Docker :

```shell
npx playwright install chromium
```

## Intégration continue

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) exécute les contrôles, génère l’artefact statique avec les PDF et construit les images Docker sur les pull requests et sur `main`. Il ne réalise aucun déploiement.

## Suite prévue

L’infrastructure Terraform/Terragrunt et le CD sont volontairement reportés jusqu’au choix de la cible d’hébergement.
