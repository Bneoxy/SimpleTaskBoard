# Taskboard

A Trello-style kanban app with **Groups → Tables → Task Cards**.

| Layer    | Stack                          |
|----------|--------------------------------|
| Frontend | React, Vite, Tailwind CSS      |
| Backend  | ASP.NET 8 Web API              |
| Database | PostgreSQL (via Entity Framework) |

## Data model

```
Group (workspace / project)
 └── Table (column — e.g. To Do, In Progress, Done)
      └── TaskCard (draggable card with title, description, due date)
```

## Prerequisites

- **Node.js** 18+
- **[.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)**
- **PostgreSQL** 14+ (local or managed)

## Quick start (local)

### 1. Database

Create a local PostgreSQL database:

```sql
CREATE DATABASE taskboard;
```

Update the connection string in `backend/Taskboard.Api/appsettings.json` if your credentials differ from the default (`postgres` / `postgres`).

### 2. Backend

```powershell
cd backend\Taskboard.Api
dotnet restore
dotnet run
```

API runs at **http://localhost:5000**  
Swagger UI: **http://localhost:5000/swagger**

On startup the app runs EF migrations and seeds sample data if the database is empty.

### 3. Frontend

```powershell
cd frontend
npm install
npm run dev
```

App runs at **http://localhost:5173** (proxies `/api` and `/uploads` to the backend).

## Deploy to DigitalOcean App Platform

The repo includes `.do/app.yaml` with three components:

| Component | Type | Routes |
|-----------|------|--------|
| `api` | .NET 8 Web Service | `/api`, `/uploads` |
| `web` | Static Site (Vite build) | `/` |
| `db` | Managed PostgreSQL 16 | — |

### Steps

1. **Update the GitHub repo** in `.do/app.yaml` — replace `YOUR_GITHUB_USERNAME/taskboard` with your repo.

2. **Push** your code to GitHub.

3. **Create the app** (requires [doctl](https://docs.digitalocean.com/reference/doctl/)):

   ```bash
   doctl apps create --spec .do/app.yaml
   ```

   Or import the spec in the [DigitalOcean dashboard](https://cloud.digitalocean.com/apps) → Create App → upload `.do/app.yaml`.

4. DigitalOcean will:
   - Provision a managed PostgreSQL database
   - Inject `DATABASE_URL` into the API service
   - Build and deploy the API on port 8080
   - Build the React frontend as a static site
   - Route `/api` and `/uploads` to the API, everything else to the frontend

The frontend uses relative `/api` paths, so it works on the same domain without extra configuration.

### Environment variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `DATABASE_URL` | API (auto-injected by DO) | PostgreSQL connection |
| `ConnectionStrings__DefaultConnection` | API (manual override) | Alternative to `DATABASE_URL` |
| `Cors__AllowedOrigins__0` | API | Add frontend origin if API and UI are on different domains |
| `VITE_API_URL` | Frontend build | Override API base URL (default: `/api`) |

### Image uploads note

Uploaded images are stored in `wwwroot/uploads/` on the API container filesystem. This is ephemeral — images are lost when the container restarts. For production persistence, consider [DigitalOcean Spaces](https://www.digitalocean.com/products/spaces) (object storage).

## Features

- Create / delete **groups** (sidebar)
- Add **tables** (columns) per group
- Add, edit, delete **task cards**
- **Drag & drop** cards between tables and reorder within a column
- Card modal for description, due date, and image attachments
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
├── .do/app.yaml           # DigitalOcean App Platform spec
├── frontend/              # React + Tailwind UI
├── backend/
│   └── Taskboard.Api/     # ASP.NET Web API + EF Core
├── Taskboard.sln
└── README.md
```
