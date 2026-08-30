locals {
  environment        = "production"
  site_hostname      = "cv.yoann-lascaux.fr"
  site_url           = "https://cv.yoann-lascaux.fr"
  bucket_name        = "cv.yoann-lascaux.fr"
  ovh_region         = "GRA"
  ovh_endpoint       = "ovh-eu"
  ovh_service_name   = "fe3a7d65b6a54eeda23015c1c64060d8"
  state_bucket       = "cv-opentofu-state-yoann-lascaux"
  cloudflare_zone_id = "1e0b2d5fb5b5f286c47fd7e4bc408bfb"
  html_edge_ttl      = 300
  asset_edge_ttl     = 31536000
  worker_name        = "cv-ovh-private-s3-proxy"
}
