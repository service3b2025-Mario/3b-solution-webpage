/**
 * One-time migration script to optimize existing success story images
 * and market report thumbnails to WebP format using Sharp.
 *
 * Usage:
 *   node scripts/optimize-stories-reports.mjs --dry-run    # Preview changes without modifying anything
 *   node scripts/optimize-stories-reports.mjs              # Execute the migration
 *
 * Required env vars (already set on Render):
 *   DATABASE_URL, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID,
 *   CLOUDFLARE_R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL
 */

import mysql from "mysql2/promise";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

// ── Config ──────────────────────────────────────────────────────────
const DRY_RUN = process.argv.includes("--dry-run");
const DATABASE_URL = process.env.DATABASE_URL;
const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const R2_ACCESS_KEY = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const R2_SECRET_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const R2_BUCKET = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL is required");
  process.exit(1);
}

// ── S3 Client for R2 ───────────────────────────────────────────────
const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY, secretAccessKey: R2_SECRET_KEY },
  forcePathStyle: true,
});

async function uploadToR2(key, buffer, contentType) {
  const body = new Uint8Array(buffer);
  await s3.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
    ContentLength: body.length,
  }));
  return `${R2_PUBLIC_URL}/${key}`;
}

// ── Image Processing ────────────────────────────────────────────────
async function downloadImage(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download: ${url} (${response.status})`);
  return Buffer.from(await response.arrayBuffer());
}

async function optimizeImage(buffer, maxWidth, maxHeight, quality) {
  return sharp(buffer)
    .resize(maxWidth, maxHeight, { fit: "inside", withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();
}

// ── Main ────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  Image Optimization Migration`);
  console.log(`  Mode: ${DRY_RUN ? "🔍 DRY RUN (no changes)" : "🚀 LIVE EXECUTION"}`);
  console.log(`${"=".repeat(60)}\n`);

  const connection = await mysql.createConnection(DATABASE_URL);

  try {
    // ── 1. Success Story Images ──────────────────────────────────
    console.log("📸 Processing Success Story Images...\n");
    const [stories] = await connection.execute(
      "SELECT id, title, image FROM success_stories WHERE image IS NOT NULL AND image != ''"
    );

    let storyCount = 0;
    let storySavedKB = 0;

    for (const story of stories) {
      const url = story.image;
      // Skip if already WebP
      if (url.endsWith(".webp")) {
        console.log(`  ✅ Story #${story.id} "${story.title}" — already WebP, skipping`);
        continue;
      }

      try {
        console.log(`  📥 Story #${story.id} "${story.title}"`);
        const originalBuffer = await downloadImage(url);
        const originalKB = (originalBuffer.length / 1024).toFixed(0);

        // Optimize: max 1920x1080, WebP quality 82
        const optimizedBuffer = await optimizeImage(originalBuffer, 1920, 1080, 82);
        const optimizedKB = (optimizedBuffer.length / 1024).toFixed(0);
        const savings = ((1 - optimizedBuffer.length / originalBuffer.length) * 100).toFixed(1);

        console.log(`     ${originalKB} KB → ${optimizedKB} KB (${savings}% smaller)`);
        storySavedKB += (originalBuffer.length - optimizedBuffer.length) / 1024;

        if (!DRY_RUN) {
          // Upload optimized version to R2
          const timestamp = Date.now();
          const randomStr = Math.random().toString(36).substring(7);
          const newKey = `success-stories/story-${story.id}-${timestamp}-${randomStr}.webp`;
          const newUrl = await uploadToR2(newKey, optimizedBuffer, "image/webp");

          // Update database
          await connection.execute(
            "UPDATE success_stories SET image = ? WHERE id = ?",
            [newUrl, story.id]
          );
          console.log(`     ✅ Updated → ${newUrl}`);
        }
        storyCount++;
      } catch (err) {
        console.error(`     ❌ Error processing story #${story.id}: ${err.message}`);
      }
    }

    // ── 2. Market Report Thumbnails ──────────────────────────────
    console.log("\n📄 Processing Market Report Thumbnails...\n");
    const [reports] = await connection.execute(
      "SELECT id, title, thumbnail_url FROM market_reports WHERE thumbnail_url IS NOT NULL AND thumbnail_url != ''"
    );

    let reportCount = 0;
    let reportSavedKB = 0;

    for (const report of reports) {
      const url = report.thumbnail_url;
      // Skip if already WebP
      if (url.endsWith(".webp")) {
        console.log(`  ✅ Report #${report.id} "${report.title}" — already WebP, skipping`);
        continue;
      }

      try {
        console.log(`  📥 Report #${report.id} "${report.title}"`);
        const originalBuffer = await downloadImage(url);
        const originalKB = (originalBuffer.length / 1024).toFixed(0);

        // Optimize: max 800x600, WebP quality 80 (thumbnails can be smaller)
        const optimizedBuffer = await optimizeImage(originalBuffer, 800, 600, 80);
        const optimizedKB = (optimizedBuffer.length / 1024).toFixed(0);
        const savings = ((1 - optimizedBuffer.length / originalBuffer.length) * 100).toFixed(1);

        console.log(`     ${originalKB} KB → ${optimizedKB} KB (${savings}% smaller)`);
        reportSavedKB += (originalBuffer.length - optimizedBuffer.length) / 1024;

        if (!DRY_RUN) {
          // Upload optimized version to R2
          const timestamp = Date.now();
          const randomStr = Math.random().toString(36).substring(7);
          const newKey = `market-reports/thumb-${report.id}-${timestamp}-${randomStr}.webp`;
          const newUrl = await uploadToR2(newKey, optimizedBuffer, "image/webp");

          // Update database
          await connection.execute(
            "UPDATE market_reports SET thumbnail_url = ? WHERE id = ?",
            [newUrl, report.id]
          );
          console.log(`     ✅ Updated → ${newUrl}`);
        }
        reportCount++;
      } catch (err) {
        console.error(`     ❌ Error processing report #${report.id}: ${err.message}`);
      }
    }

    // ── Summary ──────────────────────────────────────────────────
    console.log(`\n${"=".repeat(60)}`);
    console.log(`  SUMMARY ${DRY_RUN ? "(DRY RUN)" : ""}`);
    console.log(`${"=".repeat(60)}`);
    console.log(`  Story images processed:  ${storyCount}`);
    console.log(`  Report thumbs processed: ${reportCount}`);
    console.log(`  Total space saved:       ${((storySavedKB + reportSavedKB) / 1024).toFixed(1)} MB`);
    console.log(`    - Stories:             ${(storySavedKB / 1024).toFixed(1)} MB`);
    console.log(`    - Report thumbnails:   ${(reportSavedKB / 1024).toFixed(1)} MB`);
    if (DRY_RUN) {
      console.log(`\n  ℹ️  Run without --dry-run to apply changes.`);
    } else {
      console.log(`\n  ✅ All changes applied successfully!`);
    }
    console.log("");

  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
