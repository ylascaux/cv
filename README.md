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
deploy/
  live/                  Stacks Terragrunt par environnement
  terraform/             Modules OpenTofu locaux
  units/                 Unités Terragrunt réutilisables
.github/workflows/       Intégration continue
Dockerfile               Build complet servi par Nginx
Dockerfile.preview       Build et preview locale avec Node.js
compose.yaml             Orchestration des deux images locales
```

## Intégration et déploiement continus

Le workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) s’exécute sur les pull requests et sur les pushes vers `main`. Il :

1. installe les dépendances avec `npm ci` ;
2. installe Chromium ;
3. exécute `npm run quality` ;
4. génère les PDF ;
5. audite les dépendances de production ;
6. archive `dist/` sous le nom immuable `cv-static-<commit>` pendant 14 jours ;
7. valide les workflows GitHub Actions avec `actionlint` ;
8. vérifie OpenTofu 1.12.6 et Terragrunt 1.1.4 via Nix ;
9. valide le format et les modules d’infrastructure, puis génère la stack de production ;
10. construit, sans les publier, les images `Dockerfile` et `Dockerfile.preview`.

En cas d’échec des tests, le rapport Playwright est conservé pendant 7 jours.

Le workflow [`.github/workflows/deploy-infrastructure.yml`](.github/workflows/deploy-infrastructure.yml) exécute un plan authentifié pour les pull requests internes qui modifient l’infrastructure. Après fusion dans `main`, il produit à nouveau les plans, attend l’autorisation de l’environnement `production-infrastructure`, vérifie que les plans n’ont pas dérivé pendant l’attente, puis applique exactement les plans vérifiés dans l’ordre `storage`, puis `edge`. Les pull requests provenant d’un fork n’obtiennent jamais les secrets et restent couvertes par les validations sans backend de `ci.yml`.

Le workflow [`.github/workflows/deploy-site.yml`](.github/workflows/deploy-site.yml) est déclenché après le succès complet de `CI` sur `main`. Il télécharge l’artefact de cette exécution sans reconstruire le site, le synchronise vers OVHcloud, purge le hostname dans Cloudflare et contrôle les URL publiques. Un lancement manuel avec l’identifiant d’une ancienne exécution CI et son SHA republie le même artefact et sert de rollback tant qu’il est conservé.

## Infrastructure et publication

La stack `deploy/live/production/terragrunt.stack.hcl` décrit :

- un bucket OVHcloud Object Storage `cv.yoann-lascaux.fr` dans `GRA`, versionné et chiffré ;
- le CNAME proxifié Cloudflare ;
- le mode Flexible limité au hostname du CV ;
- les règles de cache et les en-têtes de sécurité Cloudflare.

Pour générer et contrôler la stack sans accès distant :

```shell
nix develop --command tofu fmt -check -recursive deploy/terraform
nix develop --command terragrunt hcl fmt --check
cd deploy/live/production
nix develop ../../.. --command terragrunt stack generate
```

Le provider OVHcloud ne gère pas l’ACL publique ni l’activation Static Website. Après la création revue du bucket, les configurer avec un profil `s3cmd` pointant exclusivement vers l’endpoint OVHcloud :

```shell
s3cmd -c /chemin/vers/config-ovh setacl --acl-public s3://cv.yoann-lascaux.fr
s3cmd -c /chemin/vers/config-ovh ws-create --ws-index=index.html --ws-error=404.html s3://cv.yoann-lascaux.fr
```

La publication d’un artefact déjà validé s’effectue hors OpenTofu, manuellement ou par le workflow de déploiement du site :

```shell
s3cmd -c /chemin/vers/config-ovh sync --delete-removed --acl-public dist/ s3://cv.yoann-lascaux.fr/
```

### Backend d’état OVHcloud

L’état OpenTofu est stocké dans un bucket OVHcloud Object Storage privé et séparé du site. Ce bucket de bootstrap n’est pas créé par la stack qu’il héberge : le créer une seule fois dans le Manager OVHcloud, sans Static Website ni ACL publique, avec versionnement et chiffrement AES256 activés. Son nom globalement unique est fourni par `TG_STATE_BUCKET`.

Utiliser un utilisateur Object Storage dédié au backend, limité à `s3:GetBucketLocation`, `s3:ListBucket`, `s3:GetObject`, `s3:PutObject` et `s3:DeleteObject` sur le bucket d’état et ses objets. `DeleteObject` est nécessaire pour libérer le fichier de verrouillage ; cet utilisateur ne doit pas pouvoir modifier les ACL publiques ni accéder au bucket du site.

Le backend utilise le verrouillage natif S3-compatible (`use_lockfile`). La CI de validation utilise un nom factice uniquement pour analyser le HCL, ne reçoit aucun credential et n’initialise jamais ce backend.

Les identifiants sont fournis au client S3 d’OpenTofu avec `AWS_ACCESS_KEY_ID` et `AWS_SECRET_ACCESS_KEY`. Ces noms sont imposés par l’implémentation du protocole S3 ; ils contiennent les clés OVHcloud et n’impliquent aucun service AWS :

```shell
export TG_STATE_BUCKET="nom-du-bucket-prive"
export OVH_REGION="GRA"
export AWS_ACCESS_KEY_ID="access-key-ovh-du-backend"
export AWS_SECRET_ACCESS_KEY="secret-key-ovh-du-backend"
```

Si un `apply` a déjà produit un état local, ne pas supprimer ni régénérer `.terragrunt-stack/`. Sauvegarder d’abord chaque `terraform.tfstate`, puis migrer depuis les unités existantes :

```shell
find deploy/live/production/.terragrunt-stack -name terraform.tfstate -type f

cd deploy/live/production/.terragrunt-stack/storage
terragrunt run -- init -migrate-state
terragrunt run -- state list

cd ../edge
terragrunt run -- init -migrate-state
terragrunt run -- state list
```

Vérifier dans le bucket la présence de `production/storage/tofu.tfstate` et `production/edge/tofu.tfstate`, ainsi que le bon fonctionnement des fichiers `.tflock`, avant tout nouvel `apply`. Chaque pull request interne reçoit un plan authentifié. Après fusion, le workflow recalcule le plan et le job d’application est soumis à la protection de l’environnement GitHub `production-infrastructure`.

Avant de changer les nameservers chez OVH, recopier et vérifier toute la zone dans Cloudflare, notamment MX, SPF, DKIM, DMARC et les autres sous-domaines. Les secrets nécessaires à un futur plan sont `OVH_ENDPOINT`, `OVH_APPLICATION_KEY`, `OVH_APPLICATION_SECRET`, `OVH_CONSUMER_KEY`, `OVH_CLOUD_PROJECT_SERVICE`, `CLOUDFLARE_API_TOKEN`, `AWS_ACCESS_KEY_ID` et `AWS_SECRET_ACCESS_KEY`. Le nom non secret du bucket est fourni par `TG_STATE_BUCKET`. Ces valeurs ne doivent jamais être ajoutées au dépôt.

Le token Cloudflare doit être limité à la zone `yoann-lascaux.fr` avec les permissions de lecture de zone, modification DNS, modification des règles/paramètres de zone et, pour la publication, purge du cache. Les clés S3-compatible utilisées par `s3cmd` sont distinctes des identifiants du provider OVHcloud et de ceux du backend.

### Configuration GitHub Actions

Créer les variables de dépôt suivantes dans `Settings → Secrets and variables → Actions → Variables` :

```text
TG_STATE_BUCKET
OVH_REGION                     # GRA
OVH_ENDPOINT                   # ovh-eu
OVH_CLOUD_PROJECT_SERVICE
CLOUDFLARE_ZONE_ID
OVH_SITE_BUCKET                # cv.yoann-lascaux.fr
SITE_URL                       # https://cv.yoann-lascaux.fr
```

Créer les secrets nécessaires au plan d’infrastructure au niveau du dépôt :

```text
OVH_APPLICATION_KEY
OVH_APPLICATION_SECRET
OVH_CONSUMER_KEY
OVH_STATE_S3_ACCESS_KEY
OVH_STATE_S3_SECRET_KEY
CLOUDFLARE_API_TOKEN
```

`OVH_STATE_S3_ACCESS_KEY` et `OVH_STATE_S3_SECRET_KEY` appartiennent uniquement à l’utilisateur S3-compatible du backend privé. Le workflow les expose à OpenTofu sous les noms techniques `AWS_ACCESS_KEY_ID` et `AWS_SECRET_ACCESS_KEY`.

Créer deux environnements GitHub :

- `production-infrastructure`, avec des reviewers obligatoires pour empêcher un `apply` non approuvé après fusion ;
- `production-site`, qui peut être automatique ou protégé selon la politique de publication souhaitée.

Ajouter à `production-site` les secrets suivants :

```text
OVH_SITE_S3_ACCESS_KEY
OVH_SITE_S3_SECRET_KEY
```

Cet utilisateur Object Storage doit être limité au bucket public du CV et autorisé à lister, lire, écrire, supprimer les objets et définir leur ACL publique. Le token `CLOUDFLARE_API_TOKEN` doit aussi être accessible au job de publication ; s’il est défini au niveau du dépôt pour les plans, il l’est déjà. Avant le premier déploiement, activer une fois l’ACL publique et le mode Static Website du bucket avec les commandes `s3cmd` documentées plus haut.

Les secrets de dépôt sont transmis uniquement aux plans des branches internes : GitHub ne les fournit jamais aux pull requests provenant de forks. Restreindre les droits d’écriture du dépôt et protéger `main`, car un plan authentifié évalue la configuration proposée par la branche.

## Documentation

- [Architecture](docs/architecture.md)
- [Gestion du contenu](docs/content.md)
- [Plan de réalisation](docs/roadmap.md)
- [ADR 0001 — choix d’Astro](docs/decisions/0001-astro.md)
- [ADR 0002 — contenu YAML](docs/decisions/0002-contenu-yaml.md)
- [ADR 0003 — Docker Compose local](docs/decisions/0003-deploiement-local-compose.md)
- [ADR 0004 — Cloudflare et OVHcloud Object Storage](docs/decisions/0004-cloudflare-ovh-object-storage.md)
