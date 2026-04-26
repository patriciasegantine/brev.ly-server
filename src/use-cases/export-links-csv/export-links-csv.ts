import { randomUUID } from 'node:crypto';
import { PassThrough } from 'node:stream';
import { and, asc, eq, gt, or } from 'drizzle-orm';
import { db } from '@/db';
import { schema } from '@/db/schemas';
import { type Either, makeLeft, makeRight } from '@/shared/either';
import {
  isCloudflareStorageConfigured,
  uploadCsvToCloudflareR2,
  type UploadCsvInput,
} from '@/services/storage/cloudflare-r2';

const CSV_BATCH_SIZE = 500;

type ExportCursor = {
  createdAt: Date;
  id: string;
};

type ExportCsvDeps = {
  isStorageConfigured(): boolean;
  uploadCsv(input: UploadCsvInput): Promise<{ fileUrl: string }>;
};

const defaultDeps: ExportCsvDeps = {
  isStorageConfigured: isCloudflareStorageConfigured,
  uploadCsv: uploadCsvToCloudflareR2,
};

export type ExportLinksCsvOutput = {
  fileKey: string;
  fileUrl: string;
};

export type ExportLinksCsvError =
  | {
      code: 'STORAGE_NOT_CONFIGURED';
      message: string;
    }
  | {
      code: 'EXPORT_FAILED';
      message: string;
    };

function escapeCsvField(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function toCsvLine(params: {
  originalUrl: string;
  shortUrl: string;
  accessCount: number;
  createdAt: Date;
}) {
  return [
    escapeCsvField(params.originalUrl),
    escapeCsvField(params.shortUrl),
    String(params.accessCount),
    escapeCsvField(params.createdAt.toISOString()),
  ].join(',');
}

async function getLinksBatch(cursor: ExportCursor | null) {
  return db
    .select({
      id: schema.links.id,
      originalUrl: schema.links.originalUrl,
      shortUrl: schema.links.shortUrl,
      accessCount: schema.links.accessCount,
      createdAt: schema.links.createdAt,
    })
    .from(schema.links)
    .where(
      cursor
        ? or(
            gt(schema.links.createdAt, cursor.createdAt),
            and(
              eq(schema.links.createdAt, cursor.createdAt),
              gt(schema.links.id, cursor.id)
            )
          )
        : undefined
    )
    .orderBy(asc(schema.links.createdAt), asc(schema.links.id))
    .limit(CSV_BATCH_SIZE);
}

function generateExportFileKey() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `exports/links-${timestamp}-${randomUUID()}.csv`;
}

export async function exportLinksCsv(
  deps: ExportCsvDeps = defaultDeps
): Promise<Either<ExportLinksCsvError, ExportLinksCsvOutput>> {
  if (!deps.isStorageConfigured()) {
    return makeLeft({
      code: 'STORAGE_NOT_CONFIGURED',
      message: 'Cloudflare storage environment variables are not configured',
    });
  }

  const fileKey = generateExportFileKey();
  const csvStream = new PassThrough();

  const writeCsvPromise = (async () => {
    csvStream.write('original_url,short_url,access_count,created_at\n');

    let cursor: ExportCursor | null = null;

    while (true) {
      const linksBatch = await getLinksBatch(cursor);

      if (linksBatch.length === 0) {
        break;
      }

      for (const link of linksBatch) {
        csvStream.write(
          `${toCsvLine({
            originalUrl: link.originalUrl,
            shortUrl: link.shortUrl,
            accessCount: link.accessCount,
            createdAt: link.createdAt,
          })}\n`
        );
      }

      const lastLink = linksBatch[linksBatch.length - 1];
      cursor = {
        createdAt: lastLink.createdAt,
        id: lastLink.id,
      };
    }

    csvStream.end();
  })().catch((error) => {
    csvStream.destroy(error as Error);
    throw error;
  });

  try {
    const [{ fileUrl }] = await Promise.all([
      deps.uploadCsv({ fileKey, body: csvStream }),
      writeCsvPromise,
    ]);

    return makeRight({
      fileKey,
      fileUrl,
    });
  } catch {
    return makeLeft({
      code: 'EXPORT_FAILED',
      message: 'Failed to export links CSV',
    });
  }
}
