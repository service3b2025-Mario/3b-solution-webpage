import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, unlink, readFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomBytes } from "crypto";
import { storagePut } from "./storage.js";

const execAsync = promisify(exec);

/**
 * Generate thumbnail from first page of PDF using pdf2image
 * @param pdfBuffer PDF file buffer
 * @returns Image buffer of first page
 */
export async function generatePDFThumbnail(pdfBuffer: Buffer): Promise<Buffer> {
  const tempId = randomBytes(16).toString("hex");
  const tempPdfPath = join(tmpdir(), `${tempId}.pdf`);
  const tempImagePath = join(tmpdir(), `${tempId}.png`);

  try {
    // Write PDF to temporary file
    await writeFile(tempPdfPath, pdfBuffer);

    // Convert first page to PNG using pdftoppm (available in sandbox)
    // -f 1 -l 1: first page only, -png: output format, -singlefile: single output file
    const outputPrefix = join(tmpdir(), `${tempId}`);
    await execAsync(`pdftoppm -f 1 -l 1 -png -singlefile ${tempPdfPath} ${outputPrefix}`);
    
    // pdftoppm adds .png extension automatically
    const generatedImagePath = `${outputPrefix}.png`;

    // Read the generated image
    const imageBuffer = await readFile(generatedImagePath);

    return imageBuffer;
  } catch (error) {
    console.error("PDF thumbnail generation error:", error);
    throw new Error("Failed to generate PDF thumbnail");
  } finally {
    // Clean up temporary files
    try {
      await unlink(tempPdfPath);
      const generatedImagePath = `${join(tmpdir(), tempId)}.png`;
      await unlink(generatedImagePath);
    } catch (cleanupError) {
      console.warn("Cleanup error:", cleanupError);
    }
  }
}

/**
 * Upload PDF and generate thumbnail, returning both URLs
 * @param pdfBuffer PDF file buffer
 * @param filename Original filename
 * @returns Object with fileUrl and thumbnailUrl
 */
export async function uploadPDFWithThumbnail(
  pdfBuffer: Buffer,
  filename: string
): Promise<{ fileUrl: string; thumbnailUrl: string }> {
  try {
    // Generate unique key for files
    const timestamp = Date.now();
    const randomSuffix = randomBytes(8).toString("hex");
    const baseKey = `market-reports/${timestamp}-${randomSuffix}`;

    // Upload PDF to S3
    const pdfKey = `${baseKey}.pdf`;
    const { url: fileUrl } = await storagePut(pdfKey, pdfBuffer, "application/pdf");

    // Generate thumbnail from first page
    const thumbnailBuffer = await generatePDFThumbnail(pdfBuffer);

    // Upload thumbnail to S3
    const thumbnailKey = `${baseKey}-thumbnail.png`;
    const { url: thumbnailUrl } = await storagePut(
      thumbnailKey,
      thumbnailBuffer,
      "image/png"
    );

    return { fileUrl, thumbnailUrl };
  } catch (error) {
    console.error("PDF upload with thumbnail error:", error);
    throw error;
  }
}
