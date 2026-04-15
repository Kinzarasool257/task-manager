# DailyTM - Task Management SaaS

A professional task management application built with React, Node.js, and Prisma.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, shadcn/ui.
- **Backend**: Node.js (Express), Prisma ORM.
- **Database**: PostgreSQL (Dockerized).
- **Auth**: Kinde.
- **Storage**: Uploadthing.

## Getting Started

### 1. Infrastructure (Database)
Ensure Docker is running and execute:
```bash
docker-compose up -d
```

### 2. Server Setup
```bash
cd server
npm install
# Setup your .env with DATABASE_URL
npx prisma generate
npm run dev
```

### 3. Client Setup
```bash
cd client
npm install
npm run dev
```

## Environment Variables
Copy `.env.example` to both `client/.env` and `server/.env` and fill in the required keys.
- **Server**: Needs `DATABASE_URL`.
- **Client**: Needs `VITE_KINDE_*` keys.

## Features
- [x] Clean Architecture (Client/Server)
- [x] Core Database Models
- [x] Responsive Sidebar/Navbar Shell
- [ ] Kinde Auth Integration (Pending re-activation)
- [ ] Task Management (CRUD)
- [ ] Workspace Support
- [ ] File Uploads (Uploadthing)
