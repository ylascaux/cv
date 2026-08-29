# CV — Yoann Lascaux

Site statique bilingue du CV de Yoann Lascaux, construit avec Astro à partir de contenus YAML versionnés.

## Prérequis

Pour le développement direct :

- Node.js 24 ;
- npm 11.

Pour exécuter uniquement le déploiement local :

- Docker ;
- Docker Compose.

## Démarrage avec Docker Compose

```shell
docker compose up --build
```

Le CV français est disponible sur <http://localhost:4321> et la version anglaise sur <http://localhost:4321/en/>.

Arrêter et supprimer le conteneur :

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
npm run quality           # Exécute tous les contrôles locaux
npm run preview           # Sert localement le dernier build
```

## Organisation

```text
content/             Données du CV en français et anglais + JSON Schema
site/                Pages, composants, styles et ressources Astro
scripts/             Validation et futurs outils d’import/génération
docs/                Architecture, roadmap et décisions
compose.yaml          Déploiement local de l’image statique
Dockerfile            Build Astro puis image Nginx minimale
```

## Documentation

- [Plan de réalisation](docs/roadmap.md)
- [Architecture](docs/architecture.md)
- [Gestion du contenu](docs/content.md)
- [ADR 0001 — Astro](docs/decisions/0001-astro.md)
- [ADR 0002 — contenu YAML](docs/decisions/0002-contenu-yaml.md)
- [ADR 0003 — Docker Compose local](docs/decisions/0003-deploiement-local-compose.md)

## Sources du contenu

Le contenu initial a été retranscrit depuis les versions publiques française et anglaise du CV DoYouBuzz. DoYouBuzz n’est pas appelé pendant le build et toute mise à jour importée doit être revue avant publication.

## PDF

Le build génère deux documents depuis le rendu Astro avec Chromium :

- `dist/downloads/yoann-lascaux-cv-fr.pdf` ;
- `dist/downloads/yoann-lascaux-cv-en.pdf`.

Installer Chromium une première fois pour les commandes exécutées hors Docker :

```shell
npx playwright install chromium
```

## Intégration continue

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) exécute les contrôles, génère l’artefact statique avec les PDF et construit l’image Docker sur les pull requests et sur `main`. Il ne réalise aucun déploiement.

## Suite prévue

L’infrastructure Terraform/Terragrunt et le CD sont volontairement reportés. Les prochains travaux locaux pourront porter sur la relecture éditoriale, l’amélioration du design/PDF et l’outillage d’import.
