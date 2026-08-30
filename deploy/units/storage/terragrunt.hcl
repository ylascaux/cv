include "root" {
  path = find_in_parent_folders("root.hcl")
}

terraform {
  source = "${get_repo_root()}/deploy/terraform/ovh-object-storage"
}

inputs = {
  endpoint     = values.ovh_endpoint
  service_name = values.ovh_service_name
  bucket_name  = values.site_hostname
  region_name  = values.ovh_region
  tags         = values.tags
}
