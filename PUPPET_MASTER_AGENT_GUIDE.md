# 🎓 CtrlXURL — Puppet Master-Agent & DevOps Complete Viva/Demo Guide

> **Note:** Yeh guide specifically viva presentation, code walkthrough, aur examiner ke saamne live practical demo dikhane ke liye banayi gayi hai. Isme har ek command, har ek file ka line-by-line matlab, aur `docker.sock` ka deep dive simple Hinglish mein explained hai.

---

## 📑 TABLE OF CONTENTS
1. [Big Picture Architecture & Concept](#1-big-picture-architecture--concept)
2. [Puppet Master (Server) — Code & Line-by-Line Meaning](#2-puppet-master-server--code--line-by-line-meaning)
3. [Puppet Agent Container — Files & Internal Structure](#3-puppet-agent-container--files--internal-structure)
4. [Docker Socket (`docker.sock`) — Deep Dive & How to Show Sir](#4-docker-socket-dockersock--deep-dive--how-to-show-sir)
5. [Sir Ke Saamne Live Demo Script (Step-by-Step Commands)](#5-sir-ke-saamne-live-demo-script-step-by-step-commands)
6. [Top 7 Viva Questions & Bulletproof Answers](#6-top-7-viva-questions--bulletproof-answers)

---

## 1. Big Picture Architecture & Concept

### ❓ Sir ko concept kaise samjhana hai?
Sir ko bolna:
> *"Sir, hamare project mein 3 main layers hain:*
> 1. *IaC Layer (Terraform): Jo saare 6 containers aur Docker network ko provision karti hai.*
> 2. *Configuration & Auto-Healing Layer (Puppet Master-Agent): Jo desired state maintain karti hai aur agar koi app container band ho jaye toh 1 minute mein auto-restart karti hai.*
> 3. *Monitoring Layer (Nagios): Jo application health aur Puppet Master port 8140 dono ko 24/7 watch karti hai.*

### 🏛️ Complete Architecture Diagram
```
                     ┌────────────────────────────────────────────────────────┐
                     │          TERRAFORM (Infrastructure Provisioner)        │
                     │    `terraform apply` -> 6 Containers Created On Mac    │
                     └──────────────────────────┬─────────────────────────────┘
                                                │
                                                ▼
     ┌────────────────────────────────── Docker Network (ctrlxurl-network) ──────────────────────────────┐
     │                                                                                                    │
     │   ┌───────────────────────────┐    SSL (Port 8140)     ┌───────────────────────────────────────┐   │
     │   │       PUPPET MASTER       │ ◄────────────────────► │             PUPPET AGENT              │   │
     │   │      (Control Plane)      │   Signed Certificate   │            (Worker Node)              │   │
     │   │ - Runs Puppet Server      │                        │ - Runs Puppet Agent (Every 60s)       │   │
     │   │ - Serves `site.pp` catalog│                        │ - Has `/var/run/docker.sock` Mounted  │   │
     │   │ - Manages CA & SSL certs  │                        │ - Has `docker` binary mounted         │   │
     │   └───────────────────────────┘                        └───────────────────┬───────────────────┘   │
     │                                                                            │                       │
     │                                            Auto-Heals & Enforces State     │                       │
     │                                            via Docker Socket API           │                       │
     │                                                                            ▼                       │
     │   ┌────────────────────────────────────────────────────────────────────────────────────────────┐   │
     │   │                                APPLICATION CONTAINERS                                      │   │
     │   │   [ctrlxurl-backend]       [ctrlxurl-frontend]       [ctrlxurl-redis]                      │   │
     │   │       (Port 3000)              (Port 5173)              (Port 6379)                        │   │
     │   └─────────────────────────────────────────────┬──────────────────────────────────────────────┘   │
     │                                                 │                                                  │
     │                                                 ▼                                                  │
     │   ┌────────────────────────────────────────────────────────────────────────────────────────────┐   │
     │   │                                     NAGIOS MONITORING                                      │   │
     │   │  [ctrlxurl-nagios] (Port 8080)                                                             │   │
     │   │  - Monitors: Backend PING, API /health, Host CPU/Disk, and Puppet Master Port 8140         │   │
     │   └────────────────────────────────────────────────────────────────────────────────────────────┘   │
     └────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Puppet Master (Server) — Code & Line-by-Line Meaning

Puppet Master container ka kaam hai **Catalog Compile karke Agent ko bhejna**.

### File Location:
Host machine par: `puppet/manifests/site.pp`  
Container ke andar mount hoti hai: `/etc/puppetlabs/code/environments/production/manifests/site.pp`

### 📄 Code (`puppet/manifests/site.pp`):
```puppet
node default {

  # ── 1. Proof of Master-Agent SSL Handshake ───────────────────
  file { '/tmp/puppet-client-server-verified.txt':
    ensure  => file,
    owner   => 'root',
    mode    => '0644',
    content => "===============================================\nCtrlXURL DevOps — Puppet Master-Agent Architecture\n===============================================\nStatus: Active & Verified\nArchitecture: Client-Server with SSL Certificate Validation\nNode: ${trusted['certname']}\nServer: Puppet Master (Port 8140)\nManaged: Desired State & Auto-Healing Enforced\nAuto-Heal Interval: 60 Seconds (Every 1 Minute)\n",
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
    message => "Puppet Master catalog synchronized! All 4 containers (redis, backend, frontend, nagios) enforced to RUNNING state.",
  }
}
```

### 🔍 Har Block Ka Exact Matlab (Viva Explanation):
1. **`node default { ... }`**  
   Iska matlab hai ki koi bhi Agent node jo Master se connect hoga, use yeh saare rules apply karne honge.
2. **`file { '/tmp/puppet-client-server-verified.txt': ... }`**  
   Yeh file SSL handshake ka live proof hai. Isme `${trusted['certname']}` dynamic variable hai jo batata hai ki kis certificate ke zariye Agent verify hua.
3. **`file { '/opt/ctrlxurl/.env': ... }`**  
   Golden configuration management. Mode `0600` rakha hai taaki sensitive secrets sirf root padh sake. `require => File['/opt/ctrlxurl']` batata hai ki pehle folder banna chahiye, phir file.
4. **`exec { 'ensure-backend-running': ... }`**  
   - `unless`: Agent pehle check karta hai ki container running hai ya nahi (`docker ps --filter status=running`).
   - Agar container running hai, toh `grep .` pass ho jata hai aur `unless` bolta hai: **Kuch mat karo (Idempotency)**.
   - Agar container stopped hai, toh output blank aata hai aur `unless` fail ho jata hai. Puppet foran `command` execute karta hai: `/usr/local/bin/docker start ctrlxurl-backend`.
5. **`require => Exec['ensure-redis-running']`**  
   Dependency rule: Backend container tabhi start hoga jab Redis container already running ho chuka ho!

---

## 3. Puppet Agent Container — Files & Internal Structure

Examiner bol sakta hai: *"Agent container ke andar jaakar dikhao wahan kya kya hai."*

Agent container ke andar jaana:
```bash
docker exec -it puppet-agent /bin/bash
```

### 📂 Agent Container ke andar ki zaroori files:

| File Path | Kya hai yeh? | Kyun zaroori hai? |
|---|---|---|
| **`/var/run/docker.sock`** | Host Docker Socket | Host ke Docker Engine ko API commands bhejne ka pipe. |
| **`/usr/local/bin/docker`** | Docker CLI binary | Agent ke andar se `docker start` aur `docker ps` chalane ke liye. |
| **`/tmp/puppet-client-server-verified.txt`** | SSL Audit File | Puppet Master se catalog aane ka live proof. |
| **`/opt/ctrlxurl/.env`** | Golden Config File | Desired environment variables. |
| **`/etc/puppetlabs/puppet/ssl/`** | SSL Certificates Folder | Isme Agent ki private key aur Master ka signed public certificate rehta hai. |

### 💻 Agent ke andar check karne ki commands:
```bash
# 1. Audit file dekho
docker exec -it puppet-agent cat /tmp/puppet-client-server-verified.txt

# 2. Golden .env file dekho
docker exec -it puppet-agent cat /opt/ctrlxurl/.env

# 3. Agent ke paas Docker access verify karo
docker exec -it puppet-agent docker ps

# 4. Agent ka SSL certificate check karo
docker exec -it puppet-agent ls -la /etc/puppetlabs/puppet/ssl/certs/
```

---

## 4. Docker Socket (`docker.sock`) — Deep Dive & How to Show Sir

### ❓ Sir ko `docker.sock` screen par kaise dikhana hai?

Sir ke saamne yeh commands step-by-step run karo:

#### Step 1: Host Machine (Mac) par socket file dikhao
```bash
ls -la /var/run/docker.sock
```
**Screen par dikhega:**
```
lrwxr-xr-x  1 root  daemon  41 Nov 20 13:19 /var/run/docker.sock -> /Users/ankitmeena/.docker/run/docker.sock
```
Aur original file:
```bash
ls -la /Users/ankitmeena/.docker/run/docker.sock
```
**Output:**
```
srwxr-xr-x  1 ankitmeena  staff  0 Nov 23 20:34 /Users/ankitmeena/.docker/run/docker.sock
```

👉 **Sir ko highlight karke batao:**
> *"Sir, notice kijiye permission string ka pehla letter **`s`** hai (`srwxr-xr-x`). Normal file mein `-` hota hai, directory mein `d` hota hai, link mein `l` hota hai, aur **`s`** ka matlab hota hai **UNIX DOMAIN SOCKET**! Aur iska size **`0 bytes`** hota hai kyunki yeh disk par data save nahi karti, balki RAM memory mein direct communication pipe hai."*

---

#### Step 2: Agent container ke andar wahi socket dikhao
```bash
docker exec -it puppet-agent ls -la /var/run/docker.sock
```
**Output:**
```
srw-rw---- 1 root root 0 Nov 23 15:04 /var/run/docker.sock
```
> *"Sir, Terraform volume mount ke zariye Mac ka wahi socket pipe Agent container ke andar bhi live accessible hai."*

---

#### Step 3: Direct API Call Proof (Bina Docker CLI ke Engine se baat karke dikhao!)
Sir ko impress karne ke liye yeh command chalao:
```bash
docker exec -it puppet-agent curl -s --unix-socket /var/run/docker.sock http://localhost/containers/json | head -c 200
```
**Screen par kya dikhega:**  
Docker Engine ka raw JSON response aayega! Yeh prove karta hai ki `/var/run/docker.sock` actual mein Docker Engine ka **REST API endpoint** hai.

---

### 🧠 Flow Summary (Sir ko bolne ke liye):
1. Normal Docker containers isolated hote hain — ek container doosre container ko touch nahi kar sakta.
2. `puppet-agent` ko application containers (`backend`, `redis`, `frontend`, `nagios`) ko manage karna hai.
3. Isliye humne host machine ka `/var/run/docker.sock` file agent container ke andar mount kiya.
4. Jab bhi `puppet-agent` container ke andar `docker start ctrlxurl-backend` run hota hai, toh yeh request socket pipe ke zariye Host Mac ke Docker Engine tak jaati hai, aur host engine us container ko start kar deta hai.
5. Is pattern ko DevOps mein **DooD (Docker-outside-of-Docker)** bolte hain!

---

## 5. Sir Ke Saamne Live Demo Script (Step-by-Step Commands)

Jab sir bolein: *"Demo dikhao project ka"*, tab exact yeh 5 steps follow karna:

---

### 🟢 STEP 1: Saare 6 Containers Running Dikhao
```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```
**Output mein dikhana:**
- `puppet-master` (Port 8140 - healthy)
- `puppet-agent` (Up)
- `ctrlxurl-backend` (Port 3000)
- `ctrlxurl-frontend` (Port 5173)
- `ctrlxurl-redis` (Port 6379)
- `ctrlxurl-nagios` (Port 8080)

---

### 🟢 STEP 2: Puppet Master par SSL Certificates Dikhao
```bash
docker exec -it puppet-master puppetserver ca list --all
```
**Output dikhana:**
```
Signed Certificates:
    puppet          (SHA256) ... (Puppet Master Server)
    puppet-agent    (SHA256) ... (Puppet Agent Node)
```
> *"Sir, dekhiye Master ne Agent ka SSL certificate sign kiya hua hai, dono ke beech mutual TLS authentication ho raha hai."*

---

### 🟢 STEP 3: LIVE AUTO-HEALING DEMO (Sabse Important Part!) 🔥

#### Part A: Backend aur Redis ko stop kar do
```bash
docker stop ctrlxurl-backend ctrlxurl-redis
```

#### Part B: Sir ko dikhao ki containers band ho chuke hain
```bash
docker ps --format "table {{.Names}}\t{{.Status}}"
```
*(Dono containers list se gayab ho chuke honge).*

#### Part C: Puppet Agent ko trigger karo (ya 1 minute wait karo)
```bash
docker exec -it puppet-agent puppet agent --test --server puppet
```
**Screen par live output dikhana:**
```
Notice: /Stage[main]/Main/Node[default]/Exec[ensure-redis-running]/returns: executed successfully
Notice: /Stage[main]/Main/Node[default]/Exec[ensure-backend-running]/returns: executed successfully
Notice: Puppet Master catalog synchronized! All 4 containers (redis, backend, frontend, nagios) enforced to RUNNING state.
Notice: Applied catalog in 1.XX seconds
```

#### Part D: Wapas check karo — Containers live ho chuke hain!
```bash
docker ps --format "table {{.Names}}\t{{.Status}}"
```
*(Dono containers wapas `Up` status mein dikhenge!)*

Aur API health check karke dikhao:
```bash
curl -s http://localhost:3000/health
```
Output: `{"status":"ok"}`

---

### 🟢 STEP 4: Idempotency Demo (Dobara chalao — koi disturbance nahi)
Wahi command dobara chalao:
```bash
docker exec -it puppet-agent puppet agent --test --server puppet
```
**Output:**
```
Notice: Applied catalog in 0.03 seconds (no changes)
```
> *"Sir, dekhiye dobara chalane par kuch restart nahi hua kyunki desired state already satisfied hai. Ise DevOps mein **Idempotency** bolte hain."*

---

### 🟢 STEP 5: Nagios Dashboard Open Karke Dikhao
Browser mein open karo:
👉 **http://localhost:8080/nagios**  
*(Login: `nagiosadmin` / Password: `nagios123`)*

Left menu mein **Services** par click karo:
- `ctrlxurl-backend` -> API Health Check (HTTP 200 OK) ✅ GREEN
- `ctrlxurl-backend` -> Container Alive (PING) ✅ GREEN
- `puppet-master` -> Puppet Master Port 8140 Alive (TCP 8140) ✅ GREEN

---

## 6. Top 7 Viva Questions & Bulletproof Answers

### Q1: Terraform aur Puppet dono kyun use kiye? Ek se kaam nahi chalta?
**Answer:**  
*"Sir, industry standard mein dono tools ka scope alag hota hai:*
* **Terraform (Provisioning Tool - Day 1):** Code se pura infrastructure khada karta hai (Docker bridge network, container specs, port bindings, volumes).
* **Puppet (Configuration Management & Auto-Healing - Day 2 onwards):** Infrastructure banne ke baad uski running state enforce karta hai. Agar container crash ho jaye ya config drift ho, toh Puppet use automatically heal karta hai."*

---

### Q2: Masterless Puppet (`puppet apply`) aur Master-Agent mein kya farak hai?
**Answer:**  
*"Masterless architecture mein local machine par hi compiler aur catalog run hote hain bina kisi centralized server ke. Jabki Master-Agent architecture mein centralized Puppet Server (Port 8140) CA manage karta hai, SSL certificates sign karta hai, aur remote agent nodes catalog pull karke node policies enforce karte hain. Hamne is project mein full **Master-Agent Architecture with SSL** implement kiya hai."*

---

### Q3: Agar koi container stop hota hai, toh woh auto-start kaise hota hai?
**Answer:**  
*"Puppet Agent background mein har 60 seconds (`--runinterval 60`) mein Master se catalog sync karta hai. Catalog ke andar `exec` resource `unless` condition ke sath defined hai. Jab container stop hota hai, `unless` check fail hota hai aur Puppet `/usr/local/bin/docker start <container>` command chala kar use wapas running state mein le aata hai."*

---

### Q4: `/var/run/docker.sock` kya hai aur kyun mount kiya?
**Answer:**  
*"Yeh Unix Domain Socket hai jiske through Docker Client Docker Daemon se REST API par communicate karta hai. By default containers isolated hote hain aur host ke containers ko nahi chhoo sakte. Is socket ko `puppet-agent` mein mount karke humne **Docker-outside-of-Docker (DooD)** pattern implement kiya hai, jisse agent container host ke Docker daemon ko commands de sakta hai."*

---

### Q5: `site.pp` mein `require => Exec['ensure-redis-running']` ka kya matlab hai?
**Answer:**  
*"Yeh dependency management resource hai. Iska matlab hai ki Backend container tabhi start karne ki koshish ki jayegi jab Redis container already running ho chuka ho, kyunki Backend application startup ke waqt Redis connection khojti hai."*

---

### Q6: Nagios mein localhost par HTTP check warning kyun deta hai?
**Answer:**  
*"Nagios web interface by default basic authentication (`nagiosadmin`) se password-protected hota hai. Nagios ka default localhost HTTP check bina credentials ke GET request bhejta hai, isliye server HTTP 401 Unauthorized return karta hai jo expected warning hai. Application API health check (`ctrlxurl-backend:3000/health`) 100% OK aur Green hai."*

---

### Q7: Agar saare containers destroy karne hon aur wapas create karne hon, toh kya command hai?
**Answer:**  
*"Sirf 2 Terraform commands:*
```bash
cd terraform
terraform destroy -auto-approve
terraform apply -auto-approve
```
*Terraform state file (`terraform.tfstate`) ke hisaab se saare containers clean karke wapas fresh banata hai."*

---

*All the best for your demo and viva! 🚀*
