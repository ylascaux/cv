# Analytics

Le CV utilise **Cloudflare Workers Analytics Engine**, déjà cohérent avec l'hébergement Cloudflare du site. Il n'ajoute ni cookie, ni service tiers, ni stockage applicatif. Le dataset est créé automatiquement lors du premier événement reçu.

Chaque environnement possède son propre dataset :

| Environnement | Dataset                 |
| ------------- | ----------------------- |
| production    | `cv_traffic_production` |
| preview       | `cv_traffic_preview`    |

## Mesures disponibles

Le Worker enregistre uniquement des valeurs agrégables :

| Colonne   | Valeur                                                        |
| --------- | ------------------------------------------------------------- |
| `blob1`   | `page_view`, `download` ou `engagement`                       |
| `blob2`   | `human`, `ai` ou `bot`                                        |
| `blob3`   | langue : `fr`, `en` ou `other`                                |
| `blob4`   | chemin public connu                                           |
| `double1` | durée d'engagement en secondes (uniquement pour `engagement`) |

Une visite humaine est une consultation de page dont le user-agent ne correspond pas à une signature d'agent automatisé connue. Les IA et bots sont donc des **estimations par signature de user-agent** ; aucun user-agent, identifiant, cookie ou adresse IP n'est écrit dans le dataset. Les navigateurs qui activent Global Privacy Control ou Do Not Track ne remontent pas de durée d'engagement.

Le temps passé est comptabilisé par tranches de 15 secondes lorsque la page est visible. Le téléchargement est relevé au niveau du Worker, ce qui couvre les clics sans JavaScript.

## Consulter les données

Après le premier déploiement et le premier événement, créer un jeton Cloudflare limité à la permission **Account Analytics: Read**. Ne jamais le mettre dans le site, dans les fichiers Terragrunt, ni dans Git. Il peut ensuite être utilisé avec l'API SQL de Cloudflare.

Remplacer les variables d'environnement ci-dessous avant d'exécuter les requêtes :

```shell
export CLOUDFLARE_ACCOUNT_ID='…'
export CLOUDFLARE_ANALYTICS_TOKEN='…'
```

Visites par catégorie sur les 30 derniers jours :

```sql
SELECT blob2 AS audience, SUM(_sample_interval) AS visits
FROM cv_traffic_production
WHERE blob1 = 'page_view' AND timestamp >= NOW() - INTERVAL '30' DAY
GROUP BY audience
ORDER BY visits DESC
```

Temps d'engagement humain total, en minutes :

```sql
SELECT SUM(_sample_interval * double1) / 60 AS minutes
FROM cv_traffic_production
WHERE blob1 = 'engagement' AND blob2 = 'human' AND timestamp >= NOW() - INTERVAL '30' DAY
```

Téléchargements par langue et type de trafic :

```sql
SELECT blob3 AS locale, blob2 AS audience, SUM(_sample_interval) AS downloads
FROM cv_traffic_production
WHERE blob1 = 'download' AND timestamp >= NOW() - INTERVAL '30' DAY
GROUP BY locale, audience
ORDER BY downloads DESC
```

L'API SQL est accessible à l'adresse `https://api.cloudflare.com/client/v4/accounts/<account-id>/analytics_engine/sql`, avec le jeton en en-tête `Authorization: Bearer …`. Les requêtes utilisent `_sample_interval` afin de rester correctes si Cloudflare applique de l'échantillonnage.
