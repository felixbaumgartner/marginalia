# Marginalia

A personal AI reading companion. Search for books via Open Library, track multiple books simultaneously, and have context-aware conversations with Claude about what you're reading. Take notes, save vocabulary and quotes, and view reading statistics — all in a dark-mode-first interface designed for use while reading.

## Features

- **Book Search & Library** — Search the Open Library catalog, save books, and manage your reading list
- **Multi-Book Reading** — Read multiple books at once; switch between them from the sidebar without losing context
- **AI Chat** — Stream conversations with Claude Sonnet about your current book, with full conversation history per book
- **Reading Progress** — Track your current chapter and page; Claude avoids spoilers beyond your position
- **Passage Mode** — Paste a specific passage into chat for focused discussion
- **Notes & Annotations** — Create, edit, and delete notes tied to chapters and pages; recent notes are included in Claude's context
- **Vocabulary & Quotes** — Collect words and passages from each book, with one-click "Ask Claude" to discuss them
- **Reading Stats** — Dashboard showing books read, total conversations, notes taken, and a per-book activity chart
- **Multi-Book Connections** — Claude is aware of all your active books and can draw connections between them
- **Archive** — Browse all saved books with status filtering (reading, finished, abandoned); re-activate archived books

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Client | React 19, TypeScript, Vite 7, Tailwind CSS v4, React Router v7 |
| Server | Node.js, Express 4, TypeScript (tsx) |
| Database | sql.js (pure-JS SQLite, no native dependencies) |
| AI | Anthropic SDK with SSE streaming |
| Markdown | react-markdown v10 for rendering chat responses |

## Project Structure

```
Marginalia/
├── package.json              # Root: runs client + server via concurrently
├── .env                      # API key and config (see below)
├── server/
│   └── src/
│       ├── index.ts          # Express entry point
│       ├── db/
│       │   ├── connection.ts # sql.js singleton with auto-save
│       │   └── schema.ts    # Tables: books, conversations, messages, notes, collections
│       ├── routes/
│       │   ├── books.ts      # Book CRUD, Open Library proxy, progress, stats
│       │   ├── conversations.ts
│       │   ├── chat.ts       # SSE streaming chat endpoint
│       │   ├── notes.ts      # Notes CRUD
│       │   └── collections.ts # Vocabulary & quotes CRUD
│       └── services/
│           ├── claude.ts     # Anthropic SDK streaming (async generator)
│           ├── bookContext.ts # System prompt builder
│           └── openLibrary.ts
├── client/
│   └── src/
│       ├── App.tsx           # Router + global state
│       ├── index.css         # Tailwind v4 theme (dark palette)
│       ├── api/              # Typed fetch wrappers + SSE consumer
│       ├── hooks/            # useActiveBooks, useConversation, useNotes, etc.
│       ├── types/            # book, conversation, message, note, collection, stats
│       ├── components/
│       │   ├── layout/       # AppShell, Sidebar
│       │   ├── books/        # BookSearch, BookDetail, BookCard, BookArchive
│       │   ├── chat/         # ChatPanel, ChatMessage, ChatInput, ChatHistory
│       │   ├── notes/        # NoteEditor, NotesList
│       │   ├── collections/  # CollectionSection
│       │   ├── stats/        # StatsOverview
│       │   └── common/       # LoadingSpinner, EmptyState
│       └── pages/            # HomePage, ChatPage, NotesPage, ArchivePage, StatsPage
└── data/
    └── marginalia.db         # SQLite file (created at runtime, gitignored)
```

## Prerequisites

- **Node.js** 18+ (tested on 24.x)
- **Anthropic API key** — get one at [console.anthropic.com](https://console.anthropic.com)

## Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/felixbaumgartner/marginalia.git
   cd marginalia
   ```

2. **Install dependencies**

   ```bash
   npm install
   cd server && npm install && cd ..
   cd client && npm install && cd ..
   ```

3. **Configure environment**

   Edit the `.env` file in the project root:

   ```
   ANTHROPIC_API_KEY=sk-ant-...your-key-here
   ```

4. **Start the app**

   ```bash
   npm run dev
   ```

   This runs both the server (port 3001) and client (port 5173) concurrently.

5. **Open in browser**

   Navigate to [http://localhost:5173](http://localhost:5173)

## Environment Variables

All variables go in `.env` at the project root.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | Yes | — | Your Anthropic API key |
| `ANTHROPIC_MODEL` | No | `claude-sonnet-4-20250514` | Claude model ID |
| `PORT` | No | `3001` | Server port |
| `DB_PATH` | No | `./data/marginalia.db` | SQLite database file path |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/books/search?q=` | Search Open Library |
| `GET` | `/api/books/details/:workId` | Get book details from Open Library |
| `GET` | `/api/books` | List all saved books |
| `GET` | `/api/books/current` | Get all currently-reading books |
| `GET` | `/api/books/stats/overview` | Reading statistics |
| `POST` | `/api/books` | Save a book |
| `PUT` | `/api/books/:id/current` | Add book to currently reading |
| `PUT` | `/api/books/:id/uncurrent` | Remove book from currently reading |
| `PUT` | `/api/books/:id/progress` | Update chapter/page progress |
| `PUT` | `/api/books/:id/status` | Update book status (reading/finished/abandoned) |
| `DELETE` | `/api/books/:id` | Delete book and all related data |
| `GET` | `/api/books/:bookId/conversations` | List conversations for a book |
| `POST` | `/api/books/:bookId/conversations` | Create a new conversation |
| `GET` | `/api/conversations/:id` | Get conversation with messages |
| `DELETE` | `/api/conversations/:id` | Delete conversation |
| `POST` | `/api/chat` | Stream chat response (SSE) |
| `GET` | `/api/books/:bookId/notes` | List notes for a book |
| `POST` | `/api/books/:bookId/notes` | Create a note |
| `PUT` | `/api/notes/:id` | Update a note |
| `DELETE` | `/api/notes/:id` | Delete a note |
| `GET` | `/api/books/:bookId/collections` | List collection items (vocab/quotes) |
| `POST` | `/api/books/:bookId/collections` | Add to collection |
| `DELETE` | `/api/collections/:id` | Remove from collection |

## Database Schema

Five tables with foreign keys and CASCADE deletes:

- **books** — id, ol_work_id, title, author, description, cover_url, is_current, current_chapter, current_page, status, started_at, finished_at, timestamps
- **conversations** — id, book_id (FK), title, timestamps
- **messages** — id, conversation_id (FK), role (user/assistant), content, created_at
- **notes** — id, book_id (FK), chapter, page, content, timestamps
- **collections** — id, book_id (FK), type (vocabulary/quote), content, note, chapter, page, created_at

## Scripts

```bash
# Development (client + server)
npm run dev

# Build client for production
npm run build

# Start production server
npm start

# Type-check server
cd server && npx tsc --noEmit

# Type-check client
cd client && npx tsc --noEmit
```

## Architecture Notes

- **sql.js** is used instead of better-sqlite3 to avoid native compilation issues. The database runs in-memory and auto-saves to disk every 5 seconds, plus on process exit.
- **SSE streaming** is used for chat (not WebSockets). The server sends `data: {token}\n\n` events and terminates with `data: [DONE]\n\n`.
- **Tailwind v4** uses `@import "tailwindcss"` and `@theme {}` in CSS — no `tailwind.config.ts` or PostCSS config.
- **System prompts** are dynamically built per-chat, including the book's metadata, reading progress (for spoiler avoidance), recent notes, and a list of other active books for cross-references.

## License

Private project.
