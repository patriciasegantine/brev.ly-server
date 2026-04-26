import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { Readable } from 'node:stream';
import { env } from '@/env';

export type UploadCsvInput = {
  fileKey: string;
  body: Readable;
};

type CloudflareStorageEnv = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicUrl: string;
};

function getCloudflareStorageEnv(): CloudflareStorageEnv | null {
  if (
    !env.CLOUDFLARE_ACCOUNT_ID ||
    !env.CLOUDFLARE_ACCESS_KEY_ID ||
    !env.CLOUDFLARE_SECRET_ACCESS_KEY ||
    !env.CLOUDFLARE_BUCKET ||
    !env.CLOUDFLARE_PUBLIC_URL
  ) {
    return null;
  }

  return {
    accountId: env.CLOUDFLARE_ACCOUNT_ID,
    accessKeyId: env.CLOUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: env.CLOUDFLARE_SECRET_ACCESS_KEY,
    bucket: env.CLOUDFLARE_BUCKET,
    publicUrl: env.CLOUDFLARE_PUBLIC_URL.replace(/\/+$/, ''),
  };
}

export function isCloudflareStorageConfigured() {
  return getCloudflareStorageEnv() !== null;
}

export async function uploadCsvToCloudflareR2(input: UploadCsvInput) {
  const storageEnv = getCloudflareStorageEnv();

  if (!storageEnv) {
    throw new Error('Cloudflare storage is not configured');
  }

  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${storageEnv.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: storageEnv.accessKeyId,
      secretAccessKey: storageEnv.secretAccessKey,
    },
  });

  await client.send(
    new PutObjectCommand({
      Bucket: storageEnv.bucket,
      Key: input.fileKey,
      Body: input.body,
      ContentType: 'text/csv; charset=utf-8',
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );

  return {
    fileUrl: `${storageEnv.publicUrl}/${input.fileKey}`,
  };
}
