---

```md
# Tradovate Platform – Backend Infrastructure

This repository contains the backend infrastructure for the **Tradovate platform**, including the API server, real-time market updates, background workers, and database setup.

The system is fully containerized with Docker and designed for **production stability, scalability, and real-time performance**.

---

## 🧱 Architecture Overview

The backend is split into **multiple services** to ensure reliability and fault isolation.

### Services

- **Admin/API Server**
  - Express.js REST API
  - Authentication (JWT)
  - Prisma ORM (PostgreSQL)
  - Socket.IO for real-time communication
  - Redis subscriber for market updates
  - Auto-runs database migrations on startup

- **Market Worker**
  - Connects to external market data (e.g. Binance WebSocket)
  - Publishes price updates to Redis (Pub/Sub)
  - Isolated from API to prevent crashes and downtime

- **PostgreSQL**
  - Primary relational database
  - Managed via Prisma migrations

- **Redis**
  - Pub/Sub for real-time market updates
  - Optional caching layer for latest prices

---

## 🔄 Data Flow (Real-Time)

```

Market WebSocket (Worker)
↓
Redis (Pub/Sub)
↓
API Server
↓
Socket.IO Clients

````

This design ensures:
- Market stream crashes do **not** affect the API
- API uptime is preserved
- Horizontal scaling is possible

---

## 🧪 Tech Stack

- **Node.js**: 20.19+
- **TypeScript**
- **Express.js**
- **Prisma ORM (v7)**
- **PostgreSQL**
- **Redis**
- **Socket.IO**
- **Docker & Docker Compose**

---

## 🚀 Getting Started (Production)

### 1️⃣ Environment Variables

Each service has its own `.env` file.

**API Server (`server/.env`)**
```env
DATABASE_URL=postgresql://tradovate:password@tradovate_db:5432/tradovate
JWT_SECRET=your_jwt_secret
REDIS_URL=redis://redis:6379
````

**Market Worker (`market-worker/.env`)**

```env
REDIS_URL=redis://redis:6379
```

---

### 2️⃣ Build and Start Services

```bash
docker compose build
docker compose up -d
```

All services will start automatically.

---

## 🗄 Database Migrations (Automatic)

Database migrations are **automatically applied on container startup** using:

```bash
prisma migrate deploy
```

This ensures:

* Fresh databases are initialized correctly
* Existing databases stay in sync
* No manual intervention is required

⚠️ **Never use `prisma migrate dev` in production.**

---

## ❤️ Health Check

The API exposes a health endpoint:

```http
GET /health
```

Response:

```json
{ "status": "ok" }
```

Used for container health checks and uptime monitoring.

---

## 🔐 Security Notes

* JWT authentication is enforced for Socket.IO connections
* Sensitive credentials are stored in environment variables
* Rate limiting can be added to auth routes if required
* Redis can be password-protected for production hardening

---

## 🛠 Useful Commands

```bash
# View logs
docker logs tradovate_admin_server

# Exec into API container
docker exec -it tradovate_admin_server sh

# Run Prisma commands manually (if ever needed)
docker exec -it tradovate_admin_server npx prisma migrate deploy
```

---

## 📌 Deployment Notes

* Node version is **pinned to Node 20**
* Prisma CLI and Client versions are aligned
* Docker uses Debian-based images (not Alpine) for native dependency stability
* Market WebSockets run **outside** the API process

---

## ✅ Production Checklist

* [x] Dockerized services
* [x] Automatic migrations
* [x] Redis pub/sub
* [x] Worker isolation
* [x] Stable Node & Prisma versions
* [x] No single point of failure for real-time streams

---

## 🧠 Final Note

This setup is designed to mirror **real-world production fintech systems**.
It prioritizes stability, scalability, and operational safety over shortcuts.

Happy shipping 🚀

```

--
