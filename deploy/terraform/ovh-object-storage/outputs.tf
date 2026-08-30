output "bucket_name" {
  description = "Name of the OVHcloud Object Storage bucket."
  value       = ovh_cloud_project_storage.site.name
}

output "virtual_host" {
  description = "Virtual host returned by OVHcloud for the bucket."
  value       = ovh_cloud_project_storage.site.virtual_host
}

output "cloudflare_reader_access_key" {
  description = "Access key used by the Cloudflare Worker to read private S3 objects."
  value       = ovh_cloud_project_user_s3_credential.cloudflare_reader.access_key_id
  sensitive   = true
}

output "cloudflare_reader_secret_key" {
  description = "Secret key used by the Cloudflare Worker to read private S3 objects."
  value       = ovh_cloud_project_user_s3_credential.cloudflare_reader.secret_access_key
  sensitive   = true
}
