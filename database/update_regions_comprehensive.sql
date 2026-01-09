-- Step 1: Add new SubRegion values to the ENUM
-- We need to add values that don't exist yet

ALTER TYPE region_enum ADD VALUE IF NOT EXISTS 'Southeast Asia';
ALTER TYPE region_enum ADD VALUE IF NOT EXISTS 'South Asia';
ALTER TYPE region_enum ADD VALUE IF NOT EXISTS 'East Asia';
ALTER TYPE region_enum ADD VALUE IF NOT EXISTS 'Central Asia';
ALTER TYPE region_enum ADD VALUE IF NOT EXISTS 'Western Asia';
ALTER TYPE region_enum ADD VALUE IF NOT EXISTS 'Northern America';
ALTER TYPE region_enum ADD VALUE IF NOT EXISTS 'Central America';
ALTER TYPE region_enum ADD VALUE IF NOT EXISTS 'Northern Europe';
ALTER TYPE region_enum ADD VALUE IF NOT EXISTS 'Western Europe';
ALTER TYPE region_enum ADD VALUE IF NOT EXISTS 'Southern Europe';
ALTER TYPE region_enum ADD VALUE IF NOT EXISTS 'Eastern Europe';
ALTER TYPE region_enum ADD VALUE IF NOT EXISTS 'Australia & New Zealand';
ALTER TYPE region_enum ADD VALUE IF NOT EXISTS 'Melanesia';
ALTER TYPE region_enum ADD VALUE IF NOT EXISTS 'Micronesia';
ALTER TYPE region_enum ADD VALUE IF NOT EXISTS 'Polynesia';
ALTER TYPE region_enum ADD VALUE IF NOT EXISTS 'North Africa';
ALTER TYPE region_enum ADD VALUE IF NOT EXISTS 'West Africa';
ALTER TYPE region_enum ADD VALUE IF NOT EXISTS 'Central Africa';
ALTER TYPE region_enum ADD VALUE IF NOT EXISTS 'East Africa';
ALTER TYPE region_enum ADD VALUE IF NOT EXISTS 'Southern Africa';

-- Step 2: Update properties based on country
-- Philippines → Southeast Asia, Asia
UPDATE properties 
SET region = 'Southeast Asia', continent = 'Asia'
WHERE country = 'Philippines';

-- Maldives → South Asia, Asia
UPDATE properties 
SET region = 'South Asia', continent = 'Asia'
WHERE country = 'Maldives';

-- United States → Northern America, North America
UPDATE properties 
SET region = 'Northern America', continent = 'North America'
WHERE country = 'United States';

-- Dominican Republic → Caribbean, North America
UPDATE properties 
SET region = 'Caribbean', continent = 'North America'
WHERE country = 'Dominican Republic';

-- Add more country mappings as needed
-- Thailand → Southeast Asia, Asia
UPDATE properties 
SET region = 'Southeast Asia', continent = 'Asia'
WHERE country = 'Thailand';

-- Indonesia → Southeast Asia, Asia
UPDATE properties 
SET region = 'Southeast Asia', continent = 'Asia'
WHERE country = 'Indonesia';

-- Malaysia → Southeast Asia, Asia
UPDATE properties 
SET region = 'Southeast Asia', continent = 'Asia'
WHERE country = 'Malaysia';

-- Singapore → Southeast Asia, Asia
UPDATE properties 
SET region = 'Southeast Asia', continent = 'Asia'
WHERE country = 'Singapore';

-- Vietnam → Southeast Asia, Asia
UPDATE properties 
SET region = 'Southeast Asia', continent = 'Asia'
WHERE country = 'Vietnam';

-- Show results
SELECT continent as MainRegion, region as SubRegion, country, COUNT(*) as property_count
FROM properties
GROUP BY continent, region, country
ORDER BY continent, region, country;
