# =============================================================
# Terraform Outputs — CtrlXURL
# File: terraform/outputs.tf
#
# Terraform apply hone ke baad yeh values screen par dikhengi.
# "terraform output" command se kabhi bhi dekh sakte ho.
# =============================================================

output "network_id" {
  description = "Docker bridge network ID"
  value       = docker_network.ctrlxurl_net.id
}

output "redis_container_id" {
  description = "Redis container ID"
  value       = docker_container.redis.id
}

output "backend_container_id" {
  description = "Backend container ID"
  value       = docker_container.backend.id
}

output "frontend_container_id" {
  description = "Frontend container ID"
  value       = docker_container.frontend.id
}

output "nagios_container_id" {
  description = "Nagios container ID"
  value       = docker_container.nagios.id
}

output "app_urls" {
  description = "Browser mai kahan kahan jaana hai"
  value = {
    frontend = "http://localhost:${var.frontend_port}"
    backend  = "http://localhost:${var.backend_port}/health"
    nagios   = "http://localhost:${var.nagios_port}/nagios"
    redis    = "redis://localhost:${var.redis_port}"
  }
}
