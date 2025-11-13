data "aws_iam_policy_document" "good" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["arn:aws:s3:::example-bucket/*"]
  }
}
