include "root" {
  path = find_in_parent_folders("root.hcl")
}

terraform {
  source = "${get_repo_root()}/deploy/terraform/ovh-object-storage"
}

inputs = {
  endpoint        = values.ovh_endpoint
  service_name    = values.ovh_service_name
  bucket_name     = values.bucket_name
  region_name     = values.ovh_region
  import_existing = try(values.import_existing, false)
  tags            = values.tags
}
