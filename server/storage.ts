import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { ENV } from "./_core/env";

interface StorageConfig {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl: string;
}

/**
 * Retrieves the Cloudflare R2 storage configuration from environment variables.
 * Throws an error if any required configuration is missing.
 */
function getStorageConfig(): StorageConfig {
  const { cloudflareAccountId, cloudflareR2AccessKeyId, cloudflareR2SecretAccessKey, r2BucketName, r2PublicUrl } = ENV;

  if (!cloudflareAccountId || !cloudflareR2AccessKeyId || !cloudflareR2SecretAccessKey || !r2BucketName || !r2PublicUrl) {
    throw new Error("Cloudflare R2 storage credentials missing. Please set CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, and R2_PUBLIC_URL environment variables.");
  }

  return {
    accountId: cloudflareAccountId,
    accessKeyId: cloudflareR2AccessKeyId,
    secretAccessKey: cloudflareR2SecretAccessKey,
    bucketName: r2BucketName,
    publicUrl: r2PublicUrl,
  };
}

/**
 * Normalizes a file key by ensuring it doesn't start with a slash.
 */
function normalizeKey(key: string): string {
  return key.startsWith("/") ? key.substring(1) : key;
}

/**
 * Creates and returns a configured S3 client for Cloudflare R2.
 */
function createS3Client(config: StorageConfig): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: true,
  } );
}

/**
 * Uploads a file to Cloudflare R2 storage.
 */
export async function storagePut(fileBuffer: Buffer, mimeType: string, relKey: string): Promise<{ key: string; url: string }> {
  const config = getStorageConfig();
  const key = normalizeKey(relKey);

  const s3Client = createS3Client(config);

  // Ensure we have a proper Uint8Array for the Body
  const body = fileBuffer instanceof Buffer ? new Uint8Array(fileBuffer) : fileBuffer;

  const uploadParams = {
    Bucket: config.bucketName,
    Key: key,
    Body: body,
    ContentType: mimeType,
    ContentLength: body.length,
  };

  try {
    await s3Client.send(new PutObjectCommand(uploadParams));
    const url = `${config.publicUrl}/${key}`;
    console.log(`Successfully uploaded to R2: ${key} -> ${url}`);
    return { key, url };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`R2 Upload Error for ${key}:`, error);
    throw new Error(`Storage upload failed for ${key}: ${message}`);
  }
}

/**
 * Retrieves the public URL for a file in Cloudflare R2 storage.
 */
export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const config = getStorageConfig();
  const key = normalizeKey(relKey);
  const url = `${config.publicUrl}/${key}`;
  return { key, url };
}

/**
 * Checks if the storage is properly configured.
 */
export function isStorageConfigured(): boolean {
  try {
    getStorageConfig();
    return true;
  } catch {
    return false;
  }
}
