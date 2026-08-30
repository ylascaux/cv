import {
  for_each = var.import_existing ? toset([var.bucket_name]) : toset([])

  to = ovh_cloud_project_storage.site
  id = "${var.service_name}/${upper(var.region_name)}/${each.value}"
}

resource "ovh_cloud_project_storage" "site" {
  service_name = var.service_name
  region_name  = upper(var.region_name)
  name         = lower(var.bucket_name)
  hide_objects = true

  versioning = {
    status = "enabled"
  }

  encryption = {
    sse_algorithm = "AES256"
  }

  tags = var.tags

  lifecycle {
    prevent_destroy = true
  }
}

resource "ovh_cloud_project_user" "cloudflare_reader" {
  service_name = var.service_name
  description  = "Cloudflare Worker read-only access to ${ovh_cloud_project_storage.site.name}"
  role_names   = ["objectstore_operator"]
}

resource "ovh_cloud_project_user_s3_credential" "cloudflare_reader" {
  service_name = ovh_cloud_project_user.cloudflare_reader.service_name
  user_id      = ovh_cloud_project_user.cloudflare_reader.id
}

resource "ovh_cloud_project_user_s3_policy" "cloudflare_reader" {
  service_name = ovh_cloud_project_user.cloudflare_reader.service_name
  user_id      = ovh_cloud_project_user.cloudflare_reader.id

  policy = jsonencode({
    Statement = [{
      Sid      = "ReadCvObjects"
      Effect   = "Allow"
      Action   = ["s3:GetObject"]
      Resource = ["arn:aws:s3:::${ovh_cloud_project_storage.site.name}/*"]
    }]
  })
}
