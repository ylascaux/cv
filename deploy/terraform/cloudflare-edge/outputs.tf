output "dns_record_id" {
  description = "Identifier of the proxied Cloudflare DNS record."
  value       = cloudflare_dns_record.site.id
}

output "hostname" {
  description = "Public site hostname."
  value       = local.hostname
}

output "site_url" {
  description = "Public HTTPS URL served by Cloudflare."
  value       = "https://${local.hostname}"
}
