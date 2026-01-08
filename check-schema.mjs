import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import 'dotenv/config';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

// Check region column
const [regionColumn] = await connection.query("SHOW COLUMNS FROM properties WHERE Field = 'region'");
console.log('Region column info:');
console.log(JSON.stringify(regionColumn, null, 2));

// Check if SouthEastAsia value exists in any property
const [properties] = await connection.query("SELECT id, title, region FROM properties WHERE region = 'SouthEastAsia' LIMIT 5");
console.log('\nProperties with SouthEastAsia region:');
console.log(JSON.stringify(properties, null, 2));

// Check all unique region values
const [regions] = await connection.query("SELECT DISTINCT region FROM properties");
console.log('\nAll unique region values in database:');
console.log(JSON.stringify(regions, null, 2));

await connection.end();
