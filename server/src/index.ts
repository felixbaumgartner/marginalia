import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './db/schema.js';
import booksRouter from './routes/books.js';
import conversationsRouter from './routes/conversations.js';
import chatRouter from './routes/chat.js';
import notesRouter from './routes/notes.js';
import collectionsRouter from './routes/collections.js';

async function main() {
  const app = express();
  const PORT = process.env.PORT || 3001;

  app.use(cors());
  app.use(express.json());

  await initializeDatabase();

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/books', booksRouter);
  app.use('/api/conversations', conversationsRouter);
  app.use('/api/chat', chatRouter);
  app.use('/api/notes', notesRouter);
  app.use('/api/collections', collectionsRouter);

  const clientDistPath = path.resolve(__dirname, '../../client/dist');
  app.use(express.static(clientDistPath));

  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });

  app.listen(PORT, () => {
    console.log(`Marginalia server running on http://localhost:${PORT}`);
  });
}

main().catch(console.error);
