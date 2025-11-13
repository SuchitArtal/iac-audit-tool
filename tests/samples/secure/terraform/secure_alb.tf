resource "aws_lb" "good" {
  name               = "good-alb"
  internal           = false
  load_balancer_type = "application"
  subnets            = ["subnet-123", "subnet-456"]

  access_logs {
    bucket  = "good-logs-bucket"
    enabled = true
  }
}
