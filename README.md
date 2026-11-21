# CtrlXURL — URL Shortener

> Simple URL Shortener with DevOps tools: GitHub, Docker, Puppet, Nagios

---

## 🚀 Quick Start (Local)

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/URL-Shortner.git
cd URL-Shortner

# 2. Add environment variables
cp server/.env.example server/.env   # fill in your values

# 3. Start with Docker
docker compose up -d

# 4. Test health
curl http://localhost:3000/health
```

App chal raha hai:
- **Backend API:** http://localhost:3000
- **Frontend:** http://localhost:5173 (dev) or http://localhost:80 (docker)

---

## 🛠️ DevOps Tools

### 🐳 Docker
App aur Redis ko containers mein chalata hai.
```bash
docker compose up -d        # start
docker compose ps           # status check
docker compose logs backend # logs dekho
docker compose down         # stop
```

### 🤖 Puppet
Fresh Ubuntu server par Docker automatically install karta hai.
```bash
sudo puppet apply puppet/ctrlxurl.pp
```

### 📊 Nagios
Server aur `/health` endpoint monitor karta hai.
```bash
# Config copy karo
sudo cp nagios/ctrlxurl-nagios.cfg /etc/nagios4/conf.d/
# hosts.cfg mein apna server IP daalo, phir:
sudo systemctl restart nagios4
```

### 🔁 GitHub Actions
Har `git push` par automatically backend test aur Docker build check hota hai.

---

## 📁 Project Structure

```
URL-Shortner/
├── server/              ← Node.js + Express backend
│   ├── Dockerfile
│   └── ...
├── client/              ← React frontend
│   ├── Dockerfile
│   └── ...
├── docker-compose.yml   ← Start karo ek command se
├── puppet/
│   └── ctrlxurl.pp      ← Server setup manifest
├── nagios/
│   └── ctrlxurl-nagios.cfg  ← Health monitoring
└── .github/workflows/
    └── ci.yml           ← Auto test on push
```

---

## 🔑 Environment Variables (`server/.env`)

```
MONGO_URI=your_mongodb_uri
JWT_TOKEN=your_jwt_secret
REFRESH_TOKEN=your_refresh_secret
EMAIL_USER=your_email
EMAIL_PASSWORD=your_email_password
PORT=3000
BASE_URL=http://localhost:3000
REDIS_URL=redis://redis:6379
```

---

*Author: Ankit Meena*
