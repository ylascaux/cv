# Gestion du contenu

## Sources

Le contenu initial a été retranscrit le 29 août 2026 depuis les pages publiques DoYouBuzz :

- `content/cv.fr.yaml` depuis <https://www.doyoubuzz.com/yoann-lascaux/senior-platform-engineer-sre> ;
- `content/cv.en.yaml` depuis <https://www.doyoubuzz.com/yoann-lascaux/gb>.

Cette retranscription doit être relue avant une première publication. Les pages DoYouBuzz ne sont jamais interrogées pendant le build.

## Modifier le CV

1. Modifier les fichiers français et anglais.
2. Conserver les mêmes identifiants dans les collections traduites.
3. Exécuter `npm run validate:content`.
4. Prévisualiser avec `npm run dev` ou Docker Compose.
5. Faire relire le diff avant publication.

Les dates utilisent le format `YYYY-MM`. Une date de fin à `null` signifie que l’expérience est en cours.

## Validation

`content/schema.json` décrit les champs autorisés. Le script de validation contrôle également :

- que le fichier correspond à sa langue ;
- qu’une date de fin n’est pas antérieure à la date de début ;
- que les identifiants des sections sont identiques dans les deux langues.

## Imports futurs

Un import web/PDF devra écrire dans un fichier intermédiaire ou proposer un patch. Il ne devra jamais remplacer directement les fichiers validés ni déclencher un déploiement.

L’endpoint PDF DoYouBuzz pourra servir de source de comparaison, mais le futur PDF officiel sera généré depuis les données de ce dépôt pour éviter deux sources de vérité.
