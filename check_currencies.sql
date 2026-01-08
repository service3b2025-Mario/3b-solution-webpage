SELECT DISTINCT currency, COUNT(*) as count 
FROM properties 
GROUP BY currency 
ORDER BY count DESC;
