// Cloudflare R2 Storage Implementation
// S3-compatible object storage with zero egress fees

import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { ENV } from './_core/env';

// Storage configuration type
type StorageConfig = {
  client: S3Client;
  bucketName: string;
  publicUrl: string;
};

// Lazy initialization of S3 client to avoid startup errors
let storageConfig: StorageConfig | null = null;

function getStorageConfig( ): StorageConfig {
  if (storageConfig) {
    return storageConfig;
  }

  // Check for Cloudflare R2 credentials
  const { cloudflareAccountId, cloudflareR2AccessKeyId, cloudflareR2SecretAccessKey, r2BucketName, r2PublicUrl } = ENV;

  if (cloudflareAccountId && cloudflareR2AccessKeyId && cloudflareR2SecretAccessKey && r2BucketName) {
    // Use Cloudflare R2
    const client = new S3Client({
      region: "auto",
      endpoint: `https://${cloudflareAccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: cloudflareR2AccessKeyId,
        secretAccessKey: cloudflareR2SecretAccessKey,
      },
    } );

    storageConfig = {
      client,
      bucketName: r2BucketName,
      publicUrl: r2PublicUrl.endsWith('/') ? r2PublicUrl : `${r2PublicUrl}/`,
    };

    console.log('[Storage] Using Cloudflare R2 storage');
    return storageConfig;
  }

  // Fallback: Check for legacy Manus Forge credentials
  if (ENV.forgeApiUrl && ENV.forgeApiKey) {
    throw new Error(
      "Manus Forge storage is deprecated. Please configure Cloudflare R2 credentials: " +
      "CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL"
    );
  }

  throw new Error(
    "Storage credentials missing. Please set the following environment variables: " +
    "CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL"
  );
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

/**
 * Uploads a file to Cloudflare R2 storage.
 * @param relKey - The relative key (path) for the file in the bucket
 * @param data - The file content as Buffer, Uint8Array, or string
 * @param contentType - The MIME type of the file (default: application/octet-stream)
 * @returns Object containing the key and public URL of the uploaded file
 */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const config = getStorageConfig();
  const key = normalizeKey(relKey);

  // Convert string data to Buffer if necessary
  const body = typeof data === "string" ? Buffer.from(data) : data;

  const command = new PutObjectCommand({
    Bucket: config.bucketName,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  try {
    await config.client.send(command);
    const url = `${config.publicUrl}${key}`;
    console.log(`[Storage] Uploaded: ${key} -> ${url}`);
    return { key, url };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Storage upload failed for ${key}: ${message}`);
  }
}

/**
 * Retrieves the public URL for a file in Cloudflare R2 storage.
 * @param relKey - The relative key (path) for the file in the bucket
 * @returns Object containing the key and public URL of the file
 */
export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const config = getStorageConfig();
  const key = normalizeKey(relKey);
  const url = `${config.publicUrl}${key}`;
  return { key, url };
}

/**
 * Checks if the storage is properly configured.
 * @returns true if storage is configured, false otherwise
 */
export function isStorageConfigured(): boolean {
  try {
    getStorageConfig();
    return true;
  } catch {
    return false;
  }
}
