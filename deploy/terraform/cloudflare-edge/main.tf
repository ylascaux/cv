data "cloudflare_zone" "site" {
  zone_id = var.zone_id
}

locals {
  hostname        = trimsuffix(lower(trimspace(var.hostname)), ".")
  origin_hostname = trimsuffix(lower(trimspace(var.origin_hostname)), ".")
  host_expression = "(http.host eq \"${local.hostname}\")"
  asset_expression = join(" or ", [
    "starts_with(http.request.uri.path, \"/_astro/\")",
    "starts_with(http.request.uri.path, \"/fonts/\")",
    "starts_with(http.request.uri.path, \"/logos/\")",
    "starts_with(http.request.uri.path, \"/downloads/\")",
  ])
}

resource "cloudflare_dns_record" "site" {
  zone_id = var.zone_id
  name    = local.hostname
  type    = "CNAME"
  content = local.origin_hostname
  proxied = true
  ttl     = 1
  comment = "OVHcloud Object Storage static website, managed by OpenTofu"
}

resource "cloudflare_workers_script" "static_proxy" {
  account_id      = data.cloudflare_zone.site.account.id
  script_name     = var.worker_name
  content_file    = "${path.module}/worker.js"
  content_sha256  = filesha256("${path.module}/worker.js")
  main_module     = "worker.js"
  compatibility_date = "2026-08-30"

  bindings = [{
    name = "ORIGIN_HOSTNAME"
    type = "plain_text"
    text = local.origin_hostname
  }]
}

resource "cloudflare_workers_route" "site" {
  zone_id = var.zone_id
  pattern = "${local.hostname}/*"
  script  = cloudflare_workers_script.static_proxy.script_name
}

resource "cloudflare_ruleset" "origin_ssl" {
  zone_id     = var.zone_id
  name        = "CV origin TLS mode"
  description = "Use HTTP between Cloudflare and the OVHcloud website endpoint"
  kind        = "zone"
  phase       = "http_config_settings"

  rules = [{
    ref         = "cv_origin_flexible_ssl"
    description = "Flexible SSL only for ${local.hostname}"
    expression  = local.host_expression
    action      = "set_config"
    enabled     = true
    action_parameters = {
      ssl = "flexible"
    }
  }]
}

resource "cloudflare_ruleset" "cache" {
  zone_id     = var.zone_id
  name        = "CV static cache"
  description = "Cache the generated CV while keeping HTML releases responsive"
  kind        = "zone"
  phase       = "http_request_cache_settings"

  rules = [
    {
      ref         = "cv_cache_html"
      description = "Short edge cache for pages and discovery files"
      expression  = local.host_expression
      action      = "set_cache_settings"
      enabled     = true
      action_parameters = {
        cache = true
        edge_ttl = {
          mode    = "override_origin"
          default = var.html_edge_ttl
        }
        browser_ttl = {
          mode = "respect_origin"
        }
      }
    },
    {
      ref         = "cv_cache_assets"
      description = "Long edge cache for generated assets and downloads"
      expression  = "${local.host_expression} and (${local.asset_expression})"
      action      = "set_cache_settings"
      enabled     = true
      action_parameters = {
        cache = true
        edge_ttl = {
          mode    = "override_origin"
          default = var.asset_edge_ttl
        }
        browser_ttl = {
          mode = "respect_origin"
        }
      }
    },
  ]
}

resource "cloudflare_ruleset" "security_headers" {
  zone_id     = var.zone_id
  name        = "CV security headers"
  description = "Security headers added at the Cloudflare edge"
  kind        = "zone"
  phase       = "http_response_headers_transform"

  rules = [{
    ref         = "cv_security_headers"
    description = "Set browser security headers for ${local.hostname}"
    expression  = local.host_expression
    action      = "rewrite"
    enabled     = true
    action_parameters = {
      headers = {
        "Referrer-Policy" = {
          operation = "set"
          value     = "strict-origin-when-cross-origin"
        }
        "Strict-Transport-Security" = {
          operation = "set"
          value     = "max-age=31536000; includeSubDomains"
        }
        "X-Content-Type-Options" = {
          operation = "set"
          value     = "nosniff"
        }
        "X-Frame-Options" = {
          operation = "set"
          value     = "DENY"
        }
      }
    }
  }]
}
