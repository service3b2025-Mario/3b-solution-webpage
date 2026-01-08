import { describe, it, expect, beforeAll } from 'vitest';
import * as db from './db';
import { getCountriesByContinent, getCountriesByRegion } from '../shared/regionMapping';

describe('Option C - Hierarchical Location Filtering', () => {
  beforeAll(async () => {
    // Ensure database connection is established
    await db.getDb();
  });

  describe('Country Filtering', () => {
    it('should filter properties by country (Philippines)', async () => {
      const result = await db.getProperties({
        location: 'Philippines',
        locationType: 'country',
      });

      expect(result.items).toBeDefined();
      expect(result.total).toBeGreaterThan(0);
      
      // All returned properties should be from Philippines
      result.items.forEach((property) => {
        expect(property.country).toBe('Philippines');
      });
    });

    it('should filter properties by country (Maldives)', async () => {
      const result = await db.getProperties({
        location: 'Maldives',
        locationType: 'country',
      });

      expect(result.items).toBeDefined();
      
      // All returned properties should be from Maldives
      result.items.forEach((property) => {
        expect(property.country).toBe('Maldives');
      });
    });
  });

  describe('Region Filtering', () => {
    it('should filter properties by region (Southeast Asia)', async () => {
      const result = await db.getProperties({
        location: 'Southeast Asia',
        locationType: 'region',
      });

      expect(result.items).toBeDefined();
      
      // Get all countries in Southeast Asia
      const seaCountries = getCountriesByRegion('Southeast Asia');
      
      // All returned properties should be from Southeast Asian countries
      result.items.forEach((property) => {
        expect(seaCountries).toContain(property.country);
      });
    });

    it('should filter properties by region (Caribbean)', async () => {
      const result = await db.getProperties({
        location: 'Caribbean',
        locationType: 'region',
      });

      expect(result.items).toBeDefined();
      
      // Get all countries in Caribbean
      const caribbeanCountries = getCountriesByRegion('Caribbean');
      
      // All returned properties should be from Caribbean countries
      result.items.forEach((property) => {
        expect(caribbeanCountries).toContain(property.country);
      });
    });
  });

  describe('Continent Filtering', () => {
    it('should filter properties by continent (Asia)', async () => {
      const result = await db.getProperties({
        location: 'Asia',
        locationType: 'continent',
      });

      expect(result.items).toBeDefined();
      
      // Get all countries in Asia
      const asianCountries = getCountriesByContinent('Asia');
      
      // All returned properties should be from Asian countries
      result.items.forEach((property) => {
        expect(asianCountries).toContain(property.country);
      });
    });

    it('should filter properties by continent (Europe)', async () => {
      const result = await db.getProperties({
        location: 'Europe',
        locationType: 'continent',
      });

      expect(result.items).toBeDefined();
      
      // Get all countries in Europe
      const europeanCountries = getCountriesByContinent('Europe');
      
      // All returned properties should be from European countries
      result.items.forEach((property) => {
        expect(europeanCountries).toContain(property.country);
      });
    });

    it('should filter properties by continent (Americas)', async () => {
      const result = await db.getProperties({
        location: 'Americas',
        locationType: 'continent',
      });

      expect(result.items).toBeDefined();
      
      // Get all countries in Americas
      const americasCountries = getCountriesByContinent('Americas');
      
      // All returned properties should be from Americas countries
      result.items.forEach((property) => {
        expect(americasCountries).toContain(property.country);
      });
    });
  });

  describe('Property Counts', () => {
    it('should return hierarchical property counts', async () => {
      const counts = await db.getPropertyCountsByRegion();

      expect(counts).toBeDefined();
      expect(typeof counts).toBe('object');
      
      // Should have 'all' count
      expect(counts['all']).toBeGreaterThan(0);
      
      // Should have country counts
      expect(counts['Philippines']).toBeGreaterThan(0);
      
      // Should have region counts
      if (counts['Southeast Asia']) {
        expect(counts['Southeast Asia']).toBeGreaterThan(0);
      }
      
      // Should have continent counts
      if (counts['Asia']) {
        expect(counts['Asia']).toBeGreaterThan(0);
      }
    });

    it('should have consistent hierarchical counts (region >= country)', async () => {
      const counts = await db.getPropertyCountsByRegion();

      // Southeast Asia count should be >= Philippines count (since Philippines is in SEA)
      if (counts['Philippines'] && counts['Southeast Asia']) {
        expect(counts['Southeast Asia']).toBeGreaterThanOrEqual(counts['Philippines']);
      }
    });

    it('should have consistent hierarchical counts (continent >= region)', async () => {
      const counts = await db.getPropertyCountsByRegion();

      // Asia count should be >= Southeast Asia count
      if (counts['Southeast Asia'] && counts['Asia']) {
        expect(counts['Asia']).toBeGreaterThanOrEqual(counts['Southeast Asia']);
      }
    });
  });

  describe('Combined Filtering', () => {
    it('should filter by location and property type', async () => {
      const result = await db.getProperties({
        location: 'Philippines',
        locationType: 'country',
        propertyType: 'Hospitality',
      });

      expect(result.items).toBeDefined();
      
      // All properties should match both filters
      result.items.forEach((property) => {
        expect(property.country).toBe('Philippines');
        expect(property.propertyType).toBe('Hospitality');
      });
    });

    it('should filter by location and price range', async () => {
      const result = await db.getProperties({
        location: 'Philippines',
        locationType: 'country',
        minPrice: 1000000,
        maxPrice: 10000000,
      });

      expect(result.items).toBeDefined();
      
      // All properties should match location and be within price range
      result.items.forEach((property) => {
        expect(property.country).toBe('Philippines');
        if (property.priceMin) {
          const priceMin = parseFloat(property.priceMin.toString());
          expect(priceMin).toBeGreaterThanOrEqual(1000000);
        }
      });
    });
  });

  describe('Legacy Region Filtering (Backward Compatibility)', () => {
    it('should still support legacy region parameter', async () => {
      const result = await db.getProperties({
        region: 'Philippines',
      });

      expect(result.items).toBeDefined();
      expect(result.total).toBeGreaterThan(0);
      
      // All returned properties should be from Philippines
      result.items.forEach((property) => {
        expect(property.country).toBe('Philippines');
      });
    });

    it('should support legacy SouthEastAsia region', async () => {
      const result = await db.getProperties({
        region: 'SouthEastAsia',
      });

      expect(result.items).toBeDefined();
      
      // Should return Philippines properties (legacy behavior)
      result.items.forEach((property) => {
        expect(property.country).toBe('Philippines');
      });
    });
  });
});
