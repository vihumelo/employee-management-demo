# Employee Management Demo

This project was built as part of a short technical challenge. It demonstrates
practical experience developing a web application with a Python API and a
TypeScript frontend, along with database integration, automated checks, and
API documentation.

The repository is organized as a monorepo with separate `backend/` and
`frontend/` applications.

## Technology stack

### Backend

- Python 3.12 and FastAPI
- SQLAlchemy and Alembic
- SQLite for local development; PostgreSQL and MySQL can be configured with a
  compatible SQLAlchemy URL and the corresponding database driver
- Pytest, Ruff, and Pyright
- GitHub Actions for continuous integration

### Frontend

- React 19 and TypeScript
- Vite
- Tailwind CSS 4 and HeroUI 3
- Axios and React Router

## Backend features

- Employee record CRUD endpoints
- Request and response schemas with input validation
- Database-level uniqueness constraint for CPF values
- Environment-based database and logging configuration
- Alembic database migrations
- Interactive API documentation at `/docs`

## Frontend features

- Responsive employee directory with search by name, CPF, or role
- Paginated employee list with options to view, edit, and delete records
- Employee details page and side panels for creating and editing records
- API error feedback and loading states

## Getting started

### Backend

From the repository root, create and activate a virtual environment, install
the development dependencies, and configure the environment file:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env
```

Apply the database migration and start the API:

```bash
alembic upgrade head
uvicorn main:app --reload
```

Open [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) to explore the API.
The example environment uses a local SQLite database. Set `DATABASE_URL` in
`backend/.env` to use another supported SQLAlchemy database URL.

Run the backend checks from `backend/`:

```bash
pytest
ruff check .
pyright
```

### Frontend

Keep the backend running in its terminal. In another terminal, install the
frontend dependencies, configure the API origin, and start Vite:

```bash
cd frontend
npm ci
cp .env.example .env
npm run dev
```

Set `VITE_API_BASE_URL` in `frontend/.env` to the API origin. The example value
points to the local backend at `http://127.0.0.1:8000`. Vite exposes frontend
environment values in the browser bundle, so do not put secrets there.

Run the frontend checks from `frontend/`:

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

Use `npm run test:watch` while developing to rerun tests as files change.

## Continuous integration

GitHub Actions runs the backend Ruff, Pyright, Alembic migration, and Pytest
checks, plus the frontend tests, lint, type check, and production build on
pushes and pull requests.
