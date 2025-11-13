resource "aws_s3_bucket" "bad" {
  bucket = "bad-bucket-example"
}

# Missing server-side encryption configuration
