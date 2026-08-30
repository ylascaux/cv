variable "zone_id" {
  description = "Cloudflare zone identifier containing the site hostname."
  type        = string

  validation {
    condition     = can(regex("^[0-9a-f]{32}$", var.zone_id))
    error_message = "zone_id must be a 32-character Cloudflare identifier."
  }
}

variable "hostname" {
  description = "Public hostname of the static website."
  type        = string

  validation {
    condition     = can(regex("^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$", var.hostname))
    error_message = "hostname must be a valid lowercase DNS hostname."
  }
}

variable "origin_hostname" {
  description = "OVHcloud Object Storage static website endpoint without a scheme."
  type        = string

  validation {
    condition     = can(regex("^[a-z0-9.-]+\\.s3-website\\.[a-z0-9-]+\\.io\\.cloud\\.ovh\\.net$", var.origin_hostname))
    error_message = "origin_hostname must be an OVHcloud S3 website endpoint."
  }
}

variable "html_edge_ttl" {
  description = "Cloudflare edge cache duration for HTML responses, in seconds."
  type        = number
  default     = 300

  validation {
    condition     = var.html_edge_ttl >= 0 && var.html_edge_ttl <= 86400
    error_message = "html_edge_ttl must be between 0 and 86400 seconds."
  }
}

variable "asset_edge_ttl" {
  description = "Cloudflare edge cache duration for versioned static assets, in seconds."
  type        = number
  default     = 31536000

  validation {
    condition     = var.asset_edge_ttl >= 3600 && var.asset_edge_ttl <= 31536000
    error_message = "asset_edge_ttl must be between 3600 and 31536000 seconds."
  }
}
