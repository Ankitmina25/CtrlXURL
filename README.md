# CtrlXURL — Professional URL Shortener & DevOps Showcase

> **Hinglish mein samjhao, English mein code karo** 🚀
>
> Ek complete production-grade URL shortener web application jo **4 core DevOps tools** ke sath deploy aur manage hoti hai:
> **Terraform (IaC)** + **Puppet (Master-Agent Config & Auto-Healing)** + **Docker (Containers & Docker Socket)** + **Nagios (24/7 Monitoring)**

---

## 📑 TABLE OF CONTENTS
1. [Architecture & System Flow](#-1-architecture--system-flow)
2. [Project File Structure](#-2-project-file-structure)
3. [Browser URLs & Credentials Table](#-3-browser-urls--credentials-table)
4. [TOOL 1: TERRAFORM — Infrastructure as Code (IaC)](#-tool-1-terraform--infrastructure-as-code-iac)
5. [TOOL 2: PUPPET — Master-Agent Architecture & Auto-Healing](#-tool-2-puppet--master-agent-architecture--auto-healing)
6. [TOOL 3: DOCKER & DOCKER SOCKET (`docker.sock`)](#-tool-3-docker--docker-socket-dockersock)
7. [TOOL 4: NAGIOS — 24/7 Network & Service Monitoring](#-tool-4-nagios--247-network--service-monitoring)
8. [GITHUB ACTIONS — Continuous Integration (CI)](#-github-actions--continuous-integration-ci)
9. [⚡ PRACTICAL DEMO SCRIPT (Sir ke Saamne Kya Run Karna Hai)](#-practical-demo-script-sir-ke-saamne-kya-run-karna-hai)
10. [🎓 TOP 10 VIVA QUESTIONS & BULLETPROOF ANSWERS](#-top-10-viva-questions--bulletproof-answers)

---

## 📐 1. Architecture & System Flow

```
                        ┌─────────────────────────────────────────────────────────┐
                        │                     DEVOPS LAYER                        │
                        │                                                         │
                        │  [Terraform] ──────── provisions ──────► [6 Containers] │
                        │  [Puppet Master: 8140] ◄── SSL Handshake ──► [Agent]   │
                        │  [Puppet Agent] ───── heals & enforces ─► [State/.env] │
                        │  [Nagios: 8080] ───── 24/7 monitors ───► [App & Master]│
                        └───────────────────────────┬─────────────────────────────┘
                                                    │
                        ┌───────────────────────────▼─────────────────────────────┐
                        │                       APP LAYER                         │
                        │                                                         │
   Browser ──► http://localhost:5173 ──► [Frontend: React+Nginx]                  │
                        │                               │                         │
                        │                               ▼                         │
                        │                       [Backend: Node.js]                │
                        │                          Port 3000                      │
                        │                          /health                        │
                        │                          /api/shorten                   │
                        │                               │                         │
                        │                               ▼                         │
                        │                       [Redis: Cache]                    │
                        │                          Port 6379                      │
                        └─────────────────────────────────────────────────────────┘
                                                    │
   Browser ──► http://localhost:8080/nagios ────► [Nagios Dashboard]
```

---

## 🗂️ 2. Project File Structure

```
URL-Shortner/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI pipeline (Node install, test, docker build)
│
├── client/                     # Frontend (React + Vite)
│   ├── src/                    # React UI source code
│   ├── Dockerfile              # Multi-stage build (Node builder -> Nginx Alpine)
│   ├── nginx.conf              # Reverse proxy, gzip, /api/ redirection, React router
│   └── .dockerignore
│
├── server/                     # Backend (Node.js + Express)
│   ├── app.js                  # Express API server + /health endpoint
│   ├── routes/                 # URL shorten/redirect API routes
│   ├── controllers/            # Controller logic + Redis cache check
│   ├── .env                    # Real database & JWT credentials (gitignored)
│   ├── Dockerfile              # Production Node 20 Alpine image
│   └── .dockerignore
│
├── terraform/                  # ⭐️ Infrastructure as Code (Docker Compose ka Replacement)
│   ├── main.tf                 # Sabhi 6 containers, networks, volumes ka resource code
│   ├── variables.tf            # Configurable ports, images, container names
│   └── outputs.tf              # Apply ke baad printed endpoints & container IDs
│
├── puppet/                     # ⭐️ Configuration Management & Auto-Healing
│   ├── manifests/
│   │   └── site.pp             # Master Manifest (Catalog) served to Agent over SSL
│   └── bin/
│       └── docker              # Static Docker CLI binary mounted inside Agent
│
├── nagios/                     # ⭐️ Monitoring Layer
│   └── ctrlxurl-nagios.cfg     # Health checks config (Ping, HTTP 200, CPU, Disk, Master 8140)
│
├── PUPPET_MASTER_AGENT_GUIDE.md# Dedicated viva demonstration guide
├── .gitignore                  # Git privacy rules (blocks secrets, terraform state, logs)
└── README.md                   # Complete master documentation (Yeh file!)
```

---

## 🌐 3. Browser URLs & Credentials Table

| Service | Local URL | Username / Password | Kya Kaam Karta Hai? |
|---|---|---|---|
| **Frontend UI** | [http://localhost:5173](http://localhost:5173) | — | Main URL Shortener Web App (React + Nginx) |
| **Backend API** | [http://localhost:3000/health](http://localhost:3000/health) | — | Node.js Express server health endpoint (Returns `{"status":"ok"}`) |
| **Nagios Dashboard** | [http://localhost:8080/nagios](http://localhost:8080/nagios) | `nagiosadmin` / `nagios123` | 24/7 Monitoring Dashboard for Containers & Host |
| **Puppet Master** | `https://localhost:8140` | SSL Certificate Auth | Puppet Server SSL CA endpoint (Internal Port 8140) |
| **Redis Cache** | `redis://localhost:6379` | — | In-memory key-value cache for ultra-fast URL lookups |

---

## 🏗️ TOOL 1: TERRAFORM — Infrastructure as Code (IaC)

### 1. Terraform kya hai aur Docker Compose se kyun better hai?
* **Terraform** ek declarative **Infrastructure as Code (IaC)** tool hai.
* Pehle projects mein hum `docker-compose.yml` likhte the. Lekin industry mein Docker Compose production infra ke liye use nahi hota kyunki usme **State Management (`.tfstate`)**, **Plan Preview (`terraform plan`)**, aur **Dependency Graphs** nahi hote.
* Humne Terraform ka **`kreuzwerker/docker` provider** use kiya hai jo directly local Docker socket se baat karta hai — **isliye kisi AWS ya Cloud account ki zaroorat nahi hai!**

---

### 2. `terraform/main.tf` — Code aur Line-by-Line Meaning

```hcl
terraform {
  required_version = ">= 1.0"
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "docker" {} # Host machine ke unix:///var/run/docker.sock se connect karta hai
```
* `terraform`: Yeh block Terraform version aur required providers define karta hai.
* `source = "kreuzwerker/docker"`: Official community provider jo Docker Engine ke API se communicate karta hai.
* `provider "docker" {}`: Local Docker engine ko initialize karta hai.

#### Docker Bridge Network:
```hcl
resource "docker_network" "ctrlxurl_net" {
  name   = var.network_name
  driver = "bridge"
}
```
* `resource`: Terraform ka keyword jo batata hai ki ek naya component create karna hai.
* `docker_network`: Type of resource (Docker network).
* `driver = "bridge"`: Bridge network par saare containers ek doosre ko unke **naam se (DNS resolution)** dhoondh sakte hain (IP ki zaroorat nahi hoti).

#### Backend Container & Image:
```hcl
resource "docker_image" "backend" {
  name = "${var.project_name}-backend:latest"
  build {
    context    = "${var.project_dir}/server"
    dockerfile = "Dockerfile"
  }
  triggers = {
    dockerfile = filemd5("${var.project_dir}/server/Dockerfile")
  }
}

resource "docker_container" "backend" {
  name    = "${var.project_name}-backend"
  image   = docker_image.backend.image_id
  restart = "unless-stopped"
  ports {
    internal = 3000
    external = var.backend_port
  }
  volumes {
    host_path      = "${var.project_dir}/server/.env"
    container_path = "/app/.env"
    read_only      = true
  }
  env = [
    "REDIS_URL=redis://${var.project_name}-redis:6379",
    "NODE_ENV=production",
    "CLIENT_URL=http://localhost:${var.frontend_port}",
    "PORT=3000",
  ]
  networks_advanced { name = docker_network.ctrlxurl_net.name }
  depends_on = [docker_container.redis]
}
```
* `docker_image`: Dockerfile se image build karta hai.
* `triggers { filemd5(...) }`: Har baar `terraform apply` par rebuild nahi karta; sirf tabhi karta hai jab Dockerfile mein koi change ho.
* `volumes`: Host machine ki `server/.env` file ko container ke `/app/.env` path par bind mount karta hai (isse `MONGO_URI` aur `JWT_TOKEN` mil jaate hain).
* `depends_on = [docker_container.redis]`: Ensure karta hai ki Backend tabhi start ho jab Redis pehle up ho chuka ho!

#### Puppet Master Container:
```hcl
resource "docker_container" "puppet_master" {
  name     = "puppet-master"
  hostname = "puppet"
  image    = var.puppet_master_image
  restart  = "unless-stopped"
  ports {
    internal = 8140
    external = var.puppet_master_port
  }
  env = [
    "PUPPETSERVER_JAVA_ARGS=-Xms512m -Xmx512m",
    "DNS_ALT_NAMES=puppet,puppet-master,localhost",
    "AUTOSIGN=true",
  ]
  volumes {
    host_path      = "${var.project_dir}/puppet/manifests"
    container_path = "/etc/puppetlabs/code/environments/production/manifests"
    read_only      = true
  }
  networks_advanced { name = docker_network.ctrlxurl_net.name }
}
```
* `hostname = "puppet"`: Default DNS name jise Puppet Agent dhoondhta hai.
* `PUPPETSERVER_JAVA_ARGS=-Xms512m -Xmx512m`: JVM memory ko limit karta hai taaki laptop hang na ho.
* `AUTOSIGN=true`: Puppet CA ko bolta hai ki aane wale Agent certificates ko automatically verify karke sign kar do!
* `volumes`: Host ke `puppet/manifests` folder ko Puppet Server ke code environment mein map karta hai.

#### Puppet Agent Container:
```hcl
resource "docker_container" "puppet_agent" {
  name     = "puppet-agent"
  hostname = "puppet-agent"
  image    = var.puppet_agent_image
  restart  = "unless-stopped"
  entrypoint = [
    "/bin/sh",
    "-c",
    "sleep 15; puppet agent --test --server puppet || true; exec puppet agent --verbose --no-daemonize --runinterval 60 --server puppet"
  ]
  volumes {
    host_path      = "/var/run/docker.sock"
    container_path = "/var/run/docker.sock"
  }
  volumes {
    host_path      = "${var.project_dir}/puppet/bin/docker"
    container_path = "/usr/local/bin/docker"
    read_only      = true
  }
  networks_advanced { name = docker_network.ctrlxurl_net.name }
  depends_on = [docker_container.puppet_master]
}
```
* `entrypoint`: Pehle 15s wait karta hai, fir initial SSL handshake karta hai (`--test`), fir har **60 seconds (`--runinterval 60`)** mein background mein Master se catalog pull karta hai!
* `volumes (/var/run/docker.sock)`: Host ke Docker Engine ka direct control channel.
* `volumes (/usr/local/bin/docker)`: Static docker binary jisse Agent container ke andar se `docker start` chala sake.

---

### 3. Terraform Commands (Daily Use)
```bash
cd terraform

# 1. Provider initialize karo
terraform init

# 2. Dry-run preview dekho (Kya create hoga)
terraform plan

# 3. Apply karo (Saare 6 containers ban jayenge)
terraform apply -auto-approve

# 4. State dekho
terraform show

# 5. Output URLs dekho
terraform output

# 6. Sab destroy karo
terraform destroy -auto-approve
```

---

## 🎭 TOOL 2: PUPPET — Master-Agent Architecture & Auto-Healing

### 1. Puppet kya karta hai?
* Terraform ne containers **Day 1** par bana diye.
* Lekin production mein agar container crash ho jaye ya config corrupt ho jaye, toh unhe **continuous check aur revive (Auto-Heal)** karne ka kaam Puppet karta hai.
* Humne **Client-Server (Master-Agent) Architecture** use kiya hai:
  - `puppet-master` container = Server (Port 8140, SSL CA).
  - `puppet-agent` container = Client Node (Har 60s mein catalog sync karta hai).

---

### 2. `puppet/manifests/site.pp` — Code aur Line-by-Line Meaning

```puppet
node default {

  # ── 1. Proof of Master-Agent SSL Handshake ───────────────────
  file { '/tmp/puppet-client-server-verified.txt':
    ensure  => file,
    owner   => 'root',
    mode    => '0644',
    content => "===============================================\nCtrlXURL DevOps — Puppet Master-Agent Architecture\n===============================================\nStatus: Active & Verified\nNode: ${trusted['certname']}\nServer: Puppet Master (Port 8140)\nAuto-Heal Interval: 60 Seconds (Every 1 Minute)\n",
  }

  # ── 2. Master App Directory & Golden Config ──────────────────
  file { '/opt/ctrlxurl':
    ensure => directory,
    owner  => 'root',
    mode   => '0755',
  }

  file { '/opt/ctrlxurl/.env':
    ensure  => file,
    owner   => 'root',
    mode    => '0600',
    content => "PORT=3000\nNODE_ENV=production\nBASE_URL=http://localhost:3000\nREDIS_URL=redis://ctrlxurl-redis:6379\nMANAGED_BY=PuppetMaster-Agent-SSL\n",
    require => File['/opt/ctrlxurl'],
  }

  # ── 3. AUTO-HEALING: Ensure Redis Container is Running ────────
  exec { 'ensure-redis-running':
    command => '/usr/local/bin/docker start ctrlxurl-redis',
    unless  => "/usr/local/bin/docker ps --filter 'name=ctrlxurl-redis' --filter 'status=running' -q | grep .",
    path    => ['/usr/local/bin', '/usr/bin', '/bin'],
  }

  # ── 4. AUTO-HEALING: Ensure Backend Container is Running ──────
  exec { 'ensure-backend-running':
    command => '/usr/local/bin/docker start ctrlxurl-backend',
    unless  => "/usr/local/bin/docker ps --filter 'name=ctrlxurl-backend' --filter 'status=running' -q | grep .",
    path    => ['/usr/local/bin', '/usr/bin', '/bin'],
    require => Exec['ensure-redis-running'],
  }

  # ── 5. AUTO-HEALING: Ensure Frontend Container is Running ─────
  exec { 'ensure-frontend-running':
    command => '/usr/local/bin/docker start ctrlxurl-frontend',
    unless  => "/usr/local/bin/docker ps --filter 'name=ctrlxurl-frontend' --filter 'status=running' -q | grep .",
    path    => ['/usr/local/bin', '/usr/bin', '/bin'],
    require => Exec['ensure-backend-running'],
  }

  # ── 6. AUTO-HEALING: Ensure Nagios Container is Running ───────
  exec { 'ensure-nagios-running':
    command => '/usr/local/bin/docker start ctrlxurl-nagios',
    unless  => "/usr/local/bin/docker ps --filter 'name=ctrlxurl-nagios' --filter 'status=running' -q | grep .",
    path    => ['/usr/local/bin', '/usr/bin', '/bin'],
  }

  # ── 7. Self-Healing Notification ─────────────────────────────
  notify { 'puppet-agent-state-applied':
    message => "Puppet Master catalog synchronized! All 4 containers enforced to RUNNING state.",
  }
}
```

### 🔍 Har Keyword Ka Matlab:
* **`node default`:** Batata hai ki jo bhi node master se jude, use yeh policy follow karni hai.
* **`file { ... }`:** File ya directory create/manage karne ka Puppet resource type.
* **`mode => '0600'`:** Linux file permission. Owner (root) ko read/write deta hai, baaki sabko block karta hai (sensitive secrets ke liye).
* **`require => File['/opt/ctrlxurl']`:** Dependency order. Batata hai ki pehle folder banega, uske baad `.env` file likhi jayegi.
* **`exec { 'ensure-backend-running': ... }`:** Shell command run karne ka resource type.
* **`unless => "..."`:** Sabse critical keyword! Yeh command ko baar-baar chalne se rokta hai (**Idempotency**). Agar container already running hai toh `grep .` true return karta hai aur command execute nahi hoti. Agar container stopped hai, tabhi `command` execute hoti hai.
* **`require => Exec['ensure-redis-running']`:** Dependency rule. Backend tabhi start hoga jab Redis pehle se running ho chuka ho.

---

## 🐳 TOOL 3: DOCKER & DOCKER SOCKET (`docker.sock`)

### 1. Dockerfile Breakdown

#### A. Backend (`server/Dockerfile`):
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN rm -f .env
EXPOSE 3000
CMD ["node", "server.js"]
```
* `FROM node:20-alpine`: Minimal Alpine Linux image (~50MB) use ki taaki image lightweight rahe.
* `npm ci --only=production`: Development dependencies (jest, nodemon) ko chhodkar sirf production dependencies install karta hai.
* `RUN rm -f .env`: Security best-practice! Git ya image ke andar hardcoded secrets nahi hone chahiye; secrets volume mount ya env vars se inject hote hain.

#### B. Frontend (`client/Dockerfile` - Multi-Stage Build):
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```
* **Multi-Stage Build Ka Fayda:**
  - Stage 1 (`builder`): Node.js container mein React application build hoti hai (`npm run build`).
  - Stage 2 (`nginx`): Sirf built static files (`/app/dist`) ko Nginx image mein copy kiya jaata hai. Final image mein Node.js bilkul nahi hota, jisse image size ~90% kam ho jaati hai!

---

### 2. Docker Socket (`/var/run/docker.sock`) Ka Deep Dive

#### A. Yeh kya hai?
* Yeh koi normal text file nahi hai. Iska size **`0 bytes`** hota hai.
* Yeh ek **Unix Domain Socket** hai (IPC — Inter-Process Communication pipe).
* `ls -la /var/run/docker.sock` chalane par permission ka pehla letter **`s`** dikhta hai (`srw-rw----`).

#### B. Container ke andar se Mac Engine ko access kaise milta hai? (Parde ke peeche ka flow)
1. **Container Isolation Problem:** Docker container ek band kamra hota hai. Ek container doosre container ko directly start ya stop nahi kar sakta.
2. **Bind Mount:** Humne Terraform mein host ka `/var/run/docker.sock` file agent container ke andar bind mount kiya.
3. **Execution Without Terminal:** Container ke andar koi visual terminal nahi hota. Jab Puppet run hota hai, Ruby OS-level `execve` system call se `/usr/local/bin/docker` program chalati hai.
4. **REST API Transmission:** Docker binary us command ko ek HTTP REST API call mein format karti hai (`POST /containers/ctrlxurl-backend/start`) aur direct socket buffer mein write kar deti hai.
5. **Host Action:** Mac ka Docker daemon us pipe se request padhta hai aur host par container ko revive kar deta hai!
6. Is pattern ko DevOps mein **DooD (Docker-outside-of-Docker)** bolte hain!

---

## 📡 TOOL 4: NAGIOS — 24/7 Network & Service Monitoring

### 1. Nagios kya karta hai?
* Nagios har 60-90 seconds mein saari services par synthetic checks bhejta hai.
* Agar koi service down hoti hai, toh notification alert trigger karta hai aur dashboard par **CRITICAL (Red)** dikhata hai.

---

### 2. `nagios/ctrlxurl-nagios.cfg` — Code Breakdown

```nagios
# Host Definition
define host {
    host_name               ctrlxurl-backend
    alias                   CtrlXURL Backend Container
    address                 ctrlxurl-backend
    check_command           check-host-alive
    max_check_attempts      3
    check_period            24x7
    notification_interval   60
    notification_period     24x7
    notification_options    d,r
    contacts                ankit
}

# Check 1: Ping / Network Reachability
define service {
    host_name               ctrlxurl-backend
    service_description     Backend Container Alive
    check_command           check_ping!100.0,20%!500.0,60%
    max_check_attempts      3
    check_interval          5
    check_period            24x7
    notification_options    c,r
    contact_groups          ctrlxurl-team
}

# Check 2: API HTTP /health Endpoint
define service {
    host_name               ctrlxurl-backend
    service_description     Backend API Health Check
    check_command           check_http!-H ctrlxurl-backend -p 3000 -u /health
    max_check_attempts      3
    check_interval          3
    check_period            24x7
    notification_options    c,r
    contact_groups          ctrlxurl-team
}

# Check 3: Puppet Master Port 8140 SSL Connectivity
define service {
    host_name               puppet-master
    service_description     Puppet Master Port 8140
    check_command           check_tcp!8140
    max_check_attempts      3
    check_interval          5
    check_period            24x7
    notification_options    c,r
    contact_groups          ctrlxurl-team
}
```

### 🔍 Checks Ka Matlab:
* **`check_ping!100.0,20%!500.0,60%`:** Agar response time >100ms ya packet loss >20% ho toh WARNING; agar >500ms ya >60% packet loss ho toh CRITICAL alert.
* **`check_http!-H ctrlxurl-backend -p 3000 -u /health`:** Nagios container ke port 3000 par HTTP GET `/health` bhejta hai. Agar HTTP 200 OK milta hai toh GREEN dikhata hai.
* **`check_tcp!8140`:** Check karta hai ki Puppet Server ka SSL daemon port 8140 par live listen kar raha hai ya nahi.

---

## ⚙️ GITHUB ACTIONS — Continuous Integration (CI)

File: `.github/workflows/ci.yml`

Har `git push` aur `pull_request` par GitHub ke cloud runner (Ubuntu) par automatic pipeline execute hoti hai:
1. **Checkout Code:** `actions/checkout@v4` se latest code pull karta hai.
2. **Setup Node.js:** Node.js v20 runtime configure karta hai.
3. **Install Dependencies:** `npm install` chalaata hai.
4. **Run Unit Tests:** `npm test` execute karke verify karta hai ki koi bug introduce nahi hua.
5. **Docker Build Test:** `docker build -t ctrlxurl-backend:ci ./server` chala kar verify karta hai ki Dockerfile bina error ke build ho rahi hai.

---

## ⚡ PRACTICAL DEMO SCRIPT (Sir ke Saamne Kya Run Karna Hai)

Jab examiner bole: *"Chalo practical karke dikhao"*, tab exactly yeh **5 steps** follow karo:

---

### 🟢 STEP 1: Saare 6 Containers Running Dikhao
```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```
**Output:**
```
NAMES               STATUS                    PORTS
puppet-agent        Up                        
puppet-master       Up (healthy)              0.0.0.0:8140->8140/tcp
ctrlxurl-nagios     Up                        0.0.0.0:8080->80/tcp
ctrlxurl-frontend   Up                        0.0.0.0:5173->80/tcp
ctrlxurl-backend    Up                        0.0.0.0:3000->3000/tcp
ctrlxurl-redis      Up                        0.0.0.0:6379->6379/tcp
```

---

### 🟢 STEP 2: Puppet Master par SSL Certificates Dikhao
```bash
docker exec -it puppet-master puppetserver ca list --all
```
**Screen par dikhana:**
- `puppet` (Master Server Certificate)
- `puppet-agent` (Signed Node Certificate with SHA256 Fingerprint)

---

### 🟢 STEP 3: LIVE AUTO-HEALING DEMO (Sabse Impressive Part!) 🔥

#### 1. Backend aur Redis ko stop kar do:
```bash
docker stop ctrlxurl-backend ctrlxurl-redis
```

#### 2. Check karo ki band ho gaye:
```bash
docker ps --format "table {{.Names}}\t{{.Status}}"
```
*(Backend aur Redis list mein nahi dikhenge).*

#### 3. Puppet Agent ko trigger karo (ya 60s wait karo):
```bash
docker exec -it puppet-agent puppet agent --test --server puppet
```
**Screen par live output dikhana:**
```
Notice: /Stage[main]/Main/Node[default]/Exec[ensure-redis-running]/returns: executed successfully
Notice: /Stage[main]/Main/Node[default]/Exec[ensure-backend-running]/returns: executed successfully
Notice: Puppet Master catalog synchronized! All 4 containers enforced to RUNNING state.
Notice: Applied catalog in 1.XX seconds
```

#### 4. Wapas check karo — Dono containers UP milenge!
```bash
docker ps --format "table {{.Names}}\t{{.Status}}"
curl -s http://localhost:3000/health
```
Output: `{"status":"ok"}`

---

### 🟢 STEP 4: `docker.sock` Screen Par Dikhao
```bash
ls -la /var/run/docker.sock
docker exec -it puppet-agent ls -la /var/run/docker.sock
```
> *"Sir, dekhiye permission string ka pehla letter **`s`** hai (`srw-rw----`) jo prove karta hai ki yeh Unix Domain Socket hai, aur size 0 bytes hai kyunki yeh RAM communication pipe hai."*

---

### 🟢 STEP 5: Nagios Monitoring Dashboard Dikhao
Browser mein open karo: [http://localhost:8080/nagios](http://localhost:8080/nagios)  
*(User: `nagiosadmin` / Pass: `nagios123`)*

Left menu mein **Services** par click karo aur dikhao:
- `ctrlxurl-backend` -> API Health Check ✅ GREEN
- `ctrlxurl-backend` -> Container Alive ✅ GREEN
- `puppet-master` -> Puppet Master Port 8140 ✅ GREEN

---

## 🎓 TOP 10 VIVA QUESTIONS & BULLETPROOF ANSWERS

### Q1: Terraform aur Puppet dono kyun use kiye?
**Answer:**  
*"Sir, dono ka lifecycle alag hota hai: Terraform ek Infrastructure Provisioning tool (Day 1) hai jo networks, containers aur volumes create karta hai. Puppet ek Configuration Management & Auto-Healing tool (Day 2) hai jo runtime state enforce karta hai aur container stop hone par unhe auto-restart karta hai."*

---

### Q2: Masterless Puppet (`puppet apply`) aur Master-Agent mein kya farak hai?
**Answer:**  
*"Masterless Puppet mein local machine par hi compiler aur catalog execute hote hain bina kisi centralized server ke. Jabki Master-Agent Architecture mein centralized Puppet Server (Port 8140) CA manage karta hai, SSL certificates sign karta hai, aur remote agent nodes catalog pull karke node policies enforce karte hain."*

---

### Q3: Agar koi container stop hota hai, toh woh auto-start kaise hota hai?
**Answer:**  
*"Puppet Agent background mein har 60 seconds (`--runinterval 60`) mein Master se catalog sync karta hai. Catalog ke andar `exec` resource `unless` condition ke sath defined hai. Jab container stop hota hai, `unless` check fail hota hai aur Puppet `/usr/local/bin/docker start <container>` command chala kar use wapas running state mein le aata hai."*

---

### Q4: `/var/run/docker.sock` kya hai aur kyun mount kiya?
**Answer:**  
*"Yeh Unix Domain Socket hai jiske through Docker Client Docker Daemon se REST API par communicate karta hai. By default containers isolated hote hain aur host ke containers ko nahi chhoo sakte. Is socket ko `puppet-agent` mein mount karke humne **Docker-outside-of-Docker (DooD)** pattern implement kiya hai, jisse agent container host ke Docker daemon ko commands de sakta hai."*

---

### Q5: Container ke andar terminal nahi hota, toh command execute hokar socket mein kaise jaati hai?
**Answer:**  
*"Puppet Agent OS-level `execve` system call ke zariye `/usr/local/bin/docker` binary ko background process ki tarah spawn karta hai. Yeh binary bina interactive terminal ke, POSIX socket API (`connect()` aur `write()`) use karke raw HTTP REST request (`POST /containers/{id}/start`) seedha `/var/run/docker.sock` buffer mein push kar deti hai jahan se Host ka Docker daemon use execute kar leta hai."*

---

### Q6: Humne application containers (Backend, Redis) ke andar direct Puppet Agent kyun nahi dala?
**Answer:**  
*"Agar container khud stop ho gaya, toh uske andar ka Puppet Agent bhi usi second terminate ho jayega — mara hua agent khud ko restart nahi kar sakta. Sath hi Docker ka best-practice principle hai 1 Process Per Container. Isliye management agent ko alag container mein rakh kar host socket se control karna hi sahi cloud-native architecture hai."*

---

### Q7: `site.pp` mein `require => Exec['ensure-redis-running']` ka kya matlab hai?
**Answer:**  
*"Yeh resource dependency order manage karta hai. Backend container tabhi start karne ki koshish ki jayegi jab Redis container already running ho chuka ho, kyunki Backend startup ke waqt Redis connection khojta hai."*

---

### Q8: Nagios mein localhost HTTP check par WARNING (401) kyun dikhta hai?
**Answer:**  
*"Nagios web interface by default basic HTTP authentication (`nagiosadmin`) se password-protected hota hai. Nagios ka default localhost HTTP check bina credentials ke GET request bhejta hai, isliye server HTTP 401 Unauthorized return karta hai jo expected warning hai. Application API health check (`ctrlxurl-backend:3000/health`) 100% OK aur Green hai."*

---

### Q9: Frontend ke liye Multi-Stage Dockerfile kyun use kiya?
**Answer:**  
*"React code ko build karne ke liye heavy Node.js runtime (~250MB) chahiye hota hai, lekin production serve karne ke liye sirf lightweight Nginx (~25MB) chahiye. Multi-stage build se final image mein Node.js discard ho jaata hai, jisse image size 90% kam ho jaati hai aur security vulnerabilities decrease hoti hain."*

---

### Q10: Agar saare containers destroy karke wapas create karne hon, toh command kya hai?
**Answer:**  
```bash
cd terraform
terraform destroy -auto-approve
terraform apply -auto-approve
```
*Terraform state file (`terraform.tfstate`) ke hisaab se saare 6 containers clean karke wapas fresh desired state mein provision kar deta hai.*

---

*All the best! DevOps Full Marks Guaranteed! 🚀*
