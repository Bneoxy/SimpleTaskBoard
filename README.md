# Taskboard

A Trello-style kanban app with **Groups → Tables → Task Cards**.

| Layer    | Stack                          |
|----------|--------------------------------|
| Frontend | React, Vite, Tailwind CSS      |
| Backend  | ASP.NET 8 Web API              |
| Database | SQLite (via Entity Framework)  |

## Data model

```
Group (workspace / project)
 └── Table (column — e.g. To Do, In Progress, Done)
      └── TaskCard (draggable card with title, description, due date)
```

## Prerequisites

- **Node.js** 18+ (you have this)
- **[.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)** — required for the backend

## Quick start

### 1. Backend

```powershell
cd backend\Taskboard.Api
dotnet restore
dotnet run
```

API runs at **http://localhost:5000**  
Swagger UI: **http://localhost:5000/swagger**

### 2. Frontend

```powershell
cd frontend
npm install
npm run dev
```

App runs at **http://localhost:5173** (proxies `/api` to the backend).

## Features

- Create / delete **groups** (sidebar)
- Add **tables** (columns) per group
- Add, edit, delete **task cards**
- **Drag & drop** cards between tables and reorder within a column
- Card modal for description and due date
- Seed data on first run (sample workspace with 3 tables and 4 cards)

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/groups` | List all groups |
| GET    | `/api/groups/{id}` | Group with tables & cards |
| POST   | `/api/groups` | Create group |
| GET    | `/api/groups/{id}/tables` | List tables |
| POST   | `/api/groups/{id}/tables` | Create table |
| POST   | `/api/tables/{id}/cards` | Create card |
| PUT    | `/api/tables/{id}/cards/{id}/move` | Move/reorder card |
| PUT    | `/api/tables/{id}/cards/{id}` | Update card |
| DELETE | `/api/tables/{id}/cards/{id}` | Delete card |

## Project structure

```
taskboard/
├── frontend/          # React + Tailwind UI
├── backend/
│   └── Taskboard.Api/ # ASP.NET Web API + EF Core
├── Taskboard.sln
└── README.md
```
