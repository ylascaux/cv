include "root" {
  path = find_in_parent_folders("root.hcl")
}

terraform {
  source = "${get_repo_root()}/deploy/terraform/cloudflare-edge"
}

dependency "storage" {
  config_path = values.storage_unit_path

  mock_outputs = {
    bucket_name                   = values.site_hostname
    cloudflare_reader_access_key = "mock-access-key"
    cloudflare_reader_secret_key = "mock-secret-key"
  }

  mock_outputs_allowed_terraform_commands = ["validate", "plan"]
}

inputs = {
  zone_id         = values.cloudflare_zone_id
  hostname        = dependency.storage.outputs.bucket_name
  origin_hostname = "s3.${lower(values.ovh_region)}.io.cloud.ovh.net"
  s3_bucket       = dependency.storage.outputs.bucket_name
  s3_region       = lower(values.ovh_region)
  s3_access_key   = dependency.storage.outputs.cloudflare_reader_access_key
  s3_secret_key   = dependency.storage.outputs.cloudflare_reader_secret_key
  html_edge_ttl   = values.html_edge_ttl
  asset_edge_ttl  = values.asset_edge_ttl
}
