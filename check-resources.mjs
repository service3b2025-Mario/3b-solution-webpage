import { db } from './server/db.js';
import { resources } from './drizzle/schema.js';

const allResources = await db.select().from(resources);
console.log('Current resources:');
allResources.forEach(r => {
  console.log(`\nID: ${r.id}`);
  console.log(`Title: ${r.title}`);
  console.log(`File URL: ${r.fileUrl}`);
  console.log(`Category: ${r.category}`);
});
process.exit(0);
