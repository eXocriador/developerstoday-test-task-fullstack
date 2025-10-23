# Quiz Builder

Express + Prisma (SQLite) REST API with a Next.js frontend for authoring quizzes that include boolean, short-answer, and multi-select questions.

## Quick Start

### Backend (`/backend`)
```bash
cd backend
yarn install
cp .env.example .env
yarn prisma migrate dev --name init
yarn dev
```
API available at `http://localhost:4000`. Helpful: `yarn lint`, `yarn build`, `yarn start`, `yarn prisma studio`.

### Frontend (`/frontend`)
```bash
cd frontend
yarn install
cp .env.example .env   # set NEXT_PUBLIC_API_URL if needed
yarn dev
```
App runs at `http://localhost:3000`. Helpful: `yarn lint`, `yarn build`.

## Sample Payload

Create a quiz via Postman/curl (`POST http://localhost:4000/quizzes`) or use `/create` in the UI:
```json
{
  "title": "Sample Quiz",
  "questions": [
    { "type": "BOOLEAN", "text": "JavaScript runs in the browser.", "booleanAnswer": true },
    { "type": "INPUT", "text": "Name a primary color.", "inputAnswer": "red" },
    {
      "type": "CHECKBOX",
      "text": "Select the planets.",
      "options": [
        { "text": "Earth", "isCorrect": true },
        { "text": "Mars", "isCorrect": true },
        { "text": "Moon", "isCorrect": false }
      ]
    }
  ]
}
```
Frontend routes: `/create` (builder), `/quizzes` (list + delete), `/quizzes/:id` (details).

## Structure

```
backend/
  prisma/        # schema & migrations
  src/           # controllers, services, validators, middlewares
frontend/
  app/           # Next.js routes
  components/    # UI building blocks
  lib/           # API client
  types/         # shared DTOs
```

Environments: copy `.env.example` to `.env` in each package. Backend defaults to SQLite; adjust Prisma for PostgreSQL if required.

