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
