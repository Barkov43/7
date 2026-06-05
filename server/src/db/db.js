import fs from 'node:fs';
import path from 'node:path';
import sqlite3 from 'sqlite3';

const databasePath = path.resolve(process.cwd(), process.env.DATABASE_PATH || '../data/base.db');
fs.mkdirSync(path.dirname(databasePath), { recursive: true });

export const db = new sqlite3.Database(databasePath);

export function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(error) {
      if (error) reject(error);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

export function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) reject(error);
      else resolve(row);
    });
  });
}

export function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) reject(error);
      else resolve(rows);
    });
  });
}

