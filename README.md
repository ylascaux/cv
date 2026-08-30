# CV — Yoann Lascaux

Bilingual static CV website built with Astro and generated from versioned YAML content. The same sources are validated with JSON Schema and rendered as both HTML and PDF.

Production: <https://cv.yoann-lascaux.fr>

## Implementation and AI usage

The application and JavaScript layer were built with AI assistance.

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
