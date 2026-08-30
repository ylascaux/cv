include "root" {
  path = find_in_parent_folders("root.hcl")
}

terraform {
  source = "${get_repo_root()}/deploy/terraform/cloudflare-edge"
}

dependency "storage" {
  config_path = values.storage_unit_path

  mock_outputs = {
    bucket_name = values.site_hostname
  }

  mock_outputs_allowed_terraform_commands = ["validate", "plan"]
}

inputs = {
  zone_id         = values.cloudflare_zone_id
  hostname        = dependency.storage.outputs.bucket_name
  origin_hostname = "${dependency.storage.outputs.bucket_name}.s3-website.${lower(values.ovh_region)}.io.cloud.ovh.net"
  html_edge_ttl   = values.html_edge_ttl
  asset_edge_ttl  = values.asset_edge_ttl
}
