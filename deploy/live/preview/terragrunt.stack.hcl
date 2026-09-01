locals {
  environment = read_terragrunt_config("${get_terragrunt_dir()}/env.hcl").locals
}

unit "storage" {
  source = "${get_repo_root()}/deploy/units/storage"
  path   = "storage"

  values = {
    bucket_name      = local.environment.bucket_name
    ovh_endpoint     = local.environment.ovh_endpoint
    ovh_region       = local.environment.ovh_region
    ovh_service_name = local.environment.ovh_service_name
    import_existing  = false
    tags = {
      Environment = local.environment.environment
      ManagedBy   = "OpenTofu"
      Project     = "cv"
    }
  }
}

unit "edge" {
  source = "${get_repo_root()}/deploy/units/edge"
  path   = "edge"

  values = {
    site_hostname        = local.environment.site_hostname
    bucket_name          = local.environment.bucket_name
    ovh_region           = local.environment.ovh_region
    cloudflare_zone_id   = local.environment.cloudflare_zone_id
    worker_name          = local.environment.worker_name
    analytics_dataset    = local.environment.analytics_dataset
    access_restricted    = true
    allowed_ips          = local.environment.allowed_ips
    manage_zone_rulesets = false
    html_edge_ttl        = local.environment.html_edge_ttl
    asset_edge_ttl       = local.environment.asset_edge_ttl
    storage_unit_path    = unit.storage.path
  }
}
