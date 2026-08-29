# Guide des agents — dépôt `cv`

## Objet du dépôt

Ce dépôt contient tout ce qui est nécessaire pour produire et publier le CV public :

- le contenu source du CV ;
- le site statique et son mécanisme de build ;
- les tests et contrôles de qualité ;
- la CI/CD ;
- l’infrastructure de déploiement gérée avec Terraform et Terragrunt.

Le dépôt doit permettre de modifier le contenu du CV, de le prévisualiser localement, de le valider automatiquement et de déployer une version statique fiable.

## Périmètre

Les fonctionnalités suivantes appartiennent à ce dépôt :

- édition des données et contenus qui composent le CV ;
- génération du site statique et, si nécessaire, d’autres formats de sortie tels que le PDF ;
- import ponctuel de données depuis des sites web ou des fichiers PDF, lorsqu’il sert à mettre à jour le CV ;
- déploiement de l’infrastructure et du site ;
- automatisation de la validation, de la publication et des retours arrière.

Ne pas introduire de backend applicatif persistant ou de traitement serveur pour servir le CV sans besoin explicite. Le résultat publié doit rester un site statique.

## Principes d’architecture

- Le contenu source doit être séparé de sa présentation autant que possible.
- Le build doit être déterministe : à sources et dépendances identiques, il doit produire le même artefact.
- Les fichiers générés et publiés ne doivent pas être modifiés à la main.
- Les secrets ne doivent jamais être versionnés, affichés dans les journaux CI ou intégrés au site statique.
- Les outils d’import web/PDF doivent être isolés du build public : ils ne doivent pas être exécutés lors du déploiement du site sauf nécessité documentée.
- Toute donnée importée doit pouvoir être revue et corrigée avant publication.

## Organisation recommandée

Conserver une structure explicite et adaptée aux outils réellement choisis. À titre de cible :

```text
content/                 Données source du CV et médias éditoriaux
site/                    Application ou générateur de site statique
infra/
  modules/               Modules Terraform réutilisables
  live/                  Configurations Terragrunt par environnement
scripts/                 Outils d’import, de génération ou de maintenance
.github/workflows/       Pipelines CI/CD (ou équivalent selon la forge)
tests/                   Tests transverses, si non colocalisés avec le site
```

Ne créer un dossier, un environnement ou un module que lorsqu’il répond à un besoin concret. Éviter les abstractions d’infrastructure prématurées.

## Contenu et édition

- Traiter les données du CV comme du contenu versionné et relisible dans une pull request.
- Privilégier des formats structurés, pérennes et faciles à valider (par exemple YAML, JSON ou Markdown selon le besoin).
- Conserver les textes et métadonnées dans des fichiers source ; ne pas les dupliquer dans les composants de rendu.
- Lorsqu’un import depuis le web ou un PDF est ajouté, documenter sa source, son usage, ses limites et la commande pour le relancer.
- Ne pas publier automatiquement un contenu importé sans validation humaine, sauf règle explicitement mise en place.

## Infrastructure — Terraform et Terragrunt

- Terraform décrit les ressources ; Terragrunt compose leur configuration par environnement et gère les dépendances entre composants.
- Les modules Terraform doivent être petits, réutilisables et ne pas contenir de valeurs propres à un environnement.
- Les valeurs spécifiques aux environnements (domaine, région, identifiants de ressources, options de cache) appartiennent à la couche Terragrunt.
- Utiliser un backend distant et un verrouillage d’état lorsque le fournisseur le permet. Ne jamais versionner de fichier d’état Terraform ni de fichier contenant des identifiants.
- Épingler les versions de Terraform, Terragrunt, providers et modules. Toute mise à jour de version doit être validée en CI.
- Prévoir au minimum un environnement de préproduction et un environnement de production dès qu’un déploiement public existe. Si cela est disproportionné au démarrage, documenter clairement le compromis temporaire.
- Toute modification d’infrastructure doit passer par un `plan` revu avant un `apply` sur la production.
- Privilégier un hébergement adapté à un site statique : stockage objet + CDN, ou plateforme équivalente. Le choix du fournisseur doit être documenté dans le README lorsqu’il sera arrêté.

## CI/CD

La CI doit s’exécuter sur chaque pull request et inclure, selon les outils disponibles :

1. installation reproductible des dépendances ;
2. formatage et lint ;
3. validation des données de contenu ;
4. tests unitaires et/ou d’intégration ;
5. build du site statique ;
6. vérifications de qualité pertinentes (liens, accessibilité, taille des artefacts) ;
7. `terraform fmt -check` et `terraform validate` ;
8. `terragrunt run-all plan` ou une commande de plan équivalente, pour les changements d’infrastructure concernés.

Le CD doit :

- publier un artefact de build immuable ;
- déployer automatiquement vers la préproduction après fusion lorsque celle-ci existe ;
- exiger une protection ou une approbation explicite avant toute application sur l’environnement de production ;
- conserver assez d’informations pour identifier la révision déployée et effectuer un retour arrière ;
- utiliser les mécanismes de secrets et d’identité de la forge/du fournisseur, idéalement une fédération d’identité plutôt que des clés longues durées.

Ne jamais lancer un `terraform apply` ou un `terragrunt ... apply` de production depuis un poste local sans procédure explicitement documentée.

## Règles de contribution pour les agents

Avant toute modification :

- lire les conventions, fichiers de configuration et workflows existants ;
- limiter les changements au besoin demandé ;
- ne pas écraser les modifications utilisateur existantes ;
- ne pas ajouter de dépendance ou de fournisseur cloud sans justification claire.

Pour chaque changement :

- mettre à jour les tests, la documentation ou les workflows affectés ;
- valider au minimum le périmètre modifié ;
- pour l’infrastructure, exécuter les vérifications de formatage et de validation disponibles, puis rapporter le résultat du plan si applicable ;
- signaler explicitement les prérequis externes (domaine, compte cloud, secrets, droits CI) qui empêchent une validation complète.

## Définition de terminé

Un changement est considéré terminé lorsque :

- le contenu, le site ou l’infrastructure concernés sont versionnés et cohérents ;
- les contrôles automatisés pertinents passent ;
- le comportement de déploiement est documenté lorsqu’il évolue ;
- aucune information sensible n’est ajoutée au dépôt ;
- la production ne peut pas être modifiée accidentellement par une modification non revue.
