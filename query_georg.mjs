import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './drizzle/schema.ts';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

const members = await db.select().from(schema.teamMembers).where(schema.teamMembers.name.like('%Georg%'));
console.log(JSON.stringify(members, null, 2));

await connection.end();
