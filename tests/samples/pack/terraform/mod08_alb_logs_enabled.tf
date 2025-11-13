resource "aws_lb" "m8" {
  name               = "m8"
  load_balancer_type = "application"
  subnets            = ["subnet-a","subnet-b"]
  access_logs { bucket = "logs-bucket" enabled = true }
}
