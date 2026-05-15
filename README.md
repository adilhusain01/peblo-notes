# Peblo Notes — AI-Powered Workspace

Full-stack, AI-powered notes workspace for the Peblo developer challenge. Sharp dark UI with Groq AI.

## Stack
- **Next.js 15** App Router (full-stack)
- **MongoDB Atlas** + Mongoose
- **NextAuth.js v4** (JWT sessions)
- **Groq (Llama 3.3 70B)** (AI)
- **Tailwind CSS** + Radix UI primitives
- **TypeScript**

## Setup

```bash
git clone <repo>
cd peblo-notes
npm install
cp .env.example .env.local
# fill in MONGODB_URI, NEXTAUTH_SECRET, NEXTAUTH_URL, GROQ_API_KEY
npm run dev
```

Open http://localhost:3000 → redirects to /login

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/signup | No | Register |
| GET | /api/notes | Yes | List (q, tag, sort, archived) |
| POST | /api/notes | Yes | Create |
| GET | /api/notes/:id | Yes | Get one |
| PATCH | /api/notes/:id | Yes | Update |
| DELETE | /api/notes/:id | Yes | Delete |
| POST | /api/notes/:id/generate-summary | Yes | Groq AI |
| GET | /api/insights | Yes | Dashboard stats |
| GET | /shared/:shareId | No | Public page |

## Features
- Auth: signup, login, JWT, protected routes
- Notes: create, edit, tags, categories, auto-save (1.2s debounce), archive
- AI: Groq generates summary + action items + suggested title, stored in DB
- Search: full-text + tag filter + sort
- Public sharing: toggle public, nanoid(10) share link
- Dashboard: note count, AI usage, weekly activity chart, top tags, recent notes

## Architecture
```
app/
  (auth)/login, signup     — public auth pages
  dashboard/               — protected workspace
    page.tsx               — insights/overview
    notes/page.tsx         — list with search/filter
    notes/[id]/page.tsx    — editor + AI panel + share panel
    archive/page.tsx       — archived notes
  shared/[shareId]/        — public note (no auth)
  api/                     — route handlers
models/User.ts, Note.ts    — Mongoose schemas
lib/mongodb.ts, auth.ts, groq.ts
```
