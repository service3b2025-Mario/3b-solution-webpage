-- Fix regions based on country

-- North America (USA)
UPDATE properties 
SET region = 'NorthAmerica'
WHERE country = 'United States' AND region != 'NorthAmerica';

-- Caribbean
UPDATE properties 
SET region = 'Caribbean'
WHERE country IN ('Dominican Republic', 'Bahamas', 'Jamaica', 'Cayman Islands', 'Turks and Caicos', 'Barbados', 'Saint Lucia', 'Antigua and Barbuda')
AND region != 'Caribbean';

-- Europe
UPDATE properties 
SET region = 'Europe'
WHERE country IN ('Spain', 'France', 'Italy', 'Greece', 'Portugal', 'United Kingdom', 'Germany', 'Switzerland', 'Austria', 'Netherlands', 'Belgium', 'Croatia', 'Montenegro')
AND region != 'Europe';

-- Maldives
UPDATE properties 
SET region = 'Maldives'
WHERE country = 'Maldives' AND region != 'Maldives';

-- Philippines
UPDATE properties 
SET region = 'Philippines'
WHERE country = 'Philippines' AND region != 'Philippines';

-- Show results
SELECT region, COUNT(*) as count
FROM properties
GROUP BY region
ORDER BY count DESC;
