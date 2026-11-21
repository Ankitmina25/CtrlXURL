# 🚀 CtrlXURL — End-to-End DevOps Lifecycle Project

> **Project:** CtrlXURL (URL Shortener & Real-Time Analytics)  
> **Author:** Ankit Meena  
> **Application Tech Stack:** React (Vite) + Node.js (Express) + MongoDB Atlas + Redis  
> **DevOps Tools:** **GitHub Actions (CI)** + **Docker & Compose** + **Puppet (Self-Healing IaC)** + **Nagios (24/7 Monitoring)**

---

## 📌 1. Project Overview (प्रोजेक्ट क्या है?)

CtrlXURL ek modern **URL Shortener Web Application** hai:
1. User ek lambi URL input karta hai (e.g., `https://example.com/very/long/link/xyz`).
2. App uske liye ek unique chhota link banata hai (e.g., `http://localhost:3000/api/url/a1b2c3`).
3. Chhote link par click karne par user original lambe URL par redirect ho jata hai.
4. **Redis Cache** fast redirection ensure karta hai taaki database par baar-baar load na pade.

Is project me humne **complete end-to-end DevOps culture implement kiya hai** taaki:
- Code har machine par bina kisi error ke chale (**Docker**).
- Code push hote hi automatically test aur build ho jaye (**GitHub Actions**).
- Server configuration aur container state automatically self-heal ho jaye (**Puppet**).
- Website uptime, API health, aur server performance 24/7 monitor ho sake (**Nagios**).

---

## 🔄 2. End-to-End DevOps Lifecycle Architecture

```text
[ Developer ]
      │
      ▼  (1. git push origin main)
[ GitHub Repository ]
      │
      ▼  (2. Automatic CI Trigger)
[ GitHub Actions ] ──► (npm install ➔ npm test ➔ docker build verification)
      │
      ▼  (3. Multi-Container Orchestration)
[ Docker Compose ] ──► ┌────────────────────────────────────────────────────────┐
                       │  ● ctrlxurl-frontend (React + Nginx : Port 5173)       │
                       │  ● ctrlxurl-backend  (Node.js API    : Port 3000)       │
                       │  ● ctrlxurl-redis    (In-Memory Cache : Port 6379)      │
                       │  ● ctrlxurl-nagios   (Monitoring UI  : Port 8080)       │
                       └────────────────────────────────────────────────────────┘
                                     ▲                            ▲
          (4. Pull Model Every 2m)   │                            │  (5. Continuous Health Checks)
                       [ Puppet Daemon ]               [ Nagios Monitoring ]
                       (Heals .env / Containers)       (Ping, /health, CPU, Disk)
```

---

## 🛠️ 3. Tool-by-Tool Detailed Explanation (Kyu Use Kiya? Kya Kaam Hai?)

---

### 🔹 TOOL 1: GITHUB ACTIONS (Continuous Integration - CI)

#### Kyu use kiya?
Bina CI ke developers broken code ya syntax errors push kar dete hain jo server par jaakar production crash kar deta hai. GitHub Actions har commit par automatic code validation ensure karta hai.

#### Kya kaam karta hai?
1. Repo ke `.github/workflows/ci.yml` par trigger hota hai.
2. Fresh Ubuntu runner par repo checkout karta hai.
3. Node.js v20 setup karke dependencies install karta hai (`npm install`).
4. Unit tests run karta hai (`npm test`).
5. Backend ka Docker image build karke verify karta hai ki Dockerfile valid hai ya nahi.
6. Agar koi bhi step fail hota hai, toh PR/commit ko RED mark karke merge hone se rok deta hai.

#### File: `.github/workflows/ci.yml`
```yaml
name: CI - Test and Build
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test-and-build:
    name: Test Backend + Build Docker Image
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install backend dependencies
        working-directory: server
        run: npm install

      - name: Run backend test
        working-directory: server
        run: npm test

      - name: Build Docker image
        run: docker build -t ctrlxurl-backend ./server
```

#### GitHub Commands:
```bash
# Code push karo (Actions auto-trigger hoga)
git add .
git commit -m "feat: complete devops pipeline setup"
git push origin main
```
👉 **Verification:** Browser me `https://github.com/Ankitmina25/CtrlXURL/actions` kholo. Green checkmark `✔` dikhega.

---

### 🔹 TOOL 2: DOCKER & DOCKER COMPOSE (Containerization)

#### Kyu use kiya?
"Mere laptop me chal raha tha, production server pe nahi chal raha" — ye issue solve karne ke liye. Docker application ko uske OS dependencies, runtime aur libraries ke sath ek isolated lightweight container me pack karta hai.

#### Kya kaam karta hai?
- **Backend Container:** Node.js 20 Alpine lightweight base par API server run karta hai (Port 3000).
- **Frontend Container:** React application ko build karke high-performance Nginx web server ke through serve karta hai (Port 5173).
- **Redis Container:** Redis Alpine image use karke URL caching manage karta hai (Port 6379).
- **Nagios Container:** Pre-configured monitoring suite ko run karta hai (Port 8080).
- Sabhi containers ek private bridge network `ctrlxurl-net` par aapas me DNS name se communicate karte hain.

#### Commands & Usage:
```bash
# 1. Sabhi 4 containers ko background me build aur run karo
docker compose up -d --build

# 2. Containers ka running status check karo
docker compose ps

# 3. Backend service ke live logs dekho
docker compose logs -f backend

# 4. Containers ko stop aur remove karo
docker compose down

# 5. Live Health check terminal se test karo
curl http://localhost:3000/health
# Response: {"status":"ok","uptime":...,"timestamp":"..."}
```

---

### 🔹 TOOL 3: PUPPET (Configuration Management & Self-Healing IaC)

#### Kyu use kiya?
Server par manually software install karna ya settings banana error-prone aur slow hota hai. Puppet **Declarative Language** use karta hai — hum sirf desired state define karte hain, aur Puppet server ko hamesha us state me maintain rakhta hai. Agar koi setting ya container crash ya delete ho jaye, toh Puppet use **Self-Heal (Auto-Recover)** karta hai.

#### Humne Puppet se kya-kya implement kiya?
1. **Directory Management:** `/opt/ctrlxurl` directory ensure karta hai.
2. **Permission Drift Protection:** Directory permissions ko strictly `0755` par maintain karta hai.
3. **Golden Master `.env` Management:** Host server par master `.env` file maintain karta hai.
4. **In-Container Config Drift Protection:** Container ke andar `/app/.env` file inject karta hai. Agar container ke andar se koi `.env` delete ya modify kare, Puppet use turant wapas restore kar deta hai!
5. **Docker Container State Management:** Check karta hai ki `ctrlxurl-redis` aur `ctrlxurl-backend` containers running hain ya nahi; band hone par auto-restart karta hai.
6. **Daemon Pull Model:** Background script `auto-heal-daemon.sh` har 2 minute me Puppet ko run karta hai bina kisi human intervention ke.

#### File: `puppet/ctrlxurl.pp`
```puppet
# Project Paths
$project_dir  = '/Users/ankitmeena/CodeBase/ProjectLab/URL-Shortner'
$docker_bin   = '/usr/local/bin/docker'
$compose_bin  = '/usr/local/bin/docker-compose'

$root_group = $facts['os']['family'] ? {
  'Darwin' => 'wheel',
  default  => 'root',
}

# 1. Directory Creation & Permission
file { '/opt/ctrlxurl':
  ensure => directory,
  owner  => 'root',
  group  => $root_group,
  mode   => '0755',
}

# 2. Golden Master Config
file { '/opt/ctrlxurl/.env':
  ensure  => file,
  owner   => 'root',
  group   => $root_group,
  mode    => '0600',
  content => "PORT=3000\nNODE_ENV=production\nBASE_URL=http://localhost:3000\nREDIS_URL=redis://redis:6379\nMANAGED_BY=Puppet-DevOps\n",
  require => File['/opt/ctrlxurl'],
}

# 3. Ensure Redis Container Running
exec { 'ensure-redis-container-running':
  command     => "${compose_bin} -f ${project_dir}/docker-compose.yml up -d redis",
  unless      => "${docker_bin} ps --filter 'name=ctrlxurl-redis' --filter 'status=running' --format '{{.Names}}' | grep -q 'ctrlxurl-redis'",
  path        => ['/usr/local/bin', '/usr/bin', '/bin'],
  cwd         => $project_dir,
  environment => ['HOME=/root'],
}

# 4. Ensure Backend Container Running
exec { 'ensure-backend-container-running':
  command     => "${compose_bin} -f ${project_dir}/docker-compose.yml up -d backend",
  unless      => "${docker_bin} ps --filter 'name=ctrlxurl-backend' --filter 'status=running' --format '{{.Names}}' | grep -q 'ctrlxurl-backend'",
  path        => ['/usr/local/bin', '/usr/bin', '/bin'],
  cwd         => $project_dir,
  environment => ['HOME=/root'],
  require     => Exec['ensure-redis-container-running'],
}

# 5. In-Container .env Drift Protection
exec { 'sync-env-inside-backend-container':
  command     => "${docker_bin} cp /opt/ctrlxurl/.env ctrlxurl-backend:/app/.env",
  unless      => "/bin/bash -c '${docker_bin} ps -q -f name=ctrlxurl-backend | grep -q . && ${docker_bin} exec ctrlxurl-backend test -f /app/.env && [ \"\$(${docker_bin} exec ctrlxurl-backend wc -l < /app/.env | tr -d \" \")\" = \"\$(wc -l < /opt/ctrlxurl/.env | tr -d \" \")\" ]'",
  path        => ['/usr/local/bin', '/usr/bin', '/bin'],
  environment => ['HOME=/root'],
  require     => [Exec['ensure-backend-container-running'], File['/opt/ctrlxurl/.env']],
}
```

#### Puppet Practical Tests (Demos for Viva / Presentation):

* **Test A: Folder Recreation (Idempotency)**
  ```bash
  # Delete directory manually
  sudo rm -rf /opt/ctrlxurl
  # Run Puppet
  sudo puppet apply puppet/ctrlxurl.pp
  # Output: Notice: .../File[/opt/ctrlxurl]/ensure: created  ✅
  ```

* **Test B: Security Permission Drift Auto-Fix**
  ```bash
  # Tamper permission to unsafe 777
  sudo chmod 777 /opt/ctrlxurl
  # Run Puppet
  sudo puppet apply puppet/ctrlxurl.pp
  # Output: Notice: .../File[/opt/ctrlxurl]/mode: mode changed '0777' to '0755'  ✅
  ```

* **Test C: In-Container `.env` Auto-Recovery**
  ```bash
  # Container ke andar se config delete karo
  docker exec ctrlxurl-backend rm -f /app/.env
  # Run Puppet
  sudo puppet apply puppet/ctrlxurl.pp
  # Verify container ke andar file wapas aa gayi:
  docker exec ctrlxurl-backend cat /app/.env  ✅
  ```

* **Test D: Background 2-Minute Pull Daemon (Zero Manual Commands)**
  ```bash
  # Background daemon start karo (sirf 1 baar)
  sudo nohup /Users/ankitmeena/CodeBase/ProjectLab/URL-Shortner/puppet/auto-heal-daemon.sh > /dev/null 2>&1 &

  # Ab container ke andar se .env delete karke 2 min aaram se wait karo!
  docker exec ctrlxurl-backend rm -f /app/.env
  # 2 minute baad check karo, file apne aap restore ho chuki hogi!
  ```

---

### 🔹 TOOL 4: NAGIOS (24/7 Continuous Monitoring)

#### Kyu use kiya?
Server crash hone par ya API unresponsive hone par developers ko turant pata chal sake, isse pehle ki end-users complain karein.

#### Nagios kya-kya monitor kar raha hai? (4 Live Checks):
1. **`Backend API Health Check` (Port 3000):**
   - Check Command: `check_http!-H backend -p 3000 -u /health`
   - Har 3 minute me request bhejta hai. Agar HTTP 200 OK ke alawa kuch aaya, toh turant **CRITICAL (RED)** alert deta hai. Response time bhi track karta hai (~0.019 sec).
2. **`Backend Container Alive` (Ping Check):**
   - Check Command: `check_ping!100.0,20%!500.0,60%`
   - Packet loss aur network latency measure karta hai. 0% loss = OK.
3. **`CPU Load`:**
   - Check Command: `check_local_load!5.0,4.0,3.0!10.0,8.0,6.0`
   - Server ka 1, 5 aur 15 minute ka load average monitor karta hai. High traffic / DDoS par warn karta hai.
4. **`Disk Usage`:**
   - Check Command: `check_local_disk!20%!10%!/`
   - Root partition me free space track karta hai (>80% full = WARN, >90% full = CRITICAL).

#### Nagios Access:
- **URL:** [http://localhost:8080/nagios](http://localhost:8080/nagios)
- **Username:** `nagiosadmin`
- **Password:** `nagios123`

#### Live Alert Simulation Demo:
```bash
# 1. Backend container ko stop karo
docker compose stop backend

# 2. Nagios web UI refresh karo:
# -> Backend API Health Check 'CRITICAL' (RED) ho jayega!

# 3. Backend wapas start karo
docker compose start backend

# 4. Nagios refresh karo:
# -> Wapas 'OK' (GREEN) ho jayega (Recovery Event)!
```

---

## 🌐 4. Browser URLs Quick Reference

| Service | Browser Link | Description |
|---|---|---|
| **Frontend UI (React)** | 👉 [http://localhost:5173](http://localhost:5173) | Main URL Shortener Web App |
| **Backend API Health** | 👉 [http://localhost:3000/health](http://localhost:3000/health) | API Status & Server Uptime JSON |
| **Nagios Monitoring** | 👉 [http://localhost:8080/nagios](http://localhost:8080/nagios) | Live Infrastructure & Service Dashboard |
| **GitHub Actions** | 👉 `https://github.com/Ankitmina25/CtrlXURL/actions` | CI Pipeline Build & Test History |

---

## 🎓 5. Key Learnings & Viva / Interview Answers (हमने क्या सीखा?)

1. **Idempotency kya hoti hai?**
   - Chahe Puppet ko 1 baar run karo ya 100 baar, agar server already desired state me hai, toh wo koi duplicate change nahi karega. Agar koi change hua (drift), sirf usi ko theek karega.
2. **Configuration Drift kya hota hai?**
   - Jab koi engineer ya unauthorized user server par manually koi setting badal deta hai (e.g. `chmod 777` ya file delete). Puppet ka automated pull agent is drift ko detect karke automatically rollback karta hai.
3. **Active vs Passive Monitoring kya hai?**
   - Nagios yahan **Active Monitoring** kar raha hai — wo scheduled interval par proactively container ke `/health` aur ping check par requests send karke status verify karta hai.
4. **Containerization vs Virtualization?**
   - Docker container host OS ke kernel ko share karta hai, isliye ye VM ke mukable 10x lightweight aur seconds me start hone wala hota hai.
5. **CI/CD Pipeline ka core purpose kya hai?**
   - Har code commit ko automatic testing aur docker building ke standard se pass karwana taaki production me zero bugs reach karein.
