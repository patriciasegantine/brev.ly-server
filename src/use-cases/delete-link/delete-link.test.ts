import { describe, it, expect, beforeEach } from 'vitest';
import { deleteLink } from './delete-link';
import { createLink } from '../create-link/create-link';
import { isLeft, isRight } from '@/shared/either';

describe('deleteLink use case', () => {
  it('should delete a link successfully', async () => {
    const createResult = await createLink({
      originalUrl: 'https://www.example.com',
      shortUrl: `delete-test-${Date.now()}`,
    });
    
    if (!isRight(createResult)) {
      throw new Error('Failed to create link for test');
    }
    
    const linkId = createResult.value.id;
    
    const deleteResult = await deleteLink({ id: linkId });
    
    expect(isRight(deleteResult)).toBe(true);
    if (isRight(deleteResult)) {
      expect(deleteResult.value.success).toBe(true);
    }
  });
  
  it('should return error when link does not exist', async () => {
    const result = await deleteLink({ id: 'non-existent-id' });
    
    expect(isLeft(result)).toBe(true);
    if (isLeft(result)) {
      expect(result.value.code).toBe('LINK_NOT_FOUND');
      expect(result.value.message).toBe('Link não encontrado');
    }
  });
  
  it('should throw validation error for empty id', async () => {
    await expect(deleteLink({ id: '' })).rejects.toThrow();
  });
  
  it('should not be able to delete the same link twice', async () => {
    const createResult = await createLink({
      originalUrl: 'https://www.example.com',
      shortUrl: `double-delete-${Date.now()}`,
    });
    
    if (!isRight(createResult)) {
      throw new Error('Failed to create link for test');
    }
    
    const linkId = createResult.value.id;
    
    const firstDelete = await deleteLink({ id: linkId });
    expect(isRight(firstDelete)).toBe(true);
    
    const secondDelete = await deleteLink({ id: linkId });
    expect(isLeft(secondDelete)).toBe(true);
    if (isLeft(secondDelete)) {
      expect(secondDelete.value.code).toBe('LINK_NOT_FOUND');
    }
  });
  
  it('should actually remove the link from database', async () => {
    const createResult = await createLink({
      originalUrl: 'https://www.example.com',
      shortUrl: `verify-delete-${Date.now()}`,
    });
    
    if (!isRight(createResult)) {
      throw new Error('Failed to create link for test');
    }
    
    const linkId = createResult.value.id;
    
    await deleteLink({ id: linkId });
    
    const verifyDelete = await deleteLink({ id: linkId });
    expect(isLeft(verifyDelete)).toBe(true);
  });
});
