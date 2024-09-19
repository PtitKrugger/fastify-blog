import Database from 'better-sqlite3';

export const db = new Database('fastify-sqlite.db');
//db.pragma('journal_mode = WAL');