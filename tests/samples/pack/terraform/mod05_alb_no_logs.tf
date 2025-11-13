resource "aws_lb" "m5" {
  name = "m5"
  load_balancer_type = "application"
  subnets = ["subnet-a", "subnet-b"]
}
