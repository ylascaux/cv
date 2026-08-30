include "root" {
  path = find_in_parent_folders("root.hcl")
}

terraform {
  source = "${get_repo_root()}/deploy/terraform/cloudflare-edge"
}

dependency "storage" {
  config_path = values.storage_unit_path

  mock_outputs = {
    bucket_name                  = values.bucket_name
    cloudflare_reader_access_key = "mock-access-key"
    cloudflare_reader_secret_key = "mock-secret-key"
  }

  mock_outputs_allowed_terraform_commands = ["validate", "plan"]
  mock_outputs_merge_strategy_with_state  = "shallow"
}

inputs = {
  zone_id              = values.cloudflare_zone_id
  hostname             = values.site_hostname
  origin_hostname      = "s3.${lower(values.ovh_region)}.io.cloud.ovh.net"
  s3_bucket            = dependency.storage.outputs.bucket_name
  s3_region            = lower(values.ovh_region)
  s3_access_key        = try(dependency.storage.outputs.cloudflare_reader_access_key, "mock-access-key")
  s3_secret_key        = try(dependency.storage.outputs.cloudflare_reader_secret_key, "mock-secret-key")
  worker_name          = values.worker_name
  access_restricted    = values.access_restricted
  allowed_ips          = values.allowed_ips
  manage_zone_rulesets = values.manage_zone_rulesets
  html_edge_ttl        = values.html_edge_ttl
  asset_edge_ttl       = values.asset_edge_ttl
}
