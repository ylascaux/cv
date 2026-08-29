# Gestion du contenu

## Source de vérité

Les fichiers suivants constituent l’unique source éditoriale du CV :

- `content/cv.fr.yaml` pour la version française ;
- `content/cv.en.yaml` pour la version anglaise.

Ils sont versionnés, relisibles en pull request et ne sont jamais remplacés automatiquement.

## Modifier le CV

1. Modifier les fichiers français et anglais.
2. Conserver les mêmes identifiants dans les collections traduites.
3. Exécuter `npm run validate:content`.
4. Prévisualiser avec `npm run dev` ou Docker Compose.
5. Faire relire le diff avant publication.

Les dates utilisent le format `YYYY-MM`. Une date de fin à `null` signifie que l’expérience est en cours.

Les expériences distinguent les réalisations essentielles dans `highlights`, visibles immédiatement sur le site et dans le PDF, des missions complémentaires placées dans le champ optionnel `details`. Le champ optionnel `environment` contient la stack technique. Sur le site, `details` et `environment` sont regroupés dans le panneau « Plus de détails ». Le PDF reprend aussi les missions de `details`, mais pas `environment`, afin d’apporter davantage de contexte sans répéter la colonne des compétences.

## Import des environnements DoYouBuzz

Les environnements techniques ont été importés manuellement le 30 août 2026 depuis les fiches détaillées du CV public :

```text
https://www.doyoubuzz.com/yoann-lascaux/senior-platform-engineer-sre
```

Chaque valeur a été rapprochée de l’expérience correspondante puis enregistrée dans les YAML français et anglais. DoYouBuzz reste une source ponctuelle, pas une dépendance du build : toute nouvelle donnée doit être relue avant publication. Les expériences `gfi-nagios` et `gfi-operations` n’exposent aucun environnement détaillé dans la source et ne comportent donc pas ce champ.

## Validation

`content/schema.json` décrit les champs autorisés. Le script de validation contrôle également :

- que le fichier correspond à sa langue ;
- qu’une date de fin n’est pas antérieure à la date de début ;
- que les identifiants des sections sont identiques dans les deux langues.

Les PDF sont générés depuis ces mêmes données afin de conserver une seule source de vérité entre le site et les documents téléchargeables.
