# Todo App with Categories

[DEMO LINK](https://uitop-todo-test.vercel.app/)

A full-stack todo application with category management, undo functionality, and bulk actions.

## Tech Stack

**Frontend:**
- React 19 with TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- Axios (HTTP client)
- React Hook Form (form handling)
- Vitest + React Testing Library (testing)

**Backend:**
- Node.js with Express
- TypeScript
- SQLite (sql.js in-memory with file persistence)
- Jest + Supertest (testing)

**DevOps:**
- Docker & Docker Compose
- Nginx (frontend reverse proxy)

## Features

- ✅ Create, complete, and delete todos
- ✅ Organize by categories (Work, Study, Personal, Other)
- ✅ Filter todos by category
- ✅ Maximum 5 active tasks per category (enforced by backend)
- ✅ Undo functionality (5-second window for complete/delete)
- ✅ Bulk select and bulk complete/delete
- ✅ Toast notifications with undo support
- ✅ Responsive UI with loading/error/empty states
- ✅ Completed tasks remain visible in their category

## Quick Start

### Docker (Recommended)

```bash
docker-compose up --build
```

Access the app at `http://localhost:3000`

**Ports:**
- Frontend: `3000` (nginx)
- Backend API: `3001` (Express)

**Data Persistence:**
SQLite database persists in Docker volume `todo-data`

### Local Development

#### Prerequisites
- Node.js 18+
- npm

#### Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:3001`

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## API Endpoints

- `GET /categories` - Get all categories
- `GET /todos?category=<id>` - Get todos (optionally filtered by category)
- `POST /todos` - Create todo
  - Body: `{ text: string, category_id: number }`
- `PATCH /todos/:id` - Update todo
  - Body: `{ text?: string, category_id?: number, completed?: boolean }`
- `DELETE /todos/:id` - Delete todo

## Testing

**Backend tests:**
```bash
cd backend
npm test
```

**Frontend tests:**
```bash
cd frontend
npm test
```

**Test coverage:**
- Backend: 5 tests (API endpoints, validation, business rules)
- Frontend: 5 tests (form submission, error handling, undo, bulk actions)

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── __tests__/         # Backend tests
│   │   ├── controllers/       # Request handlers
│   │   ├── services/          # Business logic
│   │   ├── repositories/      # Data access
│   │   ├── middleware/        # Express middleware
│   │   ├── config/            # Configuration
│   │   ├── utils/             # Utilities
│   │   ├── database.ts        # SQLite setup
│   │   ├── types.ts           # TypeScript types
│   │   └── index.ts           # Express server
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── __tests__/         # Frontend tests
│   │   ├── components/        # React components
│   │   ├── App.tsx            # Main app
│   │   ├── api.ts             # API client
│   │   └── types.ts           # TypeScript types
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Environment Variables

**Backend (.env):**
```
PORT=3001
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:3001/api
```

## Implementation Notes

### Undo/Pending System

The application implements a reliable undo system with the following characteristics:

- **5-second window**: Users have 5 seconds to undo delete or complete actions
- **Pending state**: Actions are marked as pending and displayed with visual indicators
- **Independent timers**: Each action has its own timer, allowing multiple concurrent pending actions
- **No stale closures**: Action details are passed as parameters to timeout callbacks, not captured from state
- **Ref-based storage**: Pending actions and timers are stored in refs to avoid state synchronization issues

### Category Filtering

- Todos are filtered by category only; completed status does not affect visibility
- Completed todos remain visible in their category with strikethrough styling
- The "Select all" button excludes completed and pending todos

### Bulk Actions

- Bulk operations create a single group ID for coordinated undo
- Each todo in a bulk action gets its own timer
- Undoing a bulk action cancels all timers in that group
- Selection is cleared after scheduling a bulk action

## Known Assumptions

- Categories are pre-seeded (Work, Study, Personal, Other) and cannot be modified via UI
- Maximum 5 active (incomplete) tasks per category is a hard limit
- Undo window is fixed at 5 seconds
- SQLite database file is stored in `backend/data/todos.db` (local) or Docker volume (containerized)
- Frontend uses `/api` proxy in Docker, direct `http://localhost:3001` in local dev

---

