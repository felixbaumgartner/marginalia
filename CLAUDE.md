# CLAUDE.md — Marginalia

This file provides guidance to Claude Code when working on the Marginalia project.

## What Is Marginalia

A personal AI reading companion web app. Search for books (Open Library), mark one as "currently reading," then chat with Claude Sonnet about it. All conversations are saved per book. Dark-mode-first UI designed for use while reading.

## Project Structure

```
Marginalia/
├── .env                        # ANTHROPIC_API_KEY, PORT, model config
├── package.json                # Root: runs client + server via concurrently
├── server/                     # Express + sql.js + Anthropic SDK
│   └── src/
│       ├── index.ts            # Entry point (async, loads .env from project root)
│       ├── db/
│       │   ├── connection.ts   # sql.js singleton, auto-save, file persistence
│       │   └── schema.ts       # 3 tables: books, conversations, messages
│       ├── routes/
│       │   ├── books.ts        # Book CRUD + Open Library proxy + conversation CRUD
│       │   ├── conversations.ts # Get/delete conversations
│       │   └── chat.ts         # SSE streaming chat endpoint
│       ├── services/
│       │   ├── claude.ts       # Anthropic SDK streaming (async generator)
│       │   ├── bookContext.ts   # System prompt builder
│       │   └── openLibrary.ts  # Open Library search + details
│       └── types/
│           └── sql.js.d.ts     # Type declarations for sql.js
├── client/                     # React 19 + Vite 7 + Tailwind v4
│   └── src/
│       ├── App.tsx             # BrowserRouter + routes
│       ├── main.tsx            # React root
│       ├── index.css           # Tailwind v4 @import + @theme (dark palette)
│       ├── api/                # Typed fetch wrappers + SSE stream consumer
│       ├── hooks/              # useCurrentBook, useConversation, useBookSearch, useStreamResponse
│       ├── types/              # book.ts, conversation.ts, message.ts
│       ├── components/
│       │   ├── layout/         # AppShell, Sidebar
│       │   ├── books/          # BookSearch, BookSearchResult, BookCard, BookDetail, BookArchive
│       │   ├── chat/           # ChatPanel, ChatMessage, ChatInput, ChatHistory
│       │   └── common/         # LoadingSpinner, EmptyState
│       └── pages/              # HomePage, ChatPage, ArchivePage
└── data/
    └── marginalia.db           # SQLite file (gitignored, created at runtime)
```

## Commands

```bash
# Start both client and server (from project root)
npm run dev

# Start server only (from server/)
npm run dev

# Start client only (from client/)
npm run dev

# Type-check server
cd server && npx tsc --noEmit

# Type-check client
cd client && npx tsc --noEmit

# Build client for production
cd client && npm run build
```

## Tech Stack Details

### Server
- **Runtime**: Node.js with tsx (TypeScript execution, no compile step in dev)
- **Framework**: Express 4 on port 3001
- **Database**: sql.js (pure JS SQLite — NOT better-sqlite3)
- **AI**: @anthropic-ai/sdk with streaming (`client.messages.stream()`)
- **TypeScript**: strict mode, module: ES2022, moduleResolution: bundler

### Client
- **Framework**: React 19 with TypeScript
- **Bundler**: Vite 7
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/vite` plugin)
- **Routing**: react-router-dom v7
- **Markdown**: react-markdown v10
- **Path alias**: `@/*` → `src/*`

### Database Schema
- **books**: id, ol_work_id (unique), ol_edition_id, title, author, description, cover_url, is_current, timestamps
- **conversations**: id, book_id (FK), title (auto from first message), timestamps
- **messages**: id, conversation_id (FK), role ('user'|'assistant'), content, created_at
- Foreign keys with CASCADE delete enabled
- Indexes on book_id and conversation_id

## Environment Variables

Located in `.env` at project root (NOT in server/):

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `ANTHROPIC_API_KEY` | Yes | — | Claude API key |
| `ANTHROPIC_MODEL` | No | `claude-sonnet-4-20250514` | Model to use |
| `PORT` | No | `3001` | Server port |
| `DB_PATH` | No | `./data/marginalia.db` | SQLite file path (relative to project root) |

The server loads `.env` from the project root using `path.resolve(__dirname, '../../.env')` in `server/src/index.ts`.

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/health` | Health check |
| GET | `/api/books/search?q=` | Proxy Open Library search |
| GET | `/api/books/details/:workId` | Proxy Open Library book details |
| GET | `/api/books` | List all saved books (with last_message_at) |
| GET | `/api/books/current` | Get currently-reading book |
| POST | `/api/books` | Save a book |
| PUT | `/api/books/:id/current` | Set book as current (clears previous) |
| DELETE | `/api/books/:id` | Delete book + conversations + messages |
| GET | `/api/books/:bookId/conversations` | List conversations for a book |
| POST | `/api/books/:bookId/conversations` | Create new conversation |
| GET | `/api/conversations/:id` | Get conversation with all messages |
| DELETE | `/api/conversations/:id` | Delete conversation + messages |
| POST | `/api/chat` | Stream chat (SSE): `{conversation_id, content}` |

## Critical Architecture Decisions

### Why sql.js Instead of better-sqlite3
`better-sqlite3` requires native compilation (node-gyp) which fails on newer Node versions (24.x) and certain macOS configurations due to missing C++ headers (`<climits>`). `sql.js` is a pure JavaScript SQLite compiled from C via Emscripten — no native dependencies, works everywhere.

**Trade-off**: sql.js runs SQLite in memory and must be explicitly saved to disk. The `connection.ts` handles this with:
- Auto-save every 5 seconds via `setInterval`
- Save on process exit/SIGINT/SIGTERM
- Explicit `saveDb()` calls after write operations in routes

### SSE Streaming Pattern
The chat endpoint uses Server-Sent Events (not WebSockets):
- Server: `res.setHeader('Content-Type', 'text/event-stream')` then `res.write('data: ...\n\n')`
- Client: `ReadableStream` reader with `TextDecoder`, parsing `data:` lines
- Termination signal: `data: [DONE]`
- The Anthropic SDK `stream()` method returns events with `type: 'content_block_delta'`

### Tailwind CSS v4 Configuration
Tailwind v4 does NOT use `tailwind.config.ts` or `postcss.config.js`. Instead:
- Import via `@import "tailwindcss"` in CSS
- Custom colors defined with `@theme { --color-name: value; }` in `index.css`
- Vite plugin: `@tailwindcss/vite` (not `postcss` + `tailwindcss` postcss plugin)
- Custom colors are used as utility classes: `bg-surface`, `text-text-primary`, `border-border`, etc.

### .env Loading
The `.env` file lives at the project root, but the server runs from `server/`. The `server/src/index.ts` uses `import.meta.url` to resolve the path two levels up. This requires ESM-compatible tsconfig (`module: ES2022`).

## Known Pitfalls & Lessons

### npm Registry
This machine has npm configured to use a corporate registry (`jfrog.booking.com`). When installing packages, always use:
```bash
npm install --registry https://registry.npmjs.org
```

### Node.js Version Compatibility
The machine runs Node 24.x. Some native packages (better-sqlite3, node-sass, etc.) may not have prebuilt binaries and will fail to compile. Prefer pure JS alternatives.

### TypeScript Strict Mode Gotchas
- `useRef` without an initial value requires explicit `undefined`: `useRef<T>(undefined)` not `useRef<T>()`
- Unused destructured variables cause errors with `noUnusedLocals` — remove them from destructuring
- `import.meta.url` requires `module: ES2022` or higher in tsconfig (not `NodeNext` which targets CommonJS)

### sql.js Type Declarations
sql.js does not ship its own TypeScript declarations. A custom `server/src/types/sql.js.d.ts` file provides them. If you add new sql.js methods, update this file.

### Vite Scaffold Template
When running `npm create vite@latest` with `--template react-ts`, double-check the output — it can sometimes scaffold the vanilla TypeScript template instead. Verify by checking for `react` in `package.json` dependencies and `jsx: "react-jsx"` in `tsconfig.json`.

### Port Conflicts
The server runs on port 3001. If a previous dev session crashed without cleanup, the port may still be in use. Kill it with:
```bash
lsof -ti:3001 | xargs kill -9
```

### Open Library API Quirks
- The `description` field can be either a plain string or an object `{type: "/type/text", value: "..."}` — handle both cases
- Cover images use the edition OLID, not the work ID: `https://covers.openlibrary.org/b/olid/{OLID}-M.jpg`
- The `key` field returns `/works/OL123W` — strip the `/works/` prefix to get the work ID

## Code Style

- TypeScript strict mode everywhere
- Functional React components with hooks
- No class components
- Path alias `@/*` for imports in client
- Dark theme by default — no light mode toggle
- Indigo (`#6366f1`) as accent color
- `async/await` preferred over `.then()` chains
- Async generators (`async function*`) for streaming data
- Explicit error handling at route boundaries
