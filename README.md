# CtrlXURL — URL Shortener with DevOps

> **Author:** Ankit Meena
> **Stack:** React + Node.js + MongoDB + Redis
> **DevOps Tools:** GitHub + Docker + Puppet + Nagios

---

## Project kya hai?

CtrlXURL ek URL Shortener web application hai. User ek lambi URL deta hai aur app uske liye ek chhota link banata hai. Jab koi us chhote link par click karta hai, to original URL par redirect ho jata hai.

**Example:**
```
Input  : https://www.example.com/very/long/url/that/is/hard/to/share
Output : http://localhost:3000/abc123
```

---

## DevOps Tools — Kyu Use Kiye? Kya Kaam Karte Hain?

---

### 1. GitHub — Source Control aur CI/CD

**Kyu use kiya:**
Bina GitHub ke code sirf local machine par hota. Agar machine kharab ho jaye to code lost ho jata. GitHub pe code safe rehta hai aur poori team access kar sakti hai.

**Kya kaam karta hai:**
- Poora project code ek central repository mein store hota hai
- Har `git push` par GitHub Actions automatically pipeline trigger hoti hai
- Pipeline backend test karti hai aur Docker image build verify karti hai
- Agar koi step fail ho to merge block ho jata hai — broken code production mein nahi pahunchta

**Workflow file:** `.github/workflows/ci.yml`

**Commands:**
```bash
# Code push karo
git add .
git commit -m "feat: add new feature"
git push origin main

# GitHub Actions result dekho:
# https://github.com/Ankitmina25/CtrlXURL/actions
```

**CI Pipeline Steps:**
```
git push
    │
    ▼
GitHub Actions runner start hota hai (ubuntu-latest)
    │
    ├── npm install          (dependencies install)
    ├── npm test             (tests run)
    └── docker build         (Dockerfile verify)
         │
         ├── All pass ✅ → Merge allowed
         └── Any fail ❌ → Merge blocked
```

---

### 2. Docker — Containerization

**Kyu use kiya:**
Bina Docker ke problem ye aati hai — "Mere machine par chal raha tha, server par nahi chal raha." Ye isliye hota hai kyunki local machine aur server ka Node.js version ya OS alag hota hai.

Docker application ko ek **container** mein pack karta hai jisme app ke saath uska environment bhi hota hai. Is container ko kisi bhi machine par exactly same tarah se chalaya ja sakta hai.

**Kya kaam karta hai:**
- Backend (Node.js) ka container banata hai — `server/Dockerfile`
- Frontend (React) ka container banata hai — `client/Dockerfile`
- Redis cache container chalata hai
- Nagios monitoring container chalata hai
- `docker-compose.yml` se sab containers ek saath manage hote hain

**Files:**
- `server/Dockerfile` — Backend container definition
- `client/Dockerfile` — Frontend container definition
- `docker-compose.yml` — All services orchestration

**Commands:**
```bash
# Sab containers start karo (detached mode — background mein)
docker compose up -d

# Running containers ka status dekho
docker compose ps

# Backend ke live logs dekho
docker compose logs -f backend

# Sab containers band karo
docker compose down

# Health check karo
curl http://localhost:3000/health

# Backend container ke andar jaao (debugging)
docker exec -it ctrlxurl-backend sh
```

**Container Architecture:**
```
docker compose up -d
        │
        ├── ctrlxurl-redis    → Port 6379  (Cache)
        ├── ctrlxurl-backend  → Port 3000  (API)
        └── ctrlxurl-nagios   → Port 8080  (Monitoring UI)
                │
        (All on shared internal network: ctrlxurl-net)
        (Containers talk to each other using container names as hostnames)
```

---

### 3. Puppet — Configuration Management

**Kyu use kiya:**
Jab bhi ek naya production server chahiye hota hai, to manually:
- Docker install karna padta hai
- Firewall configure karna padta hai
- Directories banana padta hai

Yeh sab manual kaam slow aur error-prone hai. Puppet se ye sab **automatically** aur **consistently** hota hai.

**Kya kaam karta hai:**
- Naye server par Docker automatically install karta hai
- Application ke liye `/opt/ctrlxurl` directory banata hai
- UFW firewall mein ports 80 aur 3000 open karta hai
- Agar koi manually setting change kar de, Puppet agle run mein wapas fix kar deta hai (Configuration Drift Prevention)

**File:** `puppet/ctrlxurl.pp`

**Commands:**
```bash
# PATH set karo (ek baar)
export PATH="/opt/puppetlabs/bin:$PATH"

# DRY RUN — kya hoga ye sirf batao, kuch change mat karo
sudo puppet apply puppet/ctrlxurl.pp --noop

# ACTUAL APPLY — real changes karo (Ubuntu production server par)
sudo puppet apply puppet/ctrlxurl.pp

# Puppet version check
puppet --version
```

**Puppet kaise kaam karta hai:**
```
puppet apply ctrlxurl.pp
        │
        ├── /usr/bin/docker exists? ──── NO  → Install Docker
        │                            └── YES → Skip (already done)
        │
        ├── /opt/ctrlxurl exists?   ──── NO  → Create directory
        │                            └── YES → Skip
        │
        └── OS == Linux?
                ├── YES → Start Docker service + Open firewall ports
                └── NO  → Print notice (Mac detected)
```

---

### 4. Nagios — Continuous Monitoring

**Kyu use kiya:**
Bina monitoring ke developers ko server crash ya API down hone ka pata tabhi chalta hai jab user complain karta hai. Nagios 24/7 silently monitor karta rehta hai aur koi bhi problem hone par **instantly alert** bhejta hai.

**Kya kaam karta hai:**
Is project mein Nagios 4 cheezein monitor karta hai:

| Check | Description | Alert Level |
|-------|-------------|-------------|
| Backend Container Alive | Ping check — container reachable hai? | CRITICAL if down |
| Backend API /health | GET /health → HTTP 200 expected | CRITICAL if non-200 |
| Disk Usage | Root partition disk space | WARN >80%, CRIT >90% |
| CPU Load | 1/5/15 min load average | WARN >5, CRIT >10 |

**Files:**
- `nagios/ctrlxurl-nagios.cfg` — All monitoring checks defined here

**Access:**
```
URL      : http://localhost:8080/nagios
Username : nagiosadmin
Password : nagios123
```

**Commands:**
```bash
# Nagios container logs dekho
docker compose logs nagios --tail=20

# Nagios restart karo (config change ke baad)
docker compose restart nagios

# DEMO: Backend band karo — Nagios mein CRITICAL dikhega
docker compose stop backend

# DEMO: Backend wapas start karo — Nagios RECOVERY show karega
docker compose start backend
```

**Alert Flow:**
```
Backend crash ho gaya
        │
        ▼ (3 consecutive failed checks × 3 min interval)
Nagios detects DOWN state
        │
        ▼
Email alert → ankitmina2512@gmail.com
Subject: "CRITICAL — Backend API Health Check is CRITICAL"
        │
        ▼ (after backend recovers)
Recovery email → "Backend API Health Check is OK"
```

---

## Complete Project File Structure

```
URL-Shortner/
│
├── .github/
│   └── workflows/
│       └── ci.yml              ← GitHub Actions CI pipeline
│
├── server/                     ← Node.js / Express Backend
│   ├── Dockerfile              ← Backend container definition
│   ├── .dockerignore           ← Files to exclude from container
│   ├── app.js                  ← Express app + /health endpoint
│   ├── server.js               ← Server entry point
│   └── ...
│
├── client/                     ← React Frontend
│   ├── Dockerfile              ← Frontend container definition
│   └── ...
│
├── docker-compose.yml          ← All 3 services orchestration
│
├── puppet/
│   └── ctrlxurl.pp             ← Server configuration manifest
│
├── nagios/
│   └── ctrlxurl-nagios.cfg     ← Monitoring checks configuration
│
└── README.md                   ← This file
```

---

## Quick Start — Poora Project Chalao

```bash
# 1. Repository clone karo
git clone https://github.com/Ankitmina25/CtrlXURL.git
cd CtrlXURL

# 2. All containers start karo
docker compose up -d

# 3. Status verify karo
docker compose ps

# 4. API health test karo
curl http://localhost:3000/health
# Expected: {"status":"ok","uptime":12.3,"timestamp":"..."}

# 5. Nagios monitoring open karo
# Browser: http://localhost:8080/nagios
# Login: nagiosadmin / nagios123
```

---

## Environment Variables (`server/.env`)

```env
MONGO_URI=your_mongodb_connection_string
JWT_TOKEN=your_jwt_secret_key
REFRESH_TOKEN=your_refresh_token_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
PORT=3000
BASE_URL=http://localhost:3000
REDIS_URL=redis://redis:6379
```

---

## DevOps Workflow Summary

```
Developer → git push → GitHub
                           │
                    GitHub Actions
                    ├── npm test      ✅
                    └── docker build  ✅
                           │
                    Code is safe to deploy
                           │
                    docker compose up -d
                    ├── Redis container
                    ├── Backend container
                    └── Nagios container
                                │
                         Nagios monitors 24/7
                         └── Alert on failure → Email
```
