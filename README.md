# CtrlXURL — Professional URL Shortener & DevOps Showcase

> **Hinglish mein samjhao, English mein code karo** 🚀
>
> Ek full-stack URL shortener jo **4 DevOps tools** ke sath deploy hota hai:
> Puppet (Config Mgmt) + Terraform (IaC) + Docker (Containers) + Nagios (Monitoring)

---

## 📐 Architecture

```
                        ┌──────────────────────────────────────────┐
                        │           DEVOPS LAYER                   │
                        │                                          │
                        │  [Terraform] ──── manages ────► [Docker Containers]
                        │  [Puppet]   ──── heals  ────►  [Running State]
                        │  [Nagios]   ──── watches ───►  [Health Checks]
                        └──────────────────────────────────────────┘
                                          │
                        ┌─────────────────▼──────────────────────┐
                        │           APP LAYER                    │
                        │                                        │
   Browser ──► http://localhost:5173 ──► [Frontend: React+Nginx] │
                        │                       │                │
                        │                       ▼                │
                        │               [Backend: Node.js]       │
                        │                  Port 3000             │
                        │                  /health               │
                        │                  /api/shorten          │
                        │                       │                │
                        │                       ▼                │
                        │               [Redis: Cache]           │
                        │                  Port 6379             │
                        └────────────────────────────────────────┘
                                          │
   Browser ──► http://localhost:8080/nagios ──► [Nagios Dashboard]
```

---

## 🗂️ Project File Structure

```
URL-Shortner/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI pipeline
│
├── client/                     # React Frontend
│   ├── src/
│   │   └── api.js              # Backend API calls
│   ├── Dockerfile              # Multi-stage build: Node → Nginx
│   ├── nginx.conf              # Gzip, React Router, /api/ proxy
│   └── .dockerignore
│
├── server/                     # Node.js Backend
│   ├── app.js                  # Express server + /health endpoint
│   ├── routes/                 # URL shorten/redirect routes
│   ├── controllers/
│   ├── .env                    # Real credentials (gitignored!)
│   ├── Dockerfile              # Node 20 Alpine, production deps
│   └── .dockerignore
│
├── terraform/                  # 🆕 IaC — Docker Compose ka replacement
│   ├── main.tf                 # Containers, network, volumes define karo
│   ├── variables.tf            # Configurable values (ports, names, images)
│   └── outputs.tf              # Apply ke baad URLs print hoti hain
│
├── puppet/
│   ├── ctrlxurl.pp             # Configuration management manifest
│   └── auto-heal-daemon.sh     # Background self-healing script
│
├── nagios/
│   └── ctrlxurl-nagios.cfg     # Custom monitoring checks config
│
├── .gitignore
└── README.md                   # Yeh file!
```

---

## 🌐 Browser URLs Table

| Service | URL | Kya dikhega |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | React URL Shortener App |
| **Backend API** | http://localhost:3000/health | `{"status":"ok"}` |
| **Backend Shorten** | http://localhost:3000/api/shorten | POST endpoint |
| **Nagios Dashboard** | http://localhost:8080/nagios | Monitoring UI |
| **Redis** | redis://localhost:6379 | (CLI se access karo) |

---

## 🔧 TOOL 1: PUPPET — Configuration Management

### Puppet kya hai?
Puppet ek **Configuration Management** tool hai.  
Simple shabdon mein: **"Server ka state define karo, Puppet ensure karega."**

| Docker Compose se fark | Puppet ka approach |
|---|---|
| "Up command chalaao" | "Desired state likho, Puppet khud manage karega" |
| Manual intervention | Self-healing — auto-restart containers |
| No drift detection | Drift detect karta hai aur fix karta hai |

### Puppet ka Architecture (Is Project Mein)

```
puppet/ctrlxurl.pp          ← Manifest (desired state ki definition)
puppet/auto-heal-daemon.sh  ← Background daemon (har 2 min apply)
```

### Puppet Manifest Kya Karta Hai?

```puppet
# 1. /opt/ctrlxurl directory ensure karo
file { '/opt/ctrlxurl': ensure => directory }

# 2. Golden .env file manage karo (config drift protection)
file { '/opt/ctrlxurl/.env':
  content => "PORT=3000\nREDIS_URL=redis://ctrlxurl-redis:6379\n"
}

# 3. Redis container running ensure karo
exec { 'ensure-redis-container-running':
  command => "docker start ctrlxurl-redis",
  unless  => "docker ps | grep -q 'ctrlxurl-redis'",
}

# 4. Backend container running ensure karo
exec { 'ensure-backend-container-running':
  command => "docker start ctrlxurl-backend",
  unless  => "docker ps | grep -q 'ctrlxurl-backend'",
  require => Exec['ensure-redis-container-running'],
}

# 5. Container ke andar .env sync karo (DRIFT PROTECTION!)
exec { 'sync-env-inside-backend-container':
  command => "docker cp /opt/ctrlxurl/.env ctrlxurl-backend:/app/.env",
  unless  => "docker exec ctrlxurl-backend test -f /app/.env",
}

# 6. Cron: har 2 minute mein auto-heal
cron { 'puppet-docker-auto-heal':
  command => "puppet apply puppet/ctrlxurl.pp",
  minute  => '*/2',
}
```

### Puppet Commands

```bash
# PATH set karo (zaruri hai Mac par)
export PATH="/opt/puppetlabs/bin:$PATH"

# Puppet apply — manifest run karo
sudo puppet apply puppet/ctrlxurl.pp

# Noop mode — kya hoga preview karo (apply mat karo)
sudo puppet apply --noop puppet/ctrlxurl.pp

# Version check
puppet --version

# Facts dekho (system info)
puppet facts

# Auto-heal daemon start karo (background mein chalega)
sudo nohup puppet/auto-heal-daemon.sh > /dev/null 2>&1 &

# Log dekho
tail -f /tmp/puppet_heal.log
```

### Puppet Idempotency Demo
```bash
# Pehli baar: changes apply honge
sudo puppet apply puppet/ctrlxurl.pp
# Output: Notice: /Exec[ensure-redis-container-running]: executed ...

# Doosri baar: kuch nahi badle ga — SAME RESULT!
sudo puppet apply puppet/ctrlxurl.pp
# Output: Notice: Applied catalog in 0.XX seconds (no changes)
```

---

## 🏗️ TOOL 2: TERRAFORM — Infrastructure as Code (IaC)

### Terraform kya hai?
Terraform ek **Infrastructure as Code (IaC)** tool hai.  
Simple shabdon mein: **"Code likhke infrastructure banao — manually kuch mat karo."**

> **Important:** Is project mein hum AWS nahi use kar rahe.  
> Terraform ka **Docker Provider** (kreuzwerker/docker) use karte hain  
> jo directly local Docker Engine se baat karta hai.  
> **No AWS account required!** ✅

### Docker Compose vs Terraform

| Feature | Docker Compose ❌ (hataya) | Terraform ✅ (use kar rahe hain) |
|---|---|---|
| Format | YAML | HCL (HashiCorp Config Language) |
| State tracking | Nahi | Haan (`terraform.tfstate`) |
| Plan preview | Nahi | `terraform plan` se pehle dekho |
| IaC principle | Partial | Full IaC |
| Infrastructure drift | Detect nahi | Detect + fix karta hai |
| College DevOps requirement | ❌ | ✅ |

### Terraform Files

```hcl
# terraform/variables.tf — Configurable values
variable "redis_port" {
  default = 6379
}
variable "backend_port" {
  default = 3000
}

# terraform/main.tf — Actual infrastructure
terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "docker" {}  # Local Docker socket se connect karo

resource "docker_network" "ctrlxurl_net" {
  name = "ctrlxurl-network"
}

resource "docker_container" "redis" {
  name    = "ctrlxurl-redis"
  image   = "redis:7-alpine"
  restart = "unless-stopped"
  ports { internal = 6379; external = 6379 }
  networks_advanced { name = docker_network.ctrlxurl_net.name }
}

resource "docker_image" "backend" {
  name  = "ctrlxurl-backend:latest"
  build { context = "../server" }
}

resource "docker_container" "backend" {
  name    = "ctrlxurl-backend"
  image   = docker_image.backend.image_id
  restart = "unless-stopped"
  ports   { internal = 3000; external = 3000 }
  env     = ["REDIS_URL=redis://ctrlxurl-redis:6379"]
  networks_advanced { name = docker_network.ctrlxurl_net.name }
  depends_on = [docker_container.redis]
}

# terraform/outputs.tf — Apply ke baad yeh print hoga
output "app_urls" {
  value = {
    frontend = "http://localhost:5173"
    backend  = "http://localhost:3000/health"
    nagios   = "http://localhost:8080/nagios"
  }
}
```

### Terraform Commands — Step by Step

```bash
cd terraform/

# STEP 1: Init — Provider download karo (pehli baar)
terraform init
# Output: Initializing provider plugins...
#         - Installing kreuzwerker/docker v3.x.x

# STEP 2: Plan — Kya banega preview dekho (APPLY NAHI HOGA)
terraform plan
# Output: Plan: 7 to add, 0 to change, 0 to destroy.
#         (network + 2 images + 4 containers)

# STEP 3: Apply — Actually banao!
terraform apply
# "Enter a value:" aayega → type karo: yes
# Ya silently apply karo:
terraform apply -auto-approve

# STEP 4: Running containers verify karo
docker ps
# Output: ctrlxurl-redis, ctrlxurl-backend, ctrlxurl-frontend, ctrlxurl-nagios

# STEP 5: State dekho (Terraform sab track karta hai)
terraform show

# STEP 6: Outputs dekho
terraform output

# STEP 7: Destroy — Sab containers band karo
terraform destroy -auto-approve
# Phir se banao:
terraform apply -auto-approve

# STEP 8: Plan with detailed diff
terraform plan -out=tfplan
terraform show tfplan
```

### Terraform State — Kya Hota Hai?

```bash
# terraform.tfstate file create hoti hai apply ke baad
# Yeh file batati hai ki kya bana hua hai
cat terraform/terraform.tfstate

# State file gitignored hai (secrets hoti hain isme)
# .gitignore mein add karo:
echo "terraform/.terraform/" >> .gitignore
echo "terraform/terraform.tfstate" >> .gitignore
echo "terraform/terraform.tfstate.backup" >> .gitignore
```

---

## 🐳 TOOL 3: DOCKER — Containers

### Docker kya hai?
Docker ek **containerization** tool hai.  
Simple shabdon mein: **"App aur uske saare dependencies ek box mein pack karo."**

### Is Project Ke Dockerfiles

```dockerfile
# server/Dockerfile — Backend
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN rm -f .env          # .env KABHI image mein mat daalo!
EXPOSE 3000
CMD ["node", "app.js"]
```

```dockerfile
# client/Dockerfile — Frontend (Multi-stage build)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build       # React → static files

FROM nginx:alpine       # Sirf Nginx + built files, Node nahi!
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### Docker Commands

```bash
# Images dekho
docker images

# Running containers dekho
docker ps

# Sab containers dekho (stopped bhi)
docker ps -a

# Container logs dekho
docker logs ctrlxurl-backend
docker logs ctrlxurl-backend --follow   # Live logs

# Container ke andar jaao
docker exec -it ctrlxurl-backend sh

# Container restart karo
docker restart ctrlxurl-backend

# Network dekho
docker network ls
docker network inspect ctrlxurl-network

# Image manually build karo
docker build -t ctrlxurl-backend:latest ./server
docker build -t ctrlxurl-frontend:latest ./client

# Sab containers manually band karo
docker stop ctrlxurl-redis ctrlxurl-backend ctrlxurl-frontend ctrlxurl-nagios

# Sab containers delete karo
docker rm ctrlxurl-redis ctrlxurl-backend ctrlxurl-frontend ctrlxurl-nagios
```

### Terraform ke sath Docker workflow

```bash
# Pehli baar setup:
cd terraform
terraform init
terraform apply -auto-approve

# App use karo...

# Containers band karo:
terraform destroy -auto-approve

# Phir se start karo:
terraform apply -auto-approve
```

---

## 📡 TOOL 4: NAGIOS — Monitoring

### Nagios kya hai?
Nagios ek **monitoring tool** hai.  
Simple shabdon mein: **"24/7 watch rakho — kuch bhi fail ho toh alert karo."**

### Nagios Configuration

```nagios
# nagios/ctrlxurl-nagios.cfg

# Host define karo
define host {
  use         linux-server
  host_name   ctrlxurl-backend
  address     ctrlxurl-backend       # Docker network name se resolve hoga
  alias       CtrlXURL Backend Server
}

# Check 1: Container alive hai?
define service {
  host_name           ctrlxurl-backend
  service_description Backend Container Alive
  check_command       check_ping!100.0,20%!500.0,60%
  check_period        24x7
}

# Check 2: HTTP /health endpoint OK hai?
define service {
  host_name           ctrlxurl-backend
  service_description Backend API Health Check
  check_command       check_http!-p 3000 -u /health
  check_period        24x7
}

# Check 3: Disk space
define service {
  host_name           localhost
  service_description Disk Usage
  check_command       check_local_disk!20%!10%!/
  check_period        24x7
}

# Check 4: CPU load
define service {
  host_name           localhost
  service_description CPU Load
  check_command       check_local_load!5.0,4.0,3.0!10.0,6.0,4.0
  check_period        24x7
}
```

### Nagios Access

```bash
# Browser mein jaao:
# http://localhost:8080/nagios
# Username: nagiosadmin
# Password: nagios123

# Nagios container logs
docker logs ctrlxurl-nagios

# Nagios config test karo (container ke andar)
docker exec ctrlxurl-nagios /opt/nagios/bin/nagios -v /opt/nagios/etc/nagios.cfg

# Nagios reload karo (config change ke baad)
docker exec ctrlxurl-nagios /opt/nagios/bin/nagios -s /opt/nagios/var/nagios.lock
```

### Nagios Status Explain (Jo Screenshot Mein Dikh Raha Tha)

```
Service Status Details For All Hosts

ctrlxurl-backend:
  ✅ Backend API Health Check    — OK (HTTP 200)
  ✅ Backend Container Alive     — OK (PING 0ms RTA)
  ✅ CPU Load                    — OK (0.49, 0.83, 1.09)
  ✅ Disk Usage                  — OK (198GB free)

localhost:
  ✅ Current Load                — OK
  ✅ Current Users               — OK (0 users)
  ⚠️  HTTP                       — WARNING: 401 Unauthorized
     (Yeh NORMAL hai! Nagios localhost ka HTTP check karta hai
      jahan Nagios khud hai, aur login required hota hai)
  ✅ PING                        — OK (0.17ms RTA)
  ✅ Root Partition              — OK
  ✅ Swap Usage                  — OK (100% free)
  ✅ Total Processes             — OK (29 processes)
```

---

## ⚙️ GitHub Actions CI Pipeline

```yaml
# .github/workflows/ci.yml

name: CI Pipeline — CtrlXURL
on: [push, pull_request]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4           # 1. Code download karo

      - uses: actions/setup-node@v4         # 2. Node.js setup
        with:
          node-version: '20'

      - run: npm install                    # 3. Dependencies install
        working-directory: server

      - run: npm test                       # 4. Tests chalaao
        working-directory: server

      - run: docker build -t ctrlxurl-backend:ci ./server   # 5. Docker build verify
```

---

## 🚀 Complete Setup Guide

### Prerequisites
```bash
# Yeh sab installed hona chahiye:
docker --version          # Docker Desktop
terraform --version       # >= 1.0
puppet --version          # Puppet 7.x
node --version            # Node.js >= 18
```

### First Time Setup

```bash
# 1. Repo clone karo
git clone https://github.com/Ankitmina25/CtrlXURL.git
cd URL-Shortner

# 2. Backend .env file banao
cp server/.env.example server/.env
# .env mein apni values daalo (MongoDB URI, JWT secret, etc.)

# 3. Terraform init karo (pehli baar provider download hoga)
cd terraform
terraform init

# 4. Infrastructure banao (Docker Terraform se manage karega)
terraform apply -auto-approve

# 5. Verify karo — sab containers chal rahe hain?
docker ps
# Expected: 4 containers — redis, backend, frontend, nagios

# 6. Browser mein open karo
# Frontend: http://localhost:5173
# Nagios:   http://localhost:8080/nagios
# Backend:  http://localhost:3000/health

# 7. (Optional) Puppet daemon start karo (self-healing)
export PATH="/opt/puppetlabs/bin:$PATH"
sudo puppet apply puppet/ctrlxurl.pp
sudo nohup puppet/auto-heal-daemon.sh > /dev/null 2>&1 &
```

### Daily Workflow

```bash
# Start karo
cd terraform && terraform apply -auto-approve

# Kaam karo...

# Stop karo
terraform destroy -auto-approve
```

---

## 🛑 Sab Band Karna Hai?

```bash
# Terraform se sab containers destroy karo
cd terraform
terraform destroy -auto-approve

# Ya manually:
docker stop ctrlxurl-redis ctrlxurl-backend ctrlxurl-frontend ctrlxurl-nagios
docker rm ctrlxurl-redis ctrlxurl-backend ctrlxurl-frontend ctrlxurl-nagios
docker network rm ctrlxurl-network

# Puppet daemon band karo (agar chal raha hai)
sudo pkill -f auto-heal-daemon
```

---

## 🎓 Key Learnings (Viva Answers)

### Q: Docker Compose aur Terraform mein fark kya hai?

| | Docker Compose | Terraform |
|---|---|---|
| **Purpose** | Multi-container apps | Infrastructure as Code |
| **State** | No state tracking | `terraform.tfstate` file |
| **Plan** | No preview | `terraform plan` se preview |
| **Idempotent** | Partial | Full idempotency |
| **Industry use** | Development | Production infra |

**Answer:** Docker Compose ek YAML file hai jo `docker compose up` se run hoti hai — simple hai lekin state track nahi karta. Terraform code se infrastructure define karta hai, state file maintain karta hai, pehle plan dikhata hai phir apply karta hai. DevOps mein Terraform industry standard hai.

---

### Q: Puppet kya karta hai aur kyun zaruri hai?

**Answer:** Puppet **Configuration Management** tool hai. Yeh "desired state" define karta hai — matlab aap batate ho "mujhe yeh chahiye" aur Puppet ensure karta hai woh state hamesha maintain rahe. Agar koi container band ho jaye, Puppet khud restart karega (self-healing). Ek aur important feature: **drift detection** — agar koi manually kuch change kare, Puppet detect karega aur revert karega.

---

### Q: Nagios monitoring kyun use kiya?

**Answer:** Nagios 24/7 infrastructure watch karta hai. Hum 4 checks define kiye: container alive hai kya, HTTP endpoint respond kar raha hai kya, disk space theek hai kya, CPU load normal hai kya. Agar kuch fail hota hai, Nagios alert bhejta hai. Is project mein humne dekha ki 10 checks GREEN hain aur 1 WARNING hai (HTTP 401 — jo expected hai kyunki Nagios khud login protected hai).

---

### Q: Terraform state file kya hoti hai?

**Answer:** `terraform.tfstate` ek JSON file hai jo track karta hai ki Terraform ne kya resources banaye hain. Jab aap `terraform apply` karte ho, Terraform is file se compare karta hai ki real infrastructure aur desired state mein kya fark hai. Isliye Terraform idempotent hai — baar baar apply karo, sirf changes apply honge.

---

### Q: Docker multi-stage build kyun use kiya?

**Answer:** Frontend ke liye multi-stage build use ki. Pehle stage mein Node.js se React code build kiya (npm run build). Doosre stage mein sirf Nginx image li aur build output copy kiya. Result: final image mein Node.js bilkul nahi — sirf Nginx + static files. Image size ~90% kam hoti hai. Security bhi better hoti hai — attack surface kam hota hai.

---

## 👨‍💻 Author

**Ankit Meena** — DevOps Project  
GitHub: [@Ankitmina25](https://github.com/Ankitmina25)  
Email: ankitmina2512@gmail.com

---

*Terraform + Puppet + Docker + Nagios — Yeh charo milke ek production-ready DevOps pipeline banate hain* 🔥

---

## ⚡ QUICK START — Project Chalane Ki Poori Commands (Flow Mein)

> Copy-paste karo — ek ek step follow karo. Bas itna!

---

### 🔁 STEP 0 — Pehli Baar Setup (Sirf Ek Baar Karna Hai)

```bash
# 0.1 Repo clone karo
git clone https://github.com/Ankitmina25/CtrlXURL.git
cd URL-Shortner

# 0.2 Backend .env file banao (apni real values daalo)
cp server/.env.example server/.env   # ya manually banao
# nano server/.env   → MONGO_URI, JWT_SECRET, etc. daalo

# 0.3 Terraform provider download karo (internet chahiye — sirf ek baar)
cd terraform
terraform init
cd ..
```

---

### 🚀 STEP 1 — Project Start Karo (Terraform se)

```bash
# Terraform folder mein jaao
cd terraform

# Pehle dekho kya banega (optional but good practice)
terraform plan

# Apply karo — sab containers ban'ge automatically!
# (Pehli baar 3-5 min lagenge — Docker images build hongi)
terraform apply -auto-approve

# Wapas project root mein jaao
cd ..

# Verify karo — 4 containers chal rahe hain?
docker ps
```

**Expected output of `docker ps`:**
```
CONTAINER ID   IMAGE                      PORTS                    NAMES
xxxxxxxxxxxx   jasonrivers/nagios:latest  0.0.0.0:8080->80/tcp     ctrlxurl-nagios
xxxxxxxxxxxx   ctrlxurl-frontend:latest   0.0.0.0:5173->80/tcp     ctrlxurl-frontend
xxxxxxxxxxxx   ctrlxurl-backend:latest    0.0.0.0:3000->3000/tcp   ctrlxurl-backend
xxxxxxxxxxxx   redis:7-alpine             0.0.0.0:6379->6379/tcp   ctrlxurl-redis
```

---

### 🌐 STEP 2 — Browser Mein Open Karo

```
Frontend App  →  http://localhost:5173
Backend API   →  http://localhost:3000/health
Nagios        →  http://localhost:8080/nagios  (user: nagiosadmin / pass: nagios123)
```

---

### 🔧 STEP 3 — Puppet Chalaao (Config Management + Self-Healing)

```bash
# PATH set karo (Mac par zaruri hai)
export PATH="/opt/puppetlabs/bin:$PATH"

# Puppet apply karo — desired state enforce karega
sudo puppet apply puppet/ctrlxurl.pp

# (Optional) Background mein auto-heal daemon start karo
# Yeh har 2 minute mein puppet apply karega automatically
sudo nohup puppet/auto-heal-daemon.sh > /dev/null 2>&1 &

# Puppet logs dekho
tail -f /tmp/puppet_heal.log
```

---

### 🔍 STEP 4 — Containers Ko Monitor Karo

```bash
# Sab containers ka status
docker ps

# Backend logs dekho (live)
docker logs ctrlxurl-backend --follow

# Frontend logs dekho
docker logs ctrlxurl-frontend

# Nagios logs dekho
docker logs ctrlxurl-nagios

# Backend API health check
curl http://localhost:3000/health
# Expected: {"status":"ok"}

# Redis test karo
docker exec -it ctrlxurl-redis redis-cli ping
# Expected: PONG

# Terraform output dekho (URLs)
cd terraform && terraform output && cd ..
```

---

### 🛑 STEP 5 — Project Band Karo

```bash
# Terraform se sab containers destroy karo
cd terraform
terraform destroy -auto-approve
cd ..

# Puppet daemon bhi band karo (agar chala raha hai)
sudo pkill -f auto-heal-daemon.sh
```

---

### 🔄 STEP 6 — Dobara Start Karna Hai?

```bash
# Bas itna karo:
cd terraform
terraform apply -auto-approve
cd ..
docker ps   # verify
```

---

### 🧹 BONUS — Useful Debug Commands

```bash
# Kisi container ke andar jaao
docker exec -it ctrlxurl-backend sh
docker exec -it ctrlxurl-redis sh

# Container restart karo
docker restart ctrlxurl-backend

# Sirf ek container band karo
docker stop ctrlxurl-nagios

# Docker images dekho
docker images

# Docker network dekho
docker network inspect ctrlxurl-network

# Terraform current state dekho
cd terraform && terraform show

# Puppet noop mode (kya change hoga — apply nahi karega)
sudo puppet apply --noop puppet/ctrlxurl.pp
```

---

### 📋 Ek Nazar Mein — Full Flow

```
git clone  →  terraform init  →  terraform apply  →  browser open  →  puppet apply
   ↓                                    ↓                                   ↓
 Code lao                     4 containers ready                     Self-healing ON

Kaam karo...

terraform destroy  →  Project band
```

---

*Happy Coding & DevOps! 🚀*
