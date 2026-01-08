// Country-level coordinates for off-market properties
// These represent approximate center points of each country for privacy
export const countryCoordinates: Record<string, { lat: number; lng: number }> = {
  // Southeast Asia
  "Philippines": { lat: 12.8797, lng: 121.7740 },
  "Thailand": { lat: 15.8700, lng: 100.9925 },
  "Vietnam": { lat: 14.0583, lng: 108.2772 },
  "Indonesia": { lat: -0.7893, lng: 113.9213 },
  "Malaysia": { lat: 4.2105, lng: 101.9758 },
  "Singapore": { lat: 1.3521, lng: 103.8198 },
  "Cambodia": { lat: 12.5657, lng: 104.9910 },
  "Laos": { lat: 19.8563, lng: 102.4955 },
  "Myanmar": { lat: 21.9162, lng: 95.9560 },
  "Brunei": { lat: 4.5353, lng: 114.7277 },
  
  // Maldives
  "Maldives": { lat: 3.2028, lng: 73.2207 },
  
  // Middle East
  "United Arab Emirates": { lat: 23.4241, lng: 53.8478 },
  "UAE": { lat: 23.4241, lng: 53.8478 },
  "Saudi Arabia": { lat: 23.8859, lng: 45.0792 },
  "Qatar": { lat: 25.3548, lng: 51.1839 },
  "Bahrain": { lat: 26.0667, lng: 50.5577 },
  "Oman": { lat: 21.4735, lng: 55.9754 },
  "Kuwait": { lat: 29.3117, lng: 47.4818 },
  "Jordan": { lat: 30.5852, lng: 36.2384 },
  "Lebanon": { lat: 33.8547, lng: 35.8623 },
  "Israel": { lat: 31.0461, lng: 34.8516 },
  "Turkey": { lat: 38.9637, lng: 35.2433 },
  
  // Europe
  "Spain": { lat: 40.4637, lng: -3.7492 },
  "France": { lat: 46.2276, lng: 2.2137 },
  "Italy": { lat: 41.8719, lng: 12.5674 },
  "Germany": { lat: 51.1657, lng: 10.4515 },
  "United Kingdom": { lat: 55.3781, lng: -3.4360 },
  "UK": { lat: 55.3781, lng: -3.4360 },
  "Portugal": { lat: 39.3999, lng: -8.2245 },
  "Greece": { lat: 39.0742, lng: 21.8243 },
  "Switzerland": { lat: 46.8182, lng: 8.2275 },
  "Austria": { lat: 47.5162, lng: 14.5501 },
  "Netherlands": { lat: 52.1326, lng: 5.2913 },
  "Belgium": { lat: 50.5039, lng: 4.4699 },
  "Sweden": { lat: 60.1282, lng: 18.6435 },
  "Norway": { lat: 60.4720, lng: 8.4689 },
  "Denmark": { lat: 56.2639, lng: 9.5018 },
  "Finland": { lat: 61.9241, lng: 25.7482 },
  "Poland": { lat: 51.9194, lng: 19.1451 },
  "Czech Republic": { lat: 49.8175, lng: 15.4730 },
  "Croatia": { lat: 45.1, lng: 15.2 },
  "Ireland": { lat: 53.4129, lng: -8.2439 },
  "Iceland": { lat: 64.9631, lng: -19.0208 },
  
  // North America
  "United States": { lat: 37.0902, lng: -95.7129 },
  "USA": { lat: 37.0902, lng: -95.7129 },
  "Canada": { lat: 56.1304, lng: -106.3468 },
  "Mexico": { lat: 23.6345, lng: -102.5528 },
  
  // Caribbean
  "Jamaica": { lat: 18.1096, lng: -77.2975 },
  "Bahamas": { lat: 25.0343, lng: -77.3963 },
  "Barbados": { lat: 13.1939, lng: -59.5432 },
  "Trinidad and Tobago": { lat: 10.6918, lng: -61.2225 },
  "Cayman Islands": { lat: 19.3133, lng: -81.2546 },
  "Turks and Caicos": { lat: 21.6940, lng: -71.7979 },
  "Aruba": { lat: 12.5211, lng: -69.9683 },
  "Dominican Republic": { lat: 18.7357, lng: -70.1627 },
  "Cuba": { lat: 21.5218, lng: -77.7812 },
  "Puerto Rico": { lat: 18.2208, lng: -66.5901 },
  
  // South America
  "Brazil": { lat: -14.2350, lng: -51.9253 },
  "Argentina": { lat: -38.4161, lng: -63.6167 },
  "Chile": { lat: -35.6751, lng: -71.5430 },
  "Colombia": { lat: 4.5709, lng: -74.2973 },
  "Peru": { lat: -9.1900, lng: -75.0152 },
  "Venezuela": { lat: 6.4238, lng: -66.5897 },
  "Ecuador": { lat: -1.8312, lng: -78.1834 },
  "Uruguay": { lat: -32.5228, lng: -55.7658 },
  "Paraguay": { lat: -23.4425, lng: -58.4438 },
  "Bolivia": { lat: -16.2902, lng: -63.5887 },
  
  // Asia Pacific
  "Australia": { lat: -25.2744, lng: 133.7751 },
  "New Zealand": { lat: -40.9006, lng: 174.8860 },
  "Japan": { lat: 36.2048, lng: 138.2529 },
  "South Korea": { lat: 35.9078, lng: 127.7669 },
  "China": { lat: 35.8617, lng: 104.1954 },
  "India": { lat: 20.5937, lng: 78.9629 },
  "Sri Lanka": { lat: 7.8731, lng: 80.7718 },
  "Nepal": { lat: 28.3949, lng: 84.1240 },
  "Bhutan": { lat: 27.5142, lng: 90.4336 },
  "Bangladesh": { lat: 23.6850, lng: 90.3563 },
  "Pakistan": { lat: 30.3753, lng: 69.3451 },
  
  // Africa
  "South Africa": { lat: -30.5595, lng: 22.9375 },
  "Egypt": { lat: 26.8206, lng: 30.8025 },
  "Morocco": { lat: 31.7917, lng: -7.0926 },
  "Kenya": { lat: -0.0236, lng: 37.9062 },
  "Tanzania": { lat: -6.3690, lng: 34.8888 },
  "Nigeria": { lat: 9.0820, lng: 8.6753 },
  "Ghana": { lat: 7.9465, lng: -1.0232 },
  "Mauritius": { lat: -20.3484, lng: 57.5522 },
  "Seychelles": { lat: -4.6796, lng: 55.4920 },
  "Madagascar": { lat: -18.7669, lng: 46.8691 },
};

/**
 * Get country-level coordinates for a given country name
 * Falls back to a default location if country not found
 */
export function getCountryCoordinates(country: string): { lat: number; lng: number } {
  const coords = countryCoordinates[country];
  if (coords) {
    return coords;
  }
  
  // Try case-insensitive match
  const normalizedCountry = country.toLowerCase();
  for (const [key, value] of Object.entries(countryCoordinates)) {
    if (key.toLowerCase() === normalizedCountry) {
      return value;
    }
  }
  
  // Default fallback to global center
  console.warn(`Country coordinates not found for: ${country}, using default`);
  return { lat: 20, lng: 0 };
}
