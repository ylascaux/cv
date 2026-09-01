# CV — Yoann Lascaux

Bilingual static CV website built with Astro and generated from versioned YAML content. The same sources are validated with JSON Schema and rendered as both HTML and PDF.

Production: <https://cv.yoann-lascaux.fr>

## Implementation and AI usage

The application and JavaScript layer were built with AI assistance.
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
- analytics d'audience sans cookie, hébergé dans Cloudflare Workers Analytics Engine.

The architecture, OpenTofu/Terragrunt infrastructure as code, GitHub Actions workflows, CI/CD pipeline, security hardening, hosting design, and operational decisions were designed and implemented by Yoann Lascaux.

AI is used as an implementation assistant; architecture, security, platform, and operational decisions remain human-owned.

## Highlights

- French and English versions generated from a shared content model;
- versioned YAML content with schema and cross-language consistency validation;
- static, responsive, accessible output with no client-side JavaScript requirement;
- A4 PDF generation with Chromium;
- Playwright end-to-end tests on desktop and mobile, including Axe accessibility checks;
- GitHub Actions CI/CD with immutable revision-based artifacts;
- OpenTofu and Terragrunt infrastructure for OVHcloud Object Storage and Cloudflare;
- private object storage origin accessed through a Cloudflare Worker with read-only S3 credentials;
- secret scanning, dependency auditing, IaC validation, and pinned GitHub Actions.

## Local development

Requirements:

- Node.js 24;
- npm;
- Chromium through Playwright for E2E tests and PDF generation.

```shell
npm ci
npx playwright install chromium
npm run dev
```

The development server is available at <http://localhost:4321>.

Main routes:

- French: <http://localhost:4321/>;
- English: <http://localhost:4321/en/>.

Run the complete quality suite with:

```shell
npm run quality
```

Build the website and PDFs with:

```shell
npm run build
```

Generated files are written to `dist/` and are not committed.

## Content

CV content is stored separately from the presentation layer:

- `content/cv.fr.yaml` — French content;
- `content/cv.en.yaml` — English content;
- `content/schema.json` — allowed content structure.

Validate content changes with:

```shell
npm run validate:content
```

More details about the content model are available in [`docs/content.md`](docs/content.md).

## Infrastructure

Infrastructure tooling is reproducible through Nix:

```shell
nix develop
```

The deployment architecture is intentionally simple:

```text
Internet
  -> Cloudflare
  -> Cloudflare Worker
  -> signed HTTPS S3 requests
  -> private OVHcloud Object Storage
```

The repository contains no deployment credentials. Runtime and infrastructure secrets are provided through protected CI/CD environments and sensitive Terraform/OpenTofu state.

## Security controls

The repository and deployment pipeline include:

- protected `main` branch with required CI checks;
- Gitleaks secret scanning;
- dependency updates through Dependabot;
- production dependency auditing;
- GitHub Actions pinned to full commit SHAs;
- OpenTofu/Terragrunt formatting and validation;
- IaC misconfiguration scanning;
- private origin storage with least-privilege read access for the edge Worker.
Les workflows du site et de l'infrastructure partagent les environnements GitHub existants `production-infrastructure` et `preview-infrastructure`. Cela centralise les secrets nécessaires à chaque cible sans les recopier dans des environnements propres au site. L'environnement `production-infrastructure` doit conserver une approbation obligatoire afin de protéger les déploiements publics.

## Analytics

Les visites estimées humaines, les IA, les bots, le temps d'engagement et les téléchargements PDF sont enregistrés par le Worker Cloudflare sans cookie, IP ou user-agent conservé. Les catégories IA/bot sont des estimations issues de signatures de user-agent. Les datasets, les limites et les requêtes de consultation sont documentés dans [`docs/analytics.md`](docs/analytics.md).
