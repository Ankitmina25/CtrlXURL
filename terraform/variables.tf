# =============================================================
# Terraform Variables — CtrlXURL
# File: terraform/variables.tf
#
# Yahan project ke saare configurable values define hote hain.
# Agar kuch change karna ho (port, name, image) sirf yahaan karo.
# =============================================================

variable "project_name" {
  description = "Project ka naam — sab containers is prefix se ban'te hain"
  type        = string
  default     = "ctrlxurl"
}

variable "project_dir" {
  description = "Host machine par project ka absolute path"
  type        = string
  default     = "/Users/ankitmeena/CodeBase/ProjectLab/URL-Shortner"
}

variable "redis_image" {
  description = "Redis Docker image"
  type        = string
  default     = "redis:7-alpine"
}

variable "redis_port" {
  description = "Redis host port (bahar se access karne ke liye)"
  type        = number
  default     = 6379
}

variable "backend_port" {
  description = "Backend API host port"
  type        = number
  default     = 3000
}

variable "frontend_port" {
  description = "Frontend (React + Nginx) host port"
  type        = number
  default     = 5173
}

variable "nagios_port" {
  description = "Nagios monitoring dashboard host port"
  type        = number
  default     = 8080
}

variable "nagios_image" {
  description = "Nagios Docker image"
  type        = string
  default     = "jasonrivers/nagios:latest"
}

variable "nagios_admin_user" {
  description = "Nagios web UI admin username"
  type        = string
  default     = "nagiosadmin"
}

variable "nagios_admin_pass" {
  description = "Nagios web UI admin password"
  type        = string
  default     = "nagios123"
  sensitive   = true
}

variable "network_name" {
  description = "Docker bridge network ka naam"
  type        = string
  default     = "ctrlxurl-network"
}

variable "puppet_master_image" {
  description = "Puppet Master (Server) Docker image"
  type        = string
  default     = "puppet/puppetserver:latest"
}

variable "puppet_agent_image" {
  description = "Puppet Agent Docker image"
  type        = string
  default     = "puppet/puppet-agent:latest"
}

variable "puppet_master_port" {
  description = "Puppet Master SSL port"
  type        = number
  default     = 8140
}
