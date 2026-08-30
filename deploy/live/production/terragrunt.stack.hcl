locals {
  site_hostname = "cv.yoann-lascaux.fr"
  ovh_region    = "GRA"
}

unit "storage" {
  source = "${get_repo_root()}/deploy/units/storage"
  path   = "storage"

  values = {
    site_hostname    = local.site_hostname
    ovh_region       = local.ovh_region
    ovh_service_name = get_env("OVH_CLOUD_PROJECT_SERVICE", "") != "" ? get_env("OVH_CLOUD_PROJECT_SERVICE") : null
    tags = {
      Environment = "production"
      ManagedBy   = "OpenTofu"
      Project     = "cv"
    }
  }
}

unit "edge" {
  source = "${get_repo_root()}/deploy/units/edge"
  path   = "edge"

  values = {
    site_hostname      = local.site_hostname
    ovh_region         = local.ovh_region
    cloudflare_zone_id = get_env("CLOUDFLARE_ZONE_ID", "00000000000000000000000000000000")
    html_edge_ttl      = 300
    asset_edge_ttl     = 31536000
    storage_unit_path  = unit.storage.path
  }
}
