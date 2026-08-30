terraform {
  required_version = "= 1.12.6"

  required_providers {
    ovh = {
      source  = "ovh/ovh"
      version = "= 2.19.0"
    }
  }
}
