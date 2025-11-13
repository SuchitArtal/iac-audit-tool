resource "aws_cloudtrail" "m9" {
  name                          = "m9"
  s3_bucket_name                = "m9-bucket"
  cloud_watch_logs_group_arn    = "arn:aws:logs:us-east-1:123456789012:log-group:m9"
  cloud_watch_logs_role_arn     = "arn:aws:iam::123456789012:role/m9"
}
