import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from './routers';

describe('Download Tags Management', () => {
  let createdTagId: number;
  let downloadId: number;

  const createMockContext = () => ({
    user: { id: '1', openId: 'test-open-id', name: 'Test User', email: 'test@example.com', role: 'admin' as const },
    req: { 
      ip: '127.0.0.1', 
      connection: { remoteAddress: '127.0.0.1' }, 
      headers: { 'user-agent': 'test-user-agent' },
      get: () => 'test-user-agent' 
    } as any,
    res: {} as any,
  });

  beforeAll(async () => {
    // Create a test download record first
    const caller = appRouter.createCaller(createMockContext());
    downloadId = await caller.downloads.track({
      fullName: 'Tag Test User',
      email: 'tagtest@example.com',
      resourceType: 'report',
      resourceTitle: 'Test Report for Tagging',
      resourceUrl: '/test-report.pdf',
    });
  });

  it('should create a new tag', async () => {
    const caller = appRouter.createCaller(createMockContext());
    const result = await caller.downloads.tags.create({
      name: 'Test Tag',
      color: '#3B82F6',
      description: 'A test tag for vitest',
    });

    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('name', 'Test Tag');
    expect(result).toHaveProperty('color', '#3B82F6');
    expect(result).toHaveProperty('description', 'A test tag for vitest');
    
    createdTagId = result.id;
  });

  it('should list all tags', async () => {
    const caller = appRouter.createCaller(createMockContext());
    const tags = await caller.downloads.tags.list();

    expect(Array.isArray(tags)).toBe(true);
    expect(tags.length).toBeGreaterThan(0);
    
    const testTag = tags.find(t => t.id === createdTagId);
    expect(testTag).toBeDefined();
    expect(testTag?.name).toBe('Test Tag');
  });

  it('should assign tag to download', async () => {
    const caller = appRouter.createCaller(createMockContext());
    await caller.downloads.tags.assign({
      downloadId,
      tagId: createdTagId,
    });

    // Verify assignment by getting downloads with tags
    const downloads = await caller.downloads.listWithTags({});
    const taggedDownload = downloads.find(d => d.id === downloadId);
    
    expect(taggedDownload).toBeDefined();
    expect(taggedDownload?.tags).toBeDefined();
    expect(Array.isArray(taggedDownload?.tags)).toBe(true);
    expect(taggedDownload?.tags?.length).toBeGreaterThan(0);
    
    const assignedTag = taggedDownload?.tags?.find(t => t.id === createdTagId);
    expect(assignedTag).toBeDefined();
    expect(assignedTag?.name).toBe('Test Tag');
  });

  it('should filter downloads by tag', async () => {
    const caller = appRouter.createCaller(createMockContext());
    const downloads = await caller.downloads.listWithTags({
      tagId: createdTagId,
    });

    expect(Array.isArray(downloads)).toBe(true);
    expect(downloads.length).toBeGreaterThan(0);
    
    // All returned downloads should have the test tag
    downloads.forEach(download => {
      const hasTag = download.tags?.some(t => t.id === createdTagId);
      expect(hasTag).toBe(true);
    });
  });

  it('should remove tag from download', async () => {
    const caller = appRouter.createCaller(createMockContext());
    await caller.downloads.tags.remove({
      downloadId,
      tagId: createdTagId,
    });

    // Verify removal
    const downloads = await caller.downloads.listWithTags({});
    const download = downloads.find(d => d.id === downloadId);
    
    expect(download).toBeDefined();
    const hasTag = download?.tags?.some(t => t.id === createdTagId);
    expect(hasTag).toBe(false);
  });

  it('should delete tag', async () => {
    const caller = appRouter.createCaller(createMockContext());
    await caller.downloads.tags.delete({ id: createdTagId });

    // Verify deletion
    const tags = await caller.downloads.tags.list();
    const deletedTag = tags.find(t => t.id === createdTagId);
    expect(deletedTag).toBeUndefined();
  });

  it('should support all tag colors', async () => {
    const caller = appRouter.createCaller(createMockContext());
    const colors = [
      { name: 'blue', hex: '#3B82F6' },
      { name: 'green', hex: '#10B981' },
      { name: 'red', hex: '#EF4444' },
      { name: 'yellow', hex: '#F59E0B' },
      { name: 'purple', hex: '#8B5CF6' },
      { name: 'pink', hex: '#EC4899' },
      { name: 'orange', hex: '#F97316' },
      { name: 'teal', hex: '#14B8A6' }
    ];
    
    for (const color of colors) {
      const tag = await caller.downloads.tags.create({
        name: `${color.name} Tag`,
        color: color.hex,
      });
      
      expect(tag.color).toBe(color.hex);
      
      // Clean up
      await caller.downloads.tags.delete({ id: tag.id });
    }
  });

  it('should handle bulk tag assignment', async () => {
    const caller = appRouter.createCaller(createMockContext());
    
    // Create a test tag
    const tag = await caller.downloads.tags.create({
      name: 'Bulk Test Tag',
      color: '#10B981',
    });

    // Create multiple downloads
    const downloadIds: number[] = [];
    for (let i = 0; i < 3; i++) {
      const id = await caller.downloads.track({
        fullName: `Bulk User ${i}`,
        email: `bulk${i}@example.com`,
        resourceType: 'report',
        resourceTitle: `Bulk Test Report ${i}`,
        resourceUrl: `/bulk-test-${i}.pdf`,
      });
      downloadIds.push(id);
    }

    // Assign tag to all downloads
    for (const id of downloadIds) {
      await caller.downloads.tags.assign({
        downloadId: id,
        tagId: tag.id,
      });
    }

    // Verify all downloads have the tag
    const downloads = await caller.downloads.listWithTags({
      tagId: tag.id,
    });

    expect(downloads.length).toBeGreaterThanOrEqual(3);
    
    // Clean up
    for (const id of downloadIds) {
      await caller.downloads.tags.remove({
        downloadId: id,
        tagId: tag.id,
      });
    }
    await caller.downloads.tags.delete({ id: tag.id });
  });
});
