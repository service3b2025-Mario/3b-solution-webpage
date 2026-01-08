import { storagePut } from './server/storage.ts';
import { readFileSync } from 'fs';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Image mappings: story ID -> local file path
const storyImages = {
  1: '/home/ubuntu/3b-solution-realestate/generated-images/story1-european-family-office.png',
  2: '/home/ubuntu/3b-solution-realestate/generated-images/story2-developer-philippines.png',
  3: '/home/ubuntu/3b-solution-realestate/generated-images/story3-online-consultation.png',
  4: '/home/ubuntu/3b-solution-realestate/generated-images/story4-middle-eastern-hospitality.png',
};

async function uploadAndUpdateStories() {
  const db = new Database(join(__dirname, '.data', 'sqlite.db'));
  
  console.log('Starting image upload and database update...\n');
  
  for (const [storyId, imagePath] of Object.entries(storyImages)) {
    try {
      console.log(`Processing Story ${storyId}...`);
      
      // Read the image file
      const imageBuffer = readFileSync(imagePath);
      
      // Generate unique S3 key
      const timestamp = Date.now();
      const s3Key = `success-stories/story-${storyId}-${timestamp}.png`;
      
      // Upload to S3
      console.log(`  Uploading to S3: ${s3Key}`);
      const { url } = await storagePut(s3Key, imageBuffer, 'image/png');
      console.log(`  ✓ Uploaded successfully: ${url}`);
      
      // Update database
      const updateQuery = db.prepare('UPDATE success_stories SET image = ? WHERE id = ?');
      updateQuery.run(url, storyId);
      console.log(`  ✓ Database updated for Story ${storyId}\n`);
      
    } catch (error) {
      console.error(`  ✗ Error processing Story ${storyId}:`, error.message);
    }
  }
  
  // Verify updates
  console.log('\nVerifying database updates:');
  const stories = db.prepare('SELECT id, title, image FROM success_stories ORDER BY id').all();
  stories.forEach(story => {
    console.log(`Story ${story.id}: ${story.image ? '✓ Has image' : '✗ No image'}`);
  });
  
  db.close();
  console.log('\n✓ All images uploaded and database updated successfully!');
}

uploadAndUpdateStories().catch(console.error);
