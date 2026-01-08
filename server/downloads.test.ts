import { describe, it, expect } from 'vitest';
import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';

function createMockContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: 'https',
      headers: {
        'user-agent': 'vitest-test-agent',
        'x-forwarded-for': '127.0.0.1',
      },
      ip: '127.0.0.1',
      connection: {
        remoteAddress: '127.0.0.1',
      },
    } as TrpcContext['req'],
    res: {} as TrpcContext['res'],
  };
}

describe('Downloads Tracking', () => {
  it('should track download with all required fields', async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const testDownload = {
      fullName: 'Test User',
      email: 'test@example.com',
      resourceType: 'report' as const,
      resourceId: 1,
      resourceTitle: 'Test Market Report',
      resourceUrl: 'https://example.com/report.pdf',
    };

    const downloadId = await caller.downloads.track(testDownload);
    
    expect(downloadId).toBeDefined();
    expect(typeof downloadId).toBe('number');
    expect(downloadId).toBeGreaterThan(0);
  });

  it('should track download without resourceId (for non-database resources)', async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const testDownload = {
      fullName: 'Jane Investor',
      email: 'jane@example.com',
      resourceType: 'guide' as const,
      resourceTitle: '3B Solution Investment Guide',
      resourceUrl: '/investment-guide.pdf',
    };

    const downloadId = await caller.downloads.track(testDownload);
    
    expect(downloadId).toBeDefined();
    expect(typeof downloadId).toBe('number');
    expect(downloadId).toBeGreaterThan(0);
  });

  it('should support all resource types', async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const resourceTypes = ['report', 'brochure', 'photo', 'document', 'guide'] as const;

    for (const type of resourceTypes) {
      const downloadId = await caller.downloads.track({
        fullName: `Test ${type}`,
        email: `${type}@example.com`,
        resourceType: type,
        resourceTitle: `Test ${type}`,
        resourceUrl: `/test-${type}.pdf`,
      });

      expect(typeof downloadId).toBe('number');
      expect(downloadId).toBeGreaterThan(0);
    }
  });

  it('should track downloads successfully with valid data', async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // Valid download with full name
    const downloadId1 = await caller.downloads.track({
      fullName: 'Valid Name',
      email: 'test@example.com',
      resourceType: 'report' as const,
      resourceTitle: 'Test',
      resourceUrl: '/test.pdf',
    });
    expect(downloadId1).toBeGreaterThan(0);

    // Valid download with different email
    const downloadId2 = await caller.downloads.track({
      fullName: 'Test User',
      email: 'valid@example.com',
      resourceType: 'report' as const,
      resourceTitle: 'Test',
      resourceUrl: '/test.pdf',
    });
    expect(downloadId2).toBeGreaterThan(0);
  });

  it('should validate email format', async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // Invalid email format
    await expect(
      caller.downloads.track({
        fullName: 'Test User',
        email: 'invalid-email',
        resourceType: 'report' as const,
        resourceTitle: 'Test',
        resourceUrl: '/test.pdf',
      })
    ).rejects.toThrow();
  });
});
