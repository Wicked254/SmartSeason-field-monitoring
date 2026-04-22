# SmartSeason Field Monitoring System

A lightweight field monitoring system for tracking crop progress across multiple fields during a growing season.

## Stack
- Backend: Django 5 + Django REST Framework
- Frontend: React 18 + TypeScript (Vite)
- Database: SQLite (default)
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
git clone <your-repository-url>
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
