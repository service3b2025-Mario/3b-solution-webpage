#!/usr/bin/env node
import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '../client/public');

// Images to optimize
const imagesToOptimize = [
  {
    input: '3b-logo.png',
    sizes: [{ width: 200, suffix: '-200w' }, { width: 400, suffix: '-400w' }],
  },
  {
    input: '3b-logo-transparent.png',
    sizes: [{ width: 200, suffix: '-200w' }, { width: 400, suffix: '-400w' }],
  },
  {
    input: 'hero-background.jpg',
    sizes: [
      { width: 640, suffix: '-640w' },
      { width: 1024, suffix: '-1024w' },
      { width: 1920, suffix: '-1920w' },
    ],
  },
  {
    input: 'team-bibian.png',
    sizes: [{ width: 400, suffix: '-400w' }],
  },
  {
    input: 'team-engela.png',
    sizes: [{ width: 400, suffix: '-400w' }],
  },
  {
    input: 'team-georg.png',
    sizes: [{ width: 400, suffix: '-400w' }],
  },
];

async function optimizeImage(inputPath, outputPath, width, quality = 80) {
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    // Only resize if image is larger than target width
    if (metadata.width > width) {
      await image
        .resize(width, null, { withoutEnlargement: true })
        .webp({ quality })
        .toFile(outputPath);
    } else {
      // Just convert to WebP without resizing
      await image
        .webp({ quality })
        .toFile(outputPath);
    }
    
    console.log(`✅ Created: ${path.basename(outputPath)}`);
  } catch (error) {
    console.error(`❌ Error processing ${inputPath}:`, error.message);
  }
}

async function main() {
  console.log('🚀 Starting image optimization...\n');
  
  for (const config of imagesToOptimize) {
    const inputPath = path.join(PUBLIC_DIR, config.input);
    
    try {
      await fs.access(inputPath);
    } catch {
      console.log(`⚠️  Skipping ${config.input} (not found)`);
      continue;
    }
    
    console.log(`📸 Processing: ${config.input}`);
    
    // Create responsive versions
    for (const size of config.sizes) {
      const baseName = path.parse(config.input).name;
      const outputName = `${baseName}${size.suffix}.webp`;
      const outputPath = path.join(PUBLIC_DIR, outputName);
      
      await optimizeImage(inputPath, outputPath, size.width);
    }
    
    // Create a default WebP version (original size)
    const baseName = path.parse(config.input).name;
    const defaultWebP = path.join(PUBLIC_DIR, `${baseName}.webp`);
    
    try {
      await sharp(inputPath)
        .webp({ quality: 85 })
        .toFile(defaultWebP);
      console.log(`✅ Created: ${baseName}.webp (original size)`);
    } catch (error) {
      console.error(`❌ Error creating default WebP:`, error.message);
    }
    
    console.log('');
  }
  
  console.log('✨ Image optimization complete!');
}

main().catch(console.error);
