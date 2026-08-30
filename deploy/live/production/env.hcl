locals {
  environment        = "production"
  site_hostname      = "cv.yoann-lascaux.fr"
  site_url           = "https://cv.yoann-lascaux.fr"
  ovh_region         = "GRA"
  ovh_endpoint       = "ovh-eu"
  ovh_service_name   = "fe3a7d65b6a54eeda23015c1c64060d8"
  state_bucket       = "cv-opentofu-state-yoann-lascaux"
  cloudflare_zone_id = "847e9538da2d00a3c38d88a212f8faa5"
  html_edge_ttl      = 300
  asset_edge_ttl     = 31536000
}
