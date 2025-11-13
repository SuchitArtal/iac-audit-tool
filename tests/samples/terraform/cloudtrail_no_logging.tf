resource "aws_cloudtrail" "bad" {
  name                          = "bad-trail"
  s3_bucket_name                = "bad-trail-bucket"
  include_global_service_events = true
  is_multi_region_trail         = true
  # Missing cloud_watch_logs_role_arn and cloud_watch_logs_group_arn
}
