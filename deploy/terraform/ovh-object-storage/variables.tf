variable "service_name" {
  description = "OVHcloud Public Cloud project identifier. When null, OVH_CLOUD_PROJECT_SERVICE is used by the provider."
  type        = string
  default     = null
  nullable    = true
}

variable "region_name" {
  description = "OVHcloud Object Storage region."
  type        = string

  validation {
    condition     = can(regex("^[A-Za-z0-9-]+$", var.region_name))
    error_message = "region_name must be a valid OVHcloud region identifier."
  }
}

variable "bucket_name" {
  description = "Bucket name, equal to the public hostname because Cloudflare Free cannot override the origin Host header."
  type        = string

  validation {
    condition     = can(regex("^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$", var.bucket_name))
    error_message = "bucket_name must be a valid lowercase DNS hostname."
  }
}

variable "tags" {
  description = "Tags applied to the OVHcloud storage container."
  type        = map(string)
  default     = {}
}
