resource "aws_lb" "bad" {
  name               = "bad-alb"
  internal           = false
  load_balancer_type = "application"
  subnets            = ["subnet-123", "subnet-456"]
  # Missing access_logs block
}
