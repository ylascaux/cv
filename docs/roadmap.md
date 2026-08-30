# Plan de réalisation

## Objectif

Construire un CV bilingue à partir de données structurées, le valider automatiquement, le servir comme site statique et préparer son déploiement contrôlé sur OVHcloud Object Storage derrière Cloudflare.

## État des lots

| Lot | Résultat attendu                                                   | État                          |
| --- | ------------------------------------------------------------------ | ----------------------------- |
| 1   | Cadrage, architecture, décisions techniques et environnement local | Terminé                       |
| 2   | Modèle de contenu bilingue, schéma et validation                   | Terminé                       |
| 3   | Site statique Astro responsive et imprimable                       | Terminé                       |
| 4   | Tests, lint, accessibilité et génération PDF                       | Terminé                       |
| 5   | CI GitHub Actions                                                  | Terminé                       |
| 6   | Infrastructure OpenTofu/Terragrunt                                 | Préparé, plan distant à faire |
| 7   | Déploiement de préproduction puis production                       | À faire                       |

## Lots terminés

Le contenu YAML bilingue est validé par JSON Schema et rendu avec Astro. Le site reste statique, accessible, responsive et imprimable. Chromium génère les PDF et Playwright contrôle les rendus français et anglais sur desktop et mobile. GitHub Actions exécute les contrôles, archive `dist/` et construit les images Docker sans les publier.

## Infrastructure préparée

La cible retenue est OVHcloud Object Storage derrière Cloudflare Free. OpenTofu 1.12.6, Terragrunt 1.1.4 et les providers sont épinglés. La stack de production compose :

- le bucket OVHcloud `cv.yoann-lascaux.fr`, chiffré, versionné et protégé contre la destruction ;
- le DNS proxifié Cloudflare ;
- le mode Flexible limité au hostname du CV ;
- les politiques de cache et les en-têtes de sécurité.

L’environnement Nix et direnv rend les outils reproductibles. La CI valide les modules et la génération de stack sans credentials et n’exécute aucun `apply`.

## Prochain jalon

1. créer ou sélectionner le projet Public Cloud OVHcloud ;
2. générer des credentials OVHcloud limités et un profil `s3cmd` pour l’API S3-compatible ;
3. importer toute la zone DNS dans Cloudflare et vérifier les enregistrements e-mail avant de modifier les nameservers chez OVH ;
4. créer le bucket OVHcloud privé et versionné du backend, puis migrer les états locaux existants ;
5. vérifier le verrouillage du backend, produire un `plan` authentifié et le relire avant toute procédure d’`apply` protégée ;
6. activer l’ACL publique et Static Website avec `s3cmd`, publier l’artefact immuable et purger le cache Cloudflare ;
7. ajouter une préproduction avec un FQDN et un bucket séparés avant d’automatiser le CD.
