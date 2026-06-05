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

await seedDemoData();
console.log('SQLite database is ready');

