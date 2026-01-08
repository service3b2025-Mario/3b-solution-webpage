# Database Regional Filtering Best Practices

## Current Schema Analysis

### Existing Structure (Line 28-30 in schema.ts)
```typescript
region: mysqlEnum("region", ["Philippines", "SouthEastAsia", "Maldives", "Europe", "NorthAmerica", "Caribbean"]).notNull(),
country: varchar("country", { length: 100 }).notNull(),
city: varchar("city", { length: 100 }),
```

### Issues with Current Structure

1. **Inconsistent Granularity**: Mixing country-level (Philippines, Maldives) with region-level (SouthEastAsia, Europe, Caribbean) entries
2. **Limited Scalability**: Enum restricts adding new regions without schema migration
3. **Filtering Complexity**: Cannot easily filter "all Southeast Asian properties" when Philippines is separate from SouthEastAsia
4. **Redundancy**: Philippines appears both as a region enum value AND as a country within SouthEastAsia

## Recommended Best Practice Structure

### Option 1: Hierarchical Three-Field Approach (RECOMMENDED)

```typescript
// Add these fields to properties table
continent: varchar("continent", { length: 50 }), // e.g., "Asia", "Europe", "Americas"
region: varchar("region", { length: 100 }).notNull(), // e.g., "Southeast Asia", "South Asia", "Caribbean"
country: varchar("country", { length: 100 }).notNull(), // e.g., "Philippines", "Maldives", "Jamaica"
city: varchar("city", { length: 100 }),
```

**Benefits:**
- Clear hierarchy: Continent → Region → Country → City
- Flexible: No enum restrictions, easy to add new locations
- Accurate filtering: Can filter by any level (all Asia, all Southeast Asia, or just Philippines)
- Consistent: Every property has the same structure

**Example Data:**
```typescript
{
  continent: "Asia",
  region: "Southeast Asia",
  country: "Philippines",
  city: "Manila"
}

{
  continent: "Asia",
  region: "South Asia",
  country: "Maldives",
  city: "Malé"
}

{
  continent: "Americas",
  region: "Caribbean",
  country: "Jamaica",
  city: "Montego Bay"
}
```

### Option 2: Region with Country Code (Alternative)

```typescript
region: varchar("region", { length: 100 }).notNull(), // "Southeast Asia"
countryCode: varchar("countryCode", { length: 2 }).notNull(), // "PH", "MV", "JM"
country: varchar("country", { length: 100 }).notNull(), // "Philippines"
city: varchar("city", { length: 100 }),
```

**Benefits:**
- ISO country codes enable integration with external APIs
- Standardized country identification
- Still maintains regional hierarchy

## Migration Strategy

### Step 1: Add New Fields (Non-Breaking)

```sql
ALTER TABLE properties 
ADD COLUMN continent VARCHAR(50),
ADD COLUMN regionNew VARCHAR(100);
```

### Step 2: Data Migration Script

```typescript
// Map existing region enum to new structure
const regionMapping = {
  "Philippines": { continent: "Asia", region: "Southeast Asia", country: "Philippines" },
  "SouthEastAsia": { continent: "Asia", region: "Southeast Asia", country: null }, // Needs manual review
  "Maldives": { continent: "Asia", region: "South Asia", country: "Maldives" },
  "Europe": { continent: "Europe", region: null, country: null }, // Needs manual review
  "NorthAmerica": { continent: "Americas", region: "North America", country: null },
  "Caribbean": { continent: "Americas", region: "Caribbean", country: null }
};

// Update existing records
for each property {
  const mapping = regionMapping[property.region];
  UPDATE properties SET 
    continent = mapping.continent,
    regionNew = mapping.region || determineFromCountry(property.country)
  WHERE id = property.id;
}
```

### Step 3: Update Application Code

```typescript
// Update tRPC queries
properties.list.useQuery({
  region: "Southeast Asia", // Now filters correctly for all SEA countries
  country: "Philippines",   // Optional: further filter to specific country
});

// Update landing pages
// /investments/southeast-asia → region: "Southeast Asia"
// /investments/philippines → region: "Southeast Asia", country: "Philippines"
// /investments/maldives → region: "South Asia", country: "Maldives"
```

### Step 4: Remove Old Enum (Breaking Change)

```sql
-- After verifying all data is migrated
ALTER TABLE properties 
DROP COLUMN region,
RENAME COLUMN regionNew TO region;
```

## Filtering Implementation

### Backend (tRPC Router)

```typescript
// server/routers.ts
list: publicProcedure
  .input(z.object({
    continent: z.string().optional(),
    region: z.string().optional(),
    country: z.string().optional(),
    city: z.string().optional(),
    // ... other filters
  }))
  .query(async ({ input }) => {
    const conditions = [];
    
    if (input.continent) conditions.push(eq(properties.continent, input.continent));
    if (input.region) conditions.push(eq(properties.region, input.region));
    if (input.country) conditions.push(eq(properties.country, input.country));
    if (input.city) conditions.push(eq(properties.city, input.city));
    
    const results = await db.select()
      .from(properties)
      .where(and(...conditions));
      
    return { items: results, total: results.length };
  }),
```

### Frontend (Landing Pages)

```typescript
// Southeast Asia landing page
const { data } = trpc.properties.list.useQuery({
  region: "Southeast Asia",
  limit: 6,
});

// Philippines specific page
const { data } = trpc.properties.list.useQuery({
  region: "Southeast Asia",
  country: "Philippines",
  limit: 6,
});

// All Asia properties
const { data } = trpc.properties.list.useQuery({
  continent: "Asia",
  limit: 6,
});
```

### URL Parameter Mapping

```typescript
// Properties page URL structure
/properties?region=Southeast+Asia
/properties?region=Southeast+Asia&country=Philippines
/properties?continent=Asia
/properties?country=Maldives // Auto-determines region from mapping

// Landing page links
<Link href="/properties?region=Southeast Asia">View All Southeast Asia Properties</Link>
<Link href="/properties?region=Southeast Asia&country=Philippines">View All Philippines Properties</Link>
```

## Data Validation

### Add Validation Helper

```typescript
// shared/regionValidation.ts
import { REGIONAL_MAPPING } from './regionalMapping';

export function validateRegionalData(continent: string, region: string, country: string) {
  // Check if country belongs to specified region
  const mapping = REGIONAL_MAPPING[region];
  if (!mapping?.countries.includes(country)) {
    throw new Error(`Country ${country} does not belong to region ${region}`);
  }
  
  // Check if region belongs to continent
  if (mapping.continent !== continent) {
    throw new Error(`Region ${region} does not belong to continent ${continent}`);
  }
  
  return true;
}
```

### Regional Mapping Constant

```typescript
// shared/regionalMapping.ts
export const REGIONAL_MAPPING = {
  "Southeast Asia": {
    continent: "Asia",
    countries: ["Brunei", "Cambodia", "Indonesia", "Laos", "Malaysia", "Myanmar", 
                "Philippines", "Singapore", "Thailand", "Timor-Leste", "Vietnam"]
  },
  "South Asia": {
    continent: "Asia",
    countries: ["Afghanistan", "Bangladesh", "Bhutan", "India", "Maldives", 
                "Nepal", "Pakistan", "Sri Lanka"]
  },
  "Caribbean": {
    continent: "Americas",
    countries: ["Jamaica", "Dominican Republic", "Bahamas"]
  },
  // ... add all regions from knowledge base
};
```

## Search and Filter UI

### Cascading Dropdowns (Recommended)

```typescript
// Properties page filters
<Select value={continent} onChange={handleContinentChange}>
  <option value="">All Continents</option>
  <option value="Asia">Asia</option>
  <option value="Europe">Europe</option>
  <option value="Americas">Americas</option>
</Select>

<Select value={region} onChange={handleRegionChange} disabled={!continent}>
  <option value="">All Regions</option>
  {getRegionsForContinent(continent).map(r => (
    <option value={r}>{r}</option>
  ))}
</Select>

<Select value={country} onChange={handleCountryChange} disabled={!region}>
  <option value="">All Countries</option>
  {getCountriesForRegion(region).map(c => (
    <option value={c}>{c}</option>
  ))}
</Select>
```

## Performance Optimization

### Database Indexes

```sql
-- Add indexes for common filter combinations
CREATE INDEX idx_properties_region ON properties(region);
CREATE INDEX idx_properties_country ON properties(country);
CREATE INDEX idx_properties_region_country ON properties(region, country);
CREATE INDEX idx_properties_continent ON properties(continent);
```

### Caching Strategy

```typescript
// Cache regional property counts
const regionalCounts = await redis.get('property_counts_by_region');
if (!regionalCounts) {
  const counts = await db.select({
    region: properties.region,
    count: sql<number>`count(*)`,
  })
  .from(properties)
  .groupBy(properties.region);
  
  await redis.set('property_counts_by_region', JSON.stringify(counts), 'EX', 3600);
}
```

## Summary

**Immediate Action Items:**

1. ✅ **Add `continent` field** to properties table (VARCHAR 50)
2. ✅ **Change `region` from enum to VARCHAR(100)** for flexibility
3. ✅ **Keep `country` field** as VARCHAR(100)
4. ✅ **Create regional mapping constant** based on knowledge base
5. ✅ **Update all tRPC queries** to use new field structure
6. ✅ **Migrate existing data** using mapping script
7. ✅ **Update landing page filters** to use hierarchical structure
8. ✅ **Add database indexes** for performance

**Long-term Benefits:**

- Accurate multi-level filtering (continent → region → country)
- Easy addition of new countries/regions without schema changes
- Consistent data structure across all properties
- Better SEO with region-specific URLs
- Improved user experience with cascading filters
- Scalable for future expansion into new markets
