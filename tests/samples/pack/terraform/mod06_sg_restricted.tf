resource "aws_security_group" "m6" {
  name = "m6-secure"
  ingress { from_port = 443, to_port = 443, protocol = "tcp", cidr_blocks = ["10.0.0.0/16"] }
}
