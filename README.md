# SmartSeason Field Monitoring System

A lightweight field monitoring system for tracking crop progress across multiple fields during a growing season.

## Stack
- Backend: Django 5 + Django REST Framework
- Frontend: React 18 + TypeScript (Vite)
- Database: SQLite (local default), PostgreSQL (recommended for deployment)
- Auth: Django session authentication with role-based access

## Roles
- **Admin (Coordinator)**: can create/edit fields, assign agents, and view all data.
- **Field Agent**: can view only assigned fields and submit stage + note updates.

In this implementation, admins are users with `is_staff=True`, and agents are standard users.

## Core Features
- Login/logout authentication
- Field management (create/edit/list/detail)
- Field assignment to specific agents
- Agent update submission with observations
- Admin monitoring dashboard across all agents
- Agent dashboard scoped to assigned fields
- Status summaries: total fields, active/at-risk/completed breakdown

## Field Stage Lifecycle
- Planted
- Growing
- Ready
- Harvested

## Field Status Logic
Each field has a computed status:
- **Completed**: current stage is `Harvested`
- **At Risk**:
  - no updates for more than 14 days, or
  - still in `Planted` stage 21+ days after planting
- **Active**: everything else

This logic balances progress and recency to highlight fields needing attention.

## Setup
```bash
git clone https://github.com/Wicked254/SmartSeason-field-monitoring.git
cd SmartSeason-field-monitoring
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Open:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/

## Deployment Database (PostgreSQL)
For live deployment, configure these environment variables on your host:

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DBNAME
DEBUG=False
SECRET_KEY=<strong-random-secret>
ALLOWED_HOSTS=<your-backend-domain>
```

Then run migrations and seed demo data on the deployed backend:

```bash
python manage.py migrate
python manage.py seed_demo
```

Notes:
- If `DATABASE_URL` is set, the app uses PostgreSQL.
- If `DATABASE_URL` is not set, it falls back to local SQLite (`db.sqlite3`).

## Render Deployment (Live Link)
This repo includes a Render Blueprint file: `render.yaml`.

1. Open this link:
   `https://dashboard.render.com/blueprint/new?repo=https://github.com/Wicked254/SmartSeason-field-monitoring`
2. Render will create:
   - `smartseason-backend` (Django web service)
   - `smartseason-frontend` (React static site)
   - `smartseason-postgres` (PostgreSQL database)
3. In the Render Blueprint form, set these values:
   - `CORS_ALLOWED_ORIGINS` = `https://<your-frontend>.onrender.com`
   - `CSRF_TRUSTED_ORIGINS` = `https://<your-frontend>.onrender.com`
   - `VITE_API_BASE_URL` = `https://<your-backend>.onrender.com/api`
4. Click **Apply** and wait for deployment to complete.

After deploy:
- Frontend live URL: `https://<your-frontend>.onrender.com`
- Backend/API URL: `https://<your-backend>.onrender.com/api/`

## Demo Credentials
- Admin: `coordinator` / `Admin123!`
- Agent: `agent1` / `Agent123!`
- Agent: `agent2` / `Agent123!`

## Assumptions
- A simple `is_staff` flag is sufficient for coordinator/admin role.
- Field updates are authored by authenticated users and retained as immutable history.
- Status is computed dynamically at read-time, not stored in DB.

## Design Decisions
- Chose Django monolith for speed and clarity in a technical assessment context.
- Kept business logic in model (`Field.status`) and authorization checks in views.
- Used server-rendered templates to deliver a functional UI quickly with minimal infrastructure.
