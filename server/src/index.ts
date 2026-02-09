import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../../.env');

try {
  dotenv.config({ path: envPath });
} catch (error) {
  console.log('No .env file found, using environment variables from platform');
}

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import { initializeDatabase } from './db/schema.js';
import booksRouter from './routes/books.js';
import conversationsRouter from './routes/conversations.js';
import chatRouter from './routes/chat.js';
import notesRouter from './routes/notes.js';
import collectionsRouter from './routes/collections.js';

async function main() {
  const requiredEnvVars = ['ANTHROPIC_API_KEY', 'SUPABASE_URL', 'SUPABASE_ANON_KEY'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    console.error('Please set these variables in your deployment platform or .env file');
    process.exit(1);
  }

  const app = express();
  const PORT = parseInt(process.env.PORT || '3001', 10);

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

  if (!fs.existsSync(clientDistPath)) {
    console.error(`Client dist directory not found at: ${clientDistPath}`);
    console.error('Please run "npm run build" to build the client before starting the server');
  } else {
    app.use(express.static(clientDistPath));

    app.get('*', (_req, res) => {
      res.sendFile(path.join(clientDistPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Marginalia server running on port ${PORT}`);
  });
}

main().catch(console.error);
