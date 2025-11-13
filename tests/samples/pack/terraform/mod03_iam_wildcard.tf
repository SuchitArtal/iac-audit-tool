resource "aws_iam_policy" "m3" {
  name   = "m3-wildcard"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{ Effect = "Allow", Action = ["*"], Resource = ["*"] }]
  })
}
