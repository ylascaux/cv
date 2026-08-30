# ADR 0004 — Publier avec Cloudflare et OVHcloud Object Storage

- Statut : accepté
- Date : 2026-08-30

## Contexte

Le CV doit rester un site statique, être disponible en HTTPS sur `cv.yoann-lascaux.fr` et conserver une infrastructure simple. Le nom de domaine est enregistré chez OVHcloud. L’hébergement ne doit utiliser aucun service ni provider AWS.

OVHcloud Object Storage propose un endpoint Static Website, mais celui-ci est uniquement accessible en HTTP. Cloudflare Free fournit le proxy HTTPS, le CDN, le cache et les règles de réponse nécessaires.

## Décision

- créer le bucket `cv.yoann-lascaux.fr` dans la région OVHcloud `GRA` avec le provider `ovh/ovh` ;
- activer le versionnement et le chiffrement AES256 du bucket ;
- empêcher sa destruction accidentelle avec `prevent_destroy` ;
- configurer dans Cloudflare un CNAME proxifié vers `cv.yoann-lascaux.fr.s3-website.gra.io.cloud.ovh.net` ;
- appliquer le mode Flexible uniquement à `cv.yoann-lascaux.fr`, jamais à toute la zone ;
- gérer le cache et les en-têtes de sécurité à la périphérie Cloudflare ;
- utiliser OpenTofu 1.12.6 et Terragrunt 1.1.4 dans un environnement Nix verrouillé ;
- stocker les états OpenTofu dans un bucket OVHcloud Object Storage privé, versionné et distinct du site, avec verrouillage natif S3-compatible ;

Le provider OVHcloud ne permet pas actuellement de déclarer l’ACL `public-read` ni la configuration Static Website. Ces deux opérations sont donc réalisées explicitement avec `s3cmd` après création du bucket, puis contrôlées manuellement. Le contenu de `dist/` est également publié avec `s3cmd` et ne fait pas partie de l’état OpenTofu.

## Conséquences

- le navigateur communique en HTTPS avec Cloudflare ;
- la liaison Cloudflare → OVHcloud utilise HTTP, car l’endpoint website OVHcloud ne propose pas HTTPS ;
- le bucket et ses objets sont publics, ce qui est inhérent à cette fonction Static Website ;
- Cloudflare Free ne permettant pas de remplacer le header `Host` vers l’origine, le bucket doit porter exactement le FQDN public ;
- la zone DNS complète doit être migrée vers les nameservers Cloudflare avant activation du proxy ; tous les enregistrements existants, notamment ceux des e-mails, doivent être inventoriés et recréés avant ce changement ;
- les éventuels états locaux antérieurs doivent être migrés vers le backend OVHcloud avant toute nouvelle application ;
- un environnement de préproduction n’est pas créé pour le moment faute de second hostname et pour éviter un bucket supplémentaire. Il devra utiliser un hostname, un bucket et une stack séparés.

## Sécurité opérationnelle

Aucun secret n’est versionné. Les credentials OVHcloud, S3-compatible et Cloudflare sont fournis par l’environnement ou par les secrets de la forge. Le bucket d’état est privé, versionné et utilise un utilisateur dédié sans droit de modifier les ACL publiques. La CI ne lance ni `plan` authentifié ni `apply`. Tout futur changement de production devra produire un plan relu et passer par un environnement GitHub protégé.
