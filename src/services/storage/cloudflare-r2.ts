import { S3Client } from '@aws-sdk/client-s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import type { Readable } from 'node:stream';
import { z } from 'zod';
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

const cloudflareStorageEnvSchema = z.object({
  accountId: z.string().min(1),
  accessKeyId: z.string().min(1),
  secretAccessKey: z.string().min(1),
  bucket: z.string().min(1),
  publicUrl: z.string().url().min(1),
});

function getCloudflareStorageEnv(): CloudflareStorageEnv | null {
  const parsedEnv = cloudflareStorageEnvSchema.safeParse({
    accountId: env.CLOUDFLARE_ACCOUNT_ID,
    accessKeyId: env.CLOUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: env.CLOUDFLARE_SECRET_ACCESS_KEY,
    bucket: env.CLOUDFLARE_BUCKET,
    publicUrl: env.CLOUDFLARE_PUBLIC_URL?.replace(/\/+$/, ''),
  });

  if (!parsedEnv.success) {
    return null;
  }

  return parsedEnv.data;
}

export function isCloudflareStorageConfigured() {
  return getCloudflareStorageEnv() !== null;
}

async function readStreamToBuffer(stream: Readable) {
  const chunks: Buffer[] = [];

  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
  }

  return Buffer.concat(chunks);
}

export async function uploadCsvToCloudflareR2(input: UploadCsvInput) {
  const storageEnv = getCloudflareStorageEnv();

  if (!storageEnv) {
    throw new Error('Cloudflare storage is not configured');
  }

  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${storageEnv.accountId}.r2.cloudflarestorage.com`,
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
    credentials: {
      accessKeyId: storageEnv.accessKeyId,
      secretAccessKey: storageEnv.secretAccessKey,
    },
  });

  const csvBuffer = await readStreamToBuffer(input.body);

  await client.send(
    new PutObjectCommand({
      Bucket: storageEnv.bucket,
      Key: input.fileKey,
      Body: csvBuffer,
      ContentLength: csvBuffer.length,
      ContentType: 'text/csv; charset=utf-8',
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );

  return {
    fileUrl: `${storageEnv.publicUrl}/${input.fileKey}`,
  };
}
