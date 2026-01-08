import { describe, it, expect, beforeAll } from 'vitest';
import { getDb } from './db';
import { legalPages } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

describe('Legal Pages', () => {
  beforeAll(async () => {
    // Ensure database connection is available
    const db = await getDb();
    expect(db).not.toBeNull();
  });

  it('should have legal_pages table in database', async () => {
    const db = await getDb();
    expect(db).not.toBeNull();
    
    // Query the legal pages table
    const pages = await db!.select().from(legalPages);
    expect(Array.isArray(pages)).toBe(true);
  });

  it('should have Terms of Service page', async () => {
    const db = await getDb();
    expect(db).not.toBeNull();
    
    const result = await db!.select().from(legalPages).where(eq(legalPages.slug, 'terms-of-service'));
    expect(result.length).toBe(1);
    expect(result[0].title).toBe('Terms of Service');
    expect(result[0].isActive).toBe(true);
  });

  it('should have Privacy Policy page', async () => {
    const db = await getDb();
    expect(db).not.toBeNull();
    
    const result = await db!.select().from(legalPages).where(eq(legalPages.slug, 'privacy'));
    expect(result.length).toBe(1);
    expect(result[0].title).toBe('Privacy Policy');
    expect(result[0].isActive).toBe(true);
  });

  it('should have Imprint page', async () => {
    const db = await getDb();
    expect(db).not.toBeNull();
    
    const result = await db!.select().from(legalPages).where(eq(legalPages.slug, 'imprint'));
    expect(result.length).toBe(1);
    expect(result[0].title).toBe('Imprint');
    expect(result[0].isActive).toBe(true);
  });

  it('should have content for all legal pages', async () => {
    const db = await getDb();
    expect(db).not.toBeNull();
    
    const pages = await db!.select().from(legalPages);
    
    for (const page of pages) {
      expect(page.content).toBeTruthy();
      expect(page.content!.length).toBeGreaterThan(100);
    }
  });

  it('should have correct order for legal pages', async () => {
    const db = await getDb();
    expect(db).not.toBeNull();
    
    const pages = await db!.select().from(legalPages);
    
    const termsPage = pages.find(p => p.slug === 'terms-of-service');
    const privacyPage = pages.find(p => p.slug === 'privacy');
    const imprintPage = pages.find(p => p.slug === 'imprint');
    
    expect(termsPage?.order).toBe(1);
    expect(privacyPage?.order).toBe(2);
    expect(imprintPage?.order).toBe(3);
  });
});
