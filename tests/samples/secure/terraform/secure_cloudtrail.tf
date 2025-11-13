resource "aws_cloudtrail" "good" {
  name                          = "good-trail"
  s3_bucket_name                = "good-trail-bucket"
  include_global_service_events = true
  is_multi_region_trail         = true
  cloud_watch_logs_group_arn    = "arn:aws:logs:us-east-1:123456789012:log-group:good-group"
  cloud_watch_logs_role_arn     = "arn:aws:iam::123456789012:role/CloudTrail_CloudWatchLogs_Role"
}
