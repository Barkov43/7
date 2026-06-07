import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { dbRun } from './db.js';
import { seedDemoData } from './seed.js';

const schemaPath = path.resolve('src/db/schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

for (const statement of schema.split(';').map((part) => part.trim()).filter(Boolean)) {
  await dbRun(`${statement};`);
}

const migrations = [
  ['enterprises', 'website', "TEXT NOT NULL DEFAULT ''"],
  ['enterprises', 'excursion_title', "TEXT NOT NULL DEFAULT ''"],
  ['enterprises', 'excursion_address', "TEXT NOT NULL DEFAULT ''"],
  ['enterprises', 'excursion_description', "TEXT NOT NULL DEFAULT ''"],
  ['enterprises', 'audiences', "TEXT NOT NULL DEFAULT '[]'"],
  ['enterprises', 'price', "TEXT NOT NULL DEFAULT ''"],
  ['enterprises', 'profile', "TEXT NOT NULL DEFAULT 'technical'"],
  ['excursions', 'age_restriction', "TEXT NOT NULL DEFAULT ''"],
  ['excursions', 'price', "TEXT NOT NULL DEFAULT ''"],
  ['excursions', 'profile', "TEXT NOT NULL DEFAULT 'technical'"]
];

for (const [table, column, definition] of migrations) {
  try {
    await dbRun(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  } catch (error) {
    if (!String(error.message).includes('duplicate column name')) throw error;
  }
}

await seedDemoData();
console.log('SQLite database is ready');
