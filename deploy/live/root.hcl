locals {
  ovh_region       = upper(get_env("OVH_REGION", "GRA"))
  state_bucket     = get_env("TG_STATE_BUCKET")
  state_key_prefix = replace(path_relative_to_include(), "/.terragrunt-stack", "")
}

terraform_binary              = "tofu"
terragrunt_version_constraint = "= 1.1.4"

remote_state {
  backend = "s3"

  generate = {
    path      = "backend.tf"
    if_exists = "overwrite_terragrunt"
  }

  config = {
    bucket = local.state_bucket
    key    = "${local.state_key_prefix}/tofu.tfstate"
    region = lower(local.ovh_region)

    endpoints = {
      s3 = "https://s3.${lower(local.ovh_region)}.io.cloud.ovh.net"
    }

    encrypt                     = true
    use_lockfile                = true
    use_path_style              = true
    skip_credentials_validation = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
    skip_metadata_api_check     = true
    skip_s3_checksum            = true
  }
}
