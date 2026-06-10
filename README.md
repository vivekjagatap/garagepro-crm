# GaragePro CRM 🚗

A full-stack garage/workshop management system built for Indian auto workshops.

---

## Project Structure

```
garagepro-crm/
├── frontend/                 # React + Vite + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/       # UI components (Dashboard, JobCards, etc.)
│   │   ├── data/             # Mock/seed data (mockData.ts)
│   │   ├── types/            # Shared TypeScript types (index.ts)
│   │   ├── utils/            # API client (api.ts)
│   │   ├── hooks/            # Custom React hooks (future)
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── .env.example
│
├── backend/                  # Node.js + Express + TypeScript
│   ├── config/
│   │   └── env.ts            # Environment config loader
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── jobsController.ts
│   │   │   ├── inventoryController.ts
│   │   │   └── aiController.ts       # Gemini AI endpoints
│   │   ├── routes/
│   │   │   ├── jobs.ts
│   │   │   ├── inventory.ts
│   │   │   └── ai.ts
│   │   ├── middleware/
│   │   │   └── errorHandler.ts
│   │   ├── models/
│   │   │   └── types.ts              # Shared TypeScript types
│   │   └── index.ts                  # Express server entry point
│   ├── tsconfig.json
│   ├── package.json
│   └── .env.example
│
├── package.json              # Root monorepo scripts
└── .gitignore
```

---

## Getting Started

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Configure environment

```bash
# Backend
cp backend/.env.example backend/.env
# Fill in GEMINI_API_KEY in backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

### 3. Run both servers

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

---

## API Endpoints

| Method | Endpoint                       | Description                  |
|--------|-------------------------------|------------------------------|
| GET    | /api/health                   | Health check                 |
| GET    | /api/jobs                     | Get all job cards            |
| POST   | /api/jobs                     | Create a new job card        |
| PUT    | /api/jobs/:id                 | Update a job card            |
| DELETE | /api/jobs/:id                 | Delete a job card            |
| POST   | /api/jobs/seed                | Seed initial jobs            |
| GET    | /api/inventory                | Get all inventory items      |
| GET    | /api/inventory/low-stock      | Get low stock alerts         |
| POST   | /api/inventory                | Add inventory item           |
| PUT    | /api/inventory/:id            | Update inventory item        |
| DELETE | /api/inventory/:id            | Delete inventory item        |
| POST   | /api/inventory/seed           | Seed initial inventory       |
| POST   | /api/ai/whatsapp-message      | Generate WhatsApp message    |
| POST   | /api/ai/invoice-summary       | Generate invoice summary     |

---

## Tech Stack

**Frontend:** React 19, Vite, TypeScript, Tailwind CSS v4, Lucide React, Motion

**Backend:** Node.js, Express.js, TypeScript, Gemini AI (@google/genai)
