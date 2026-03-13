import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app } from '@/app';
import { createLink } from '@/use-cases/create-link/create-link';

describe('DELETE /links/:id route', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 204 when link exists', async () => {
    const { value: link } = await createLink({
      originalUrl: 'https://example.com',
      shortUrl: `delete-ok-${Date.now()}`,
    }) as { value: { id: string } };

    const response = await app.inject({
      method: 'DELETE',
      url: `/links/${link.id}`,
    });

    expect(response.statusCode).toBe(204);
  });

  it('returns 404 when link does not exist', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: '/links/non-existent-id',
    });

    expect(response.statusCode).toBe(404);
    const body = response.json();
    expect(body).toHaveProperty('message');
  });

  it('deletes the link permanently from the database', async () => {
    const shortUrl = `delete-permanent-${Date.now()}`;

    const { value: link } = await createLink({
      originalUrl: 'https://example.com/permanent',
      shortUrl,
    }) as { value: { id: string } };

    await app.inject({
      method: 'DELETE',
      url: `/links/${link.id}`,
    });

    const secondDelete = await app.inject({
      method: 'DELETE',
      url: `/links/${link.id}`,
    });

    expect(secondDelete.statusCode).toBe(404);
  });
});
