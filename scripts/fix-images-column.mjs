#!/usr/bin/env node
/**
 * Fix: Convert images column from string-encoded JSON back to proper JSONB arrays
 * 
 * The migrate-images-to-webp.mjs script used JSON.stringify() which stored
 * the array as a plain string instead of a proper JSONB value.
 * This caused: TypeError: e.images.map is not a function
 * 
 * Usage:
 *   node scripts/fix-images-column.mjs          # Live fix
 *   node scripts/fix-images-column.mjs --dry-run # Preview only
 */

import postgres from "postgres";

const DRY_RUN = process.argv.includes("--dry-run");
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL is required");
  process.exit(1);
}

const sql = postgres(DATABASE_URL);

async function main() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  Fix images column — String → JSONB Array");
  console.log(`  Mode: ${DRY_RUN ? "🔍 DRY RUN" : "🚀 LIVE"}`);
  console.log("═══════════════════════════════════════════════════════════\n");

  // Find all properties where images is stored as a string (not a proper array)
  const rows = await sql`SELECT id, title, images, "mainImage" FROM properties WHERE images IS NOT NULL`;
  
  console.log(`Found ${rows.length} properties with images\n`);

  let fixed = 0;
  let alreadyOk = 0;
  let errors = 0;

  for (const row of rows) {
    const { id, title, images } = row;

    // Check if images is already a proper array
    if (Array.isArray(images)) {
      console.log(`  ✅ Property #${id} "${title}" — already a proper array (${images.length} images)`);
      alreadyOk++;
      continue;
    }

    // If it's a string, try to parse it
    if (typeof images === "string") {
      try {
        const parsed = JSON.parse(images);
        if (Array.isArray(parsed)) {
          console.log(`  🔧 Property #${id} "${title}" — string → array (${parsed.length} images)`);
          
          if (!DRY_RUN) {
            // Use sql.json() to properly store as JSONB
            await sql`
              UPDATE properties 
              SET images = ${sql.json(parsed)}
              WHERE id = ${id}
            `;
          }
          fixed++;
        } else {
          console.log(`  ⚠️  Property #${id} "${title}" — parsed but not an array: ${typeof parsed}`);
          errors++;
        }
      } catch (e) {
        console.log(`  ❌ Property #${id} "${title}" — failed to parse: ${e.message}`);
        console.log(`     Value: ${images.substring(0, 100)}...`);
        errors++;
      }
    } else {
      console.log(`  ⚠️  Property #${id} "${title}" — unexpected type: ${typeof images}`);
      errors++;
    }
  }

  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("  Summary");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`  Already OK:  ${alreadyOk}`);
  console.log(`  Fixed:       ${fixed}`);
  console.log(`  Errors:      ${errors}`);
  console.log(`  Mode:        ${DRY_RUN ? "DRY RUN (no changes)" : "LIVE (changes applied)"}`);
  console.log("═══════════════════════════════════════════════════════════\n");

  await sql.end();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
