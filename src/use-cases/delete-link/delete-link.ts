import { z } from 'zod';
import { type Either, makeLeft, makeRight } from '@/shared/either';
import { db } from '@/db';
import { schema } from '@/db/schemas';
import { eq } from 'drizzle-orm';

export const deleteLinkInput = z.object({
  id: z.string().min(1, { message: 'ID é obrigatório' }),
});

export type DeleteLinkInput = z.input<typeof deleteLinkInput>;

export type DeleteLinkOutput = {
  success: true;
};

export type DeleteLinkError = {
  code: 'LINK_NOT_FOUND';
  message: string;
};

export async function deleteLink(
  input: DeleteLinkInput
): Promise<Either<DeleteLinkError, DeleteLinkOutput>> {
  const { id } = deleteLinkInput.parse(input);
  
  const [existingLink] = await db
    .select()
    .from(schema.links)
    .where(eq(schema.links.id, id))
    .limit(1);
  
  if (!existingLink) {
    return makeLeft({
      code: 'LINK_NOT_FOUND',
      message: 'Link não encontrado',
    });
  }
  
  await db.delete(schema.links).where(eq(schema.links.id, id));
  
  return makeRight({ success: true });
}
