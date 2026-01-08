import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, '.data', 'sqlite.db'));

const stories = db.prepare('SELECT * FROM success_stories ORDER BY id').all();
console.log(JSON.stringify(stories, null, 2));

db.close();
