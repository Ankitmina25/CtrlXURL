# =============================================================
# Terraform Main Configuration — CtrlXURL
# File: terraform/main.tf
#
# Tool: Terraform (IaC — Infrastructure as Code)
# Provider: kreuzwerker/docker v3.x (local Docker engine)
#
# Yeh file Docker Compose ka replacement hai.
# Docker Compose: ek YAML file, manually docker compose up karo.
# Terraform: Code se infrastructure define karo, state track hoti hai,
#            changes ka plan pehle dikhta hai THEN apply hota hai.
#
# Containers managed by Terraform:
#   1. ctrlxurl-redis    — Redis cache (port 6379)
#   2. ctrlxurl-backend  — Node.js Express API (port 3000)
#   3. ctrlxurl-frontend — React + Nginx UI (port 5173)
#   4. ctrlxurl-nagios   — Nagios monitoring (port 8080)
# =============================================================

# ── Provider Configuration ───────────────────────────────────
# kreuzwerker/docker = community-maintained Terraform provider
# jo Docker Engine se baat karta hai (AWS ki zaroorat NAHI)
terraform {
  required_version = ">= 1.0"
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

# Local Docker socket se connect karta hai
# Mac par: unix:///var/run/docker.sock
provider "docker" {}

# ── Docker Network ───────────────────────────────────────────
# Sab containers is ek shared network par hain
# Isse containers ek dusre ko NAME se dhundh sakte hain (IP ki zaroorat nahi)
resource "docker_network" "ctrlxurl_net" {
  name   = var.network_name
  driver = "bridge"
}

# ── 1. Redis Cache Container ─────────────────────────────────
# Cache layer — URL data store karta hai fast access ke liye
resource "docker_container" "redis" {
  name    = "${var.project_name}-redis"
  image   = var.redis_image
  restart = "unless-stopped"

  ports {
    internal = 6379
    external = var.redis_port
  }

  networks_advanced {
    name = docker_network.ctrlxurl_net.name
  }
}

# ── 2. Backend Image (Build from Dockerfile) ─────────────────
# Pehle image banao server/Dockerfile se
resource "docker_image" "backend" {
  name = "${var.project_name}-backend:latest"

  build {
    context    = "${var.project_dir}/server"
    dockerfile = "Dockerfile"
  }

  # Har terraform apply par force rebuild nahi hoga
  # sirf Dockerfile ya source change hone par
  triggers = {
    dockerfile = filemd5("${var.project_dir}/server/Dockerfile")
  }
}

# ── 3. Backend Container ─────────────────────────────────────
# Node.js Express API server
resource "docker_container" "backend" {
  name    = "${var.project_name}-backend"
  image   = docker_image.backend.image_id
  restart = "unless-stopped"

  ports {
    internal = 3000
    external = var.backend_port
  }

  # server/.env file directly container mein mount karo
  # Isse MONGO_URI, JWT_TOKEN, EMAIL_USER sab env vars mil jaate hain
  volumes {
    host_path      = "${var.project_dir}/server/.env"
    container_path = "/app/.env"
    read_only      = true
  }

  # REDIS_URL override karo — Docker network name se (127.0.0.1 nahi chalega)
  env = [
    "REDIS_URL=redis://${var.project_name}-redis:6379",
    "NODE_ENV=production",
    "CLIENT_URL=http://localhost:${var.frontend_port}",
    "PORT=3000",
  ]

  networks_advanced {
    name = docker_network.ctrlxurl_net.name
  }

  # Redis pehle start hona chahiye
  depends_on = [docker_container.redis]
}

# ── 4. Frontend Image (Build from Dockerfile) ─────────────────
# Multi-stage build: Node build → Nginx serve
resource "docker_image" "frontend" {
  name = "${var.project_name}-frontend:latest"

  build {
    context    = "${var.project_dir}/client"
    dockerfile = "Dockerfile"
  }

  triggers = {
    dockerfile = filemd5("${var.project_dir}/client/Dockerfile")
  }
}

# ── 5. Frontend Container ─────────────────────────────────────
# React app served via Nginx
resource "docker_container" "frontend" {
  name    = "${var.project_name}-frontend"
  image   = docker_image.frontend.image_id
  restart = "unless-stopped"

  ports {
    internal = 80      # Nginx container ke andar port 80 sun'ta hai
    external = var.frontend_port  # Host par 5173 se access karo
  }

  networks_advanced {
    name = docker_network.ctrlxurl_net.name
  }

  # Backend pehle up hona chahiye (API calls ke liye)
  depends_on = [docker_container.backend]
}

# ── 6. Nagios Monitoring Container ───────────────────────────
# Nagios = network monitoring tool
# Yeh check karta hai ki sab services theek chal rahi hain
resource "docker_container" "nagios" {
  name    = "${var.project_name}-nagios"
  image   = var.nagios_image
  restart = "unless-stopped"

  # Mac ARM64 (M1/M2/M3) par yeh image linux/amd64 chahiye
  # Docker Desktop automatically emulate karta hai via Rosetta
  # Note: docker pull --platform linux/amd64 jasonrivers/nagios:latest
  # pehle run karna pad sakta hai agar pull nahi hua

  ports {
    internal = 80
    external = var.nagios_port
  }

  env = [
    "NAGIOSADMIN_USER=${var.nagios_admin_user}",
    "NAGIOSADMIN_PASS=${var.nagios_admin_pass}",
  ]

  # Custom Nagios config file mount karo
  volumes {
    host_path      = "${var.project_dir}/nagios/ctrlxurl-nagios.cfg"
    container_path = "/opt/nagios/etc/conf.d/ctrlxurl.cfg"
    read_only      = true
  }

  networks_advanced {
    name = docker_network.ctrlxurl_net.name
  }

  depends_on = [docker_container.backend]
}
