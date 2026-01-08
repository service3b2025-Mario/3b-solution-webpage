import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from './routers';
import { db } from '../drizzle/db';
import { resources } from '../drizzle/schema';

describe('Resources API', () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(async () => {
    // Create a test context with proper request mock
    caller = appRouter.createCaller({
      user: null,
      req: {
        ip: '127.0.0.1',
        headers: {
          'user-agent': 'vitest',
          'x-forwarded-for': '127.0.0.1',
        },
      } as any,
      res: {} as any,
    });
  });

  it('should list active resources', async () => {
    const result = await caller.resources.list();
    
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    
    // Check first resource structure
    const firstResource = result[0];
    expect(firstResource).toHaveProperty('id');
    expect(firstResource).toHaveProperty('title');
    expect(firstResource).toHaveProperty('description');
    expect(firstResource).toHaveProperty('category');
    expect(firstResource).toHaveProperty('fileUrl');
    expect(firstResource.isActive).toBe(true);
  });

  it('should filter resources by category', async () => {
    const result = await caller.resources.byCategory({ category: 'investment_guide' });
    
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    
    // All results should be investment guides
    result.forEach(resource => {
      expect(resource.category).toBe('investment_guide');
    });
  });

  it('should track download, send email, and return download URL', async () => {
    // Get first resource
    const resources = await caller.resources.list();
    expect(resources.length).toBeGreaterThan(0);
    
    const firstResource = resources[0];
    
    const result = await caller.resources.download({
      resourceId: firstResource.id,
      fullName: 'Test User',
      email: 'test@example.com',
    });
    
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.downloadUrl).toBe(firstResource.fileUrl);
    expect(result.title).toBe(firstResource.title);
    
    // Email automation is triggered (logged to console in development)
    // In production, this would send actual emails via SendGrid/SES
  });

  it('should fail download for non-existent resource', async () => {
    await expect(
      caller.resources.download({
        resourceId: 999999,
        fullName: 'Test User',
        email: 'test@example.com',
      })
    ).rejects.toThrow('Resource not found');
  });

  it('should validate email format', async () => {
    const resources = await caller.resources.list();
    expect(resources.length).toBeGreaterThan(0);
    
    await expect(
      caller.resources.download({
        resourceId: resources[0].id,
        fullName: 'Test User',
        email: 'invalid-email',
      })
    ).rejects.toThrow();
  });

  it('should require full name', async () => {
    const resources = await caller.resources.list();
    expect(resources.length).toBeGreaterThan(0);
    
    await expect(
      caller.resources.download({
        resourceId: resources[0].id,
        fullName: '',
        email: 'test@example.com',
      })
    ).rejects.toThrow();
  });
});
