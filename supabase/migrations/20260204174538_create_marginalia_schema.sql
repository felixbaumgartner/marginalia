/*
  # Marginalia Database Schema

  1. New Tables
    - `books`
      - `id` (uuid, primary key)
      - `ol_work_id` (text, unique) - Open Library work ID
      - `ol_edition_id` (text) - Open Library edition ID
      - `title` (text, required) - Book title
      - `author` (text) - Book author
      - `description` (text) - Book description
      - `cover_url` (text) - Cover image URL
      - `is_current` (boolean, default false) - Currently reading flag
      - `current_chapter` (text) - Current chapter being read
      - `current_page` (integer) - Current page number
      - `status` (text, default 'reading') - Reading status
      - `started_at` (timestamptz) - When reading started
      - `finished_at` (timestamptz) - When reading finished
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
    
    - `conversations`
      - `id` (uuid, primary key)
      - `book_id` (uuid, foreign key to books)
      - `title` (text) - Conversation title (auto-generated from first message)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
    
    - `messages`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, foreign key to conversations)
      - `role` (text, check: 'user' or 'assistant')
      - `content` (text, required) - Message content
      - `created_at` (timestamptz, default now())
    
    - `notes`
      - `id` (uuid, primary key)
      - `book_id` (uuid, foreign key to books)
      - `chapter` (text) - Chapter reference
      - `page` (integer) - Page reference
      - `content` (text, required) - Note content
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
    
    - `collections`
      - `id` (uuid, primary key)
      - `book_id` (uuid, foreign key to books)
      - `type` (text, check: 'vocabulary' or 'quote')
      - `content` (text, required) - The vocabulary word or quote
      - `note` (text) - Additional notes
      - `chapter` (text) - Chapter reference
      - `page` (integer) - Page reference
      - `created_at` (timestamptz, default now())

  2. Indexes
    - Index on conversations.book_id for faster lookups
    - Index on messages.conversation_id for faster lookups
    - Index on notes.book_id for faster lookups
    - Index on collections.book_id for faster lookups
    - Index on collections.type for filtering by type

  3. Security
    - Enable RLS on all tables
    - Public access policies (no authentication required)
    - This is a personal reading companion app with no multi-user support
*/

-- Create books table
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ol_work_id text UNIQUE,
  ol_edition_id text,
  title text NOT NULL,
  author text,
  description text,
  cover_url text,
  is_current boolean DEFAULT false,
  current_chapter text,
  current_page integer,
  status text DEFAULT 'reading',
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  title text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK(role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  chapter text,
  page integer,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create collections table
CREATE TABLE IF NOT EXISTS collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  type text NOT NULL CHECK(type IN ('vocabulary', 'quote')),
  content text NOT NULL,
  note text,
  chapter text,
  page integer,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_conversations_book_id ON conversations(book_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_notes_book_id ON notes(book_id);
CREATE INDEX IF NOT EXISTS idx_collections_book_id ON collections(book_id);
CREATE INDEX IF NOT EXISTS idx_collections_type ON collections(type);

-- Enable RLS on all tables
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- Public access policies (no authentication required for personal use)
-- This is a single-user personal reading companion app

CREATE POLICY "Allow public read access to books"
  ON books FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to books"
  ON books FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to books"
  ON books FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to books"
  ON books FOR DELETE
  USING (true);

CREATE POLICY "Allow public read access to conversations"
  ON conversations FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to conversations"
  ON conversations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to conversations"
  ON conversations FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to conversations"
  ON conversations FOR DELETE
  USING (true);

CREATE POLICY "Allow public read access to messages"
  ON messages FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to messages"
  ON messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to messages"
  ON messages FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to messages"
  ON messages FOR DELETE
  USING (true);

CREATE POLICY "Allow public read access to notes"
  ON notes FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to notes"
  ON notes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to notes"
  ON notes FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to notes"
  ON notes FOR DELETE
  USING (true);

CREATE POLICY "Allow public read access to collections"
  ON collections FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to collections"
  ON collections FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to collections"
  ON collections FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to collections"
  ON collections FOR DELETE
  USING (true);
