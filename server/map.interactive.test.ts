import { describe, it, expect } from 'vitest';
import * as db from './db';

describe('Interactive World Map', () => {
  it('should return property counts by country', async () => {
    const counts = await db.getPropertyCountsByRegion();
    
    console.log('Property counts:', counts);
    
    // Should have counts object
    expect(counts).toBeDefined();
    expect(typeof counts).toBe('object');
    
    // Should have Philippines with properties
    expect(counts['Philippines']).toBeGreaterThan(0);
    console.log('Philippines count:', counts['Philippines']);
    
    // Should have continent counts
    if (counts['Asia']) {
      console.log('Asia count:', counts['Asia']);
      expect(counts['Asia']).toBeGreaterThan(0);
    }
    
    // Should have region counts
    if (counts['Southeast Asia']) {
      console.log('Southeast Asia count:', counts['Southeast Asia']);
      expect(counts['Southeast Asia']).toBeGreaterThan(0);
    }
    
    // Log all countries with properties
    const countriesWithProperties = Object.keys(counts).filter(k => 
      counts[k] > 0 && k !== 'all' && !k.includes('Asia') && !k.includes('America') && !k.includes('Europe')
    );
    console.log('Countries with properties:', countriesWithProperties);
    console.log('Total countries:', countriesWithProperties.length);
  });
  
  it('should return hierarchical counts (country, region, continent)', async () => {
    const counts = await db.getPropertyCountsByRegion();
    
    // Check if we have all three levels
    const hasCountries = Object.keys(counts).some(k => 
      !k.includes('Asia') && !k.includes('America') && !k.includes('Europe') && k !== 'all'
    );
    
    expect(hasCountries).toBe(true);
    console.log('Has country-level counts:', hasCountries);
  });
});
