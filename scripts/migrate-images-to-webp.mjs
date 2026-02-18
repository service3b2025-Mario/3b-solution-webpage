#!/usr/bin/env node
/**
 * One-time migration script: Optimize all existing property images
 * 
 * What it does:
 * 1. Fetches all properties from the database
 * 2. For each image URL (both R2 and CloudFront):
 *    - Downloads the original image
 *    - Resizes to max 1920x1080 (preserving aspect ratio)
 *    - Converts to WebP at quality 82
 *    - Uploads the optimized version to R2
 *    - Updates the database URL to point to the new file
 * 3. Logs a summary of savings
 * 
 * Usage:
 *   DATABASE_URL=... CLOUDFLARE_ACCOUNT_ID=... CLOUDFLARE_R2_ACCESS_KEY_ID=... \
 *   CLOUDFLARE_R2_SECRET_ACCESS_KEY=... R2_BUCKET_NAME=... R2_PUBLIC_URL=... \
 *   node scripts/migrate-images-to-webp.mjs
 * 
 * Or if running on Render where env vars are already set:
 *   node scripts/migrate-images-to-webp.mjs
 * 
 * Add --dry-run to preview changes without modifying anything:
 *   node scripts/migrate-images-to-webp.mjs --dry-run
 */

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import postgres from "postgres";
import sharp from "sharp";
import https from "https";
import http from "http";

// ─── Configuration ───────────────────────────────────────────────
const DRY_RUN = process.argv.includes("--dry-run");
const BATCH_SIZE = 5; // Process 5 images concurrently to avoid memory issues
const MAX_DIMENSION = 1920;
const MAX_HEIGHT = 1080;
const WEBP_QUALITY = 82;

// ─── Environment ─────────────────────────────────────────────────
const DATABASE_URL = process.env.DATABASE_URL;
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const CLOUDFLARE_R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL is required");
  process.exit(1);
}
if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_R2_ACCESS_KEY_ID || !CLOUDFLARE_R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_PUBLIC_URL) {
  console.error("❌ Cloudflare R2 credentials are required (CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL)");
  process.exit(1);
}

// ─── S3 Client for R2 ───────────────────────────────────────────
const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

// ─── Database ────────────────────────────────────────────────────
const sql = postgres(DATABASE_URL);

// ─── Helpers ─────────────────────────────────────────────────────

/**
 * Download an image from a URL and return it as a Buffer
 */
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    const request = client.get(url, { timeout: 30000 }, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        downloadImage(res.headers.location).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    });
    request.on("error", reject);
    request.on("timeout", () => {
      request.destroy();
      reject(new Error(`Timeout downloading ${url}`));
    });
  });
}

/**
 * Process an image buffer with Sharp: resize + convert to WebP
 */
async function optimizeImage(buffer) {
  return sharp(buffer)
    .rotate() // Auto-rotate based on EXIF
    .resize(MAX_DIMENSION, MAX_HEIGHT, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
}

/**
 * Upload a buffer to R2 and return the public URL
 */
async function uploadToR2(buffer, key) {
  const body = new Uint8Array(buffer);
  await s3Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: "image/webp",
      ContentLength: body.length,
    })
  );
  return `${R2_PUBLIC_URL}/${key}`;
}

/**
 * Check if a URL is already an optimized WebP from our pipeline
 */
function isAlreadyOptimized(url) {
  return url.includes("r2.dev/properties/optimized/") && url.endsWith(".webp");
}

/**
 * Process a single image URL: download → optimize → upload → return new URL
 */
async function processImage(url, propertyId, imageIndex) {
  if (isAlreadyOptimized(url)) {
    return { url, skipped: true, reason: "already optimized" };
  }

  try {
    // Download
    const originalBuffer = await downloadImage(url);
    const originalSize = originalBuffer.length;

    // Optimize
    const optimizedBuffer = await optimizeImage(originalBuffer);
    const optimizedSize = optimizedBuffer.length;

    // Generate new key
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 10);
    const newKey = `properties/optimized/${timestamp}-${randomStr}.webp`;

    if (DRY_RUN) {
      const savings = ((1 - optimizedSize / originalSize) * 100).toFixed(1);
      return {
        url,
        newUrl: `[DRY RUN] ${R2_PUBLIC_URL}/${newKey}`,
        originalSize,
        optimizedSize,
        savings: `${savings}%`,
        skipped: false,
      };
    }

    // Upload
    const newUrl = await uploadToR2(optimizedBuffer, newKey);
    const savings = ((1 - optimizedSize / originalSize) * 100).toFixed(1);

    return {
      url,
      newUrl,
      originalSize,
      optimizedSize,
      savings: `${savings}%`,
      skipped: false,
    };
  } catch (error) {
    return {
      url,
      error: error.message,
      skipped: true,
      reason: "processing failed",
    };
  }
}

/**
 * Process images in batches to avoid memory issues
 */
async function processBatch(items) {
  return Promise.all(items.map(({ url, propertyId, index }) => processImage(url, propertyId, index)));
}

// ─── Main ────────────────────────────────────────────────────────
async function main() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  3B Solution — Image Optimization Migration Script");
  console.log(`  Mode: ${DRY_RUN ? "🔍 DRY RUN (no changes)" : "🚀 LIVE (will modify database)"}`);
  console.log("═══════════════════════════════════════════════════════════\n");

  // Fetch all properties with images
  const rows = await sql`SELECT id, images, "mainImage" FROM properties WHERE images IS NOT NULL`;
  console.log(`Found ${rows.length} properties with images\n`);

  let totalOriginalBytes = 0;
  let totalOptimizedBytes = 0;
  let totalProcessed = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const row of rows) {
    const propertyId = row.id;
    let images;
    try {
      images = typeof row.images === "string" ? JSON.parse(row.images) : row.images;
    } catch {
      console.warn(`  ⚠️  Property #${propertyId}: Could not parse images JSON, skipping`);
      continue;
    }

    if (!Array.isArray(images) || images.length === 0) continue;

    console.log(`\n📦 Property #${propertyId} — ${images.length} images`);

    // Build batch items
    const batchItems = images.map((url, index) => ({ url, propertyId, index }));

    // Process in batches
    const updatedUrls = [...images];
    let propertyChanged = false;

    for (let i = 0; i < batchItems.length; i += BATCH_SIZE) {
      const batch = batchItems.slice(i, i + BATCH_SIZE);
      const results = await processBatch(batch);

      for (let j = 0; j < results.length; j++) {
        const result = results[j];
        const originalIndex = i + j;

        if (result.skipped) {
          totalSkipped++;
          if (result.error) {
            totalErrors++;
            console.log(`  ❌ [${originalIndex + 1}/${images.length}] Error: ${result.error}`);
            console.log(`     URL: ${result.url}`);
          } else {
            console.log(`  ⏭️  [${originalIndex + 1}/${images.length}] Already optimized`);
          }
        } else {
          totalProcessed++;
          totalOriginalBytes += result.originalSize;
          totalOptimizedBytes += result.optimizedSize;
          console.log(
            `  ✅ [${originalIndex + 1}/${images.length}] ${(result.originalSize / 1024).toFixed(0)}KB → ${(result.optimizedSize / 1024).toFixed(0)}KB (${result.savings} saved)`
          );

          if (!DRY_RUN) {
            updatedUrls[originalIndex] = result.newUrl;
            propertyChanged = true;
          }
        }
      }
    }

    // Update database if any images changed
    if (propertyChanged && !DRY_RUN) {
      const newMainImage = updatedUrls[0]; // First image is always the main image
      await sql`
        UPDATE properties 
        SET images = ${JSON.stringify(updatedUrls)}, 
            "mainImage" = ${newMainImage}
        WHERE id = ${propertyId}
      `;
      console.log(`  💾 Database updated for property #${propertyId}`);
    }
  }

  // Summary
  const totalSavings = totalOriginalBytes > 0 ? ((1 - totalOptimizedBytes / totalOriginalBytes) * 100).toFixed(1) : "0";
  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("  Migration Summary");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`  Images processed:  ${totalProcessed}`);
  console.log(`  Images skipped:    ${totalSkipped}`);
  console.log(`  Errors:            ${totalErrors}`);
  console.log(`  Original total:    ${(totalOriginalBytes / 1024 / 1024).toFixed(1)} MB`);
  console.log(`  Optimized total:   ${(totalOptimizedBytes / 1024 / 1024).toFixed(1)} MB`);
  console.log(`  Total savings:     ${totalSavings}%`);
  console.log(`  Mode:              ${DRY_RUN ? "DRY RUN (no changes made)" : "LIVE (changes applied)"}`);
  console.log("═══════════════════════════════════════════════════════════\n");

  await sql.end();
  process.exit(0);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
