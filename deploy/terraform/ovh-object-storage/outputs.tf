output "bucket_name" {
  description = "Name of the OVHcloud Object Storage bucket."
  value       = ovh_cloud_project_storage.site.name
}

output "virtual_host" {
  description = "Virtual host returned by OVHcloud for the bucket."
  value       = ovh_cloud_project_storage.site.virtual_host
}
