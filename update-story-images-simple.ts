import { storagePut } from './server/storage';
import { readFileSync } from 'fs';

// Image mappings: story ID -> local file path
const storyImages: Record<number, string> = {
  1: '/home/ubuntu/3b-solution-realestate/generated-images/story1-european-family-office.png',
  2: '/home/ubuntu/3b-solution-realestate/generated-images/story2-developer-philippines.png',
  3: '/home/ubuntu/3b-solution-realestate/generated-images/story3-online-consultation.png',
  4: '/home/ubuntu/3b-solution-realestate/generated-images/story4-middle-eastern-hospitality.png',
};

async function uploadImages() {
  console.log('Starting image upload to S3...\n');
  
  const results: Record<number, string> = {};
  
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
      console.log(`  ✓ Uploaded successfully: ${url}\n`);
      
      results[parseInt(storyId)] = url;
      
    } catch (error: any) {
      console.error(`  ✗ Error processing Story ${storyId}:`, error.message);
    }
  }
  
  console.log('\n=== SQL UPDATE STATEMENTS ===\n');
  for (const [storyId, url] of Object.entries(results)) {
    console.log(`UPDATE success_stories SET image = '${url}' WHERE id = ${storyId};`);
  }
  console.log('\n✓ All images uploaded to S3! Copy the SQL statements above to update the database.');
}

uploadImages().catch(console.error);
