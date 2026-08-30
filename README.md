# Ethio Tefetagn - ኢትዮ ተፈታኝ

ESSLCE exam prep for Ethiopian high school students — practice questions for both the Natural Science and Social Science streams, a textbook library, and an AI study assistant that cites the page it's answering from.

## What's here

```
ethiotefetagn/
├── Books/                 ← drop textbook PDFs here — 32 folders: 8 subjects × grades 9–12
│                             (see Books/README.md)
├── DEPLOYMENT.md           ← step-by-step: domain, hosting, going live
├── render.yaml             ← one-click backend deploy config for Render
├── netlify.toml            ← one-click frontend deploy config for Netlify
├── .gitignore
├── public/                 ← the website itself (static HTML/CSS/JS — deploy anywhere)
│   ├── index.html          Landing page, stream picker, visitor counter
│   ├── dashboard.html      Subject grid + "readiness bloom" for a chosen stream
│   ├── quiz.html           Quiz-taking screen
│   ├── chatbot.html        AI study assistant screen (subject + grade pickers)
│   ├── library.html        Textbook library — view/download books by subject & grade
│   ├── css/style.css        Includes light + dark theme tokens
│   └── js/
│       ├── config.js       Backend URL — the one line to edit after deploying
│       ├── questions.js    Subject + question data (edit/add questions here)
│       ├── bloom.js        Progress visualization + local progress storage
│       ├── quiz.js         Quiz logic
│       ├── chatbot.js      Chat UI logic
│       ├── library.js      Fetches book availability from the backend
│       └── main.js         Countdown timer, visitor counter, dark mode toggle
└── server/                 ← backend API (Node/Express — needed for a real,
    │                          site-wide visitor count, the Library, and the AI chatbot)
    ├── server.js            CORS-restricted, rate-limited, helmet-hardened
    ├── ingest-books.js      Converts uploaded PDFs into page-cited JSON
    ├── subjects.js          Shared subject-id ↔ folder-name mapping
    ├── package.json
    ├── .env.example
    ├── data/visits.json     Visitor count storage
    └── books/                Indexed, page-chunked textbook JSON (auto-generated — see books/README.md)
```

## Running it locally

**Frontend only** (question banks + quizzes work fully; the chatbot, library, and site-wide visitor count show clearly-labelled local fallbacks):
```
cd public
npx serve .
```

**With the backend** (real visitor count, working Library, and AI chatbot):
```
cd server
npm install
cp .env.example .env     # paste your Anthropic API key from console.anthropic.com
npm start
```
The frontend already points at `http://localhost:3000` automatically when running locally — see `public/js/config.js`, which is loaded first on every page and sets the backend URL for the whole site (one place to edit, instead of per-page).

## Deploying to a real domain

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for a full step-by-step walkthrough — buying a domain, deploying the frontend (Netlify) and backend (Render), and connecting them with DNS. Short version:

- **Frontend**: any static host works — Netlify, Vercel, GitHub Pages, or your own hosting via cPanel. Just upload the contents of `public/`. This repo includes `netlify.toml` for a one-click Netlify deploy.
- **Backend**: needs a Node.js host since it runs a server process — Render, Railway, Fly.io, or a small VPS all work. This repo includes `render.yaml` for a one-click Render deploy. Set `ANTHROPIC_API_KEY` and `ALLOWED_ORIGINS` as environment variables there (never put secrets in frontend code). Make sure the `Books/` folder is deployed alongside `server/` (it's a sibling directory) so the Library and ingestion script can find it.
- Set the production backend URL once in `public/js/config.js` — every page reads from there.

## Adding more practice questions

Open `public/js/questions.js` and push more objects into `QUESTION_BANK[subjectId]`, following the existing format:
```js
{ q: "Question text", choices: ["A", "B", "C", "D"], answer: 2, explain: "Why the answer is C." }
```
I can generate a much larger question set per subject if you tell me which subjects to prioritize.

## Textbook library

`public/library.html` lists every subject × grade slot (32 total, SAT excluded since it has no textbook) with its status:
- **Not yet uploaded** — nothing in that `Books/` folder yet.
- **Uploaded** — a PDF is there and viewable/downloadable, but not yet indexed for AI citations.
- **AI-ready** — indexed; the chatbot can cite pages from it.

This is powered by the backend's `GET /api/books` (status list) and `GET /api/books/file/:subject/:grade` (serves the actual PDF) endpoints, reading straight from `Books/`.

## Connecting the curriculum books (for page-cited AI answers)

1. Drop a textbook PDF into its matching folder under `Books/` (see `Books/README.md`) — it appears in the Library immediately.
2. From `server/`, run:
   ```
   npm run ingest
   ```
   This extracts each PDF's text page-by-page into `server/books/<subject>_<grade>.json`. Run it again any time you add or replace a book.
3. Restart the backend. The AI assistant automatically starts grounding answers for that subject/grade in the real textbook and citing the page (e.g. "Source: Grade 11, page 42"). Until a subject/grade is indexed, it says so and answers from general knowledge instead of guessing a page.

Full details, including what to do with scanned (non-text) PDFs, are in `server/books/README.md`.

## Dark mode

A toggle sits in the bottom-right corner on every page (moon/sun icon). It respects the visitor's system preference on first visit and remembers their choice afterward via `localStorage` — no flash of the wrong theme on load.

## Visitor counter — how it works

- The real, site-wide number lives in `server/data/visits.json`, incremented once per browser session via `POST /api/visit`.
- If the backend isn't reachable (e.g. you're only testing the frontend), the site falls back to a per-device demo counter stored in the browser, clearly labelled as such — it is never mixed with real traffic numbers.
- For production traffic analytics beyond a raw count (pages viewed, time on site, drop-off by subject), consider pairing this with a privacy-respecting analytics tool like Plausible or GoatCounter alongside this counter.

## Known limitations / next steps

- Progress ("readiness bloom") is stored per-device in the browser (`localStorage`), not per-account — there's no login system yet. Add one (e.g. with a database + auth) if you want progress to follow a student across devices.
- The AI assistant's book search is a simple keyword match, fine for a handful of books; swap in real embeddings-based search once many books are indexed (notes in `server/books/README.md`).
- The ingestion script pulls text directly out of each PDF's text layer — scanned/image-only textbooks need OCR first (see `server/books/README.md`).
- On free-tier hosting (e.g. Render's free plan), the server's filesystem is ephemeral — the visitor counter and indexed textbook JSON get wiped on restart/redeploy. Fine for launching; ask me to wire up persistent storage (a small database) once you have real traffic and want that to stop happening.
- Question banks now hold 15–22 questions per subject (177 total) — tell me which subjects to expand further and I will.

## Production hardening already in place

- `helmet` for standard security headers, CORS restricted to `ALLOWED_ORIGINS`, and rate limiting (60 req/min general, 20 req/10min on the AI chat endpoint specifically, since each call costs money).
- Input validation on `/api/chat` (message length, history size) and a `/api/health` endpoint for uptime checks.
- A single `public/js/config.js` file controls which backend URL the whole frontend talks to — the only line you need to change when moving from local dev to production.
