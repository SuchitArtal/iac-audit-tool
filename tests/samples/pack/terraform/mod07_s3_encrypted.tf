resource "aws_s3_bucket" "m7" { bucket = "m7" }
resource "aws_s3_bucket_server_side_encryption_configuration" "m7_enc" {
  bucket = aws_s3_bucket.m7.id
  rule { apply_server_side_encryption_by_default { sse_algorithm = "AES256" } }
}
