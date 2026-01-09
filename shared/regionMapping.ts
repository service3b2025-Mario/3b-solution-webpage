// Continent and Region Mapping for Property Filtering
// Based on REGIONAL_MAPPING_KNOWLEDGE_BASE.md

export const CONTINENTS = {
  ASIA: "Asia",
  EUROPE: "Europe",
  AMERICAS: "Americas",
  MIDDLE_EAST: "Middle East",
  OCEANIA: "Oceania",
  AFRICA: "Africa",
} as const;

export const REGIONS = {
  // Asia
  SOUTHEAST_ASIA: "Southeast Asia",
  SOUTH_ASIA: "South Asia",
  EAST_ASIA: "East Asia",
  
  // Europe
  SOUTHERN_EUROPE: "Southern Europe",
  WESTERN_EUROPE: "Western Europe",
  NORTHERN_EUROPE: "Northern Europe",
  EASTERN_EUROPE: "Eastern Europe",
  
  // Americas
  NORTH_AMERICA: "North America",
  CARIBBEAN: "Caribbean",
  CENTRAL_AMERICA: "Central America",
  SOUTH_AMERICA: "South America",
  
  // Middle East
  MIDDLE_EAST: "Middle East",
  
  // Oceania
  OCEANIA: "Oceania",
  
  // Africa
  AFRICA: "Africa",
} as const;

// Country to Continent/Region mapping
export const COUNTRY_MAPPING: Record<string, { continent: string; region: string; flag: string }> = {
  // Southeast Asia
  "Philippines": { continent: CONTINENTS.ASIA, region: REGIONS.SOUTHEAST_ASIA, flag: "🇵🇭" },
  "Thailand": { continent: CONTINENTS.ASIA, region: REGIONS.SOUTHEAST_ASIA, flag: "🇹🇭" },
  "Vietnam": { continent: CONTINENTS.ASIA, region: REGIONS.SOUTHEAST_ASIA, flag: "🇻🇳" },
  "Indonesia": { continent: CONTINENTS.ASIA, region: REGIONS.SOUTHEAST_ASIA, flag: "🇮🇩" },
  "Singapore": { continent: CONTINENTS.ASIA, region: REGIONS.SOUTHEAST_ASIA, flag: "🇸🇬" },
  "Malaysia": { continent: CONTINENTS.ASIA, region: REGIONS.SOUTHEAST_ASIA, flag: "🇲🇾" },
  "Myanmar": { continent: CONTINENTS.ASIA, region: REGIONS.SOUTHEAST_ASIA, flag: "🇲🇲" },
  "Cambodia": { continent: CONTINENTS.ASIA, region: REGIONS.SOUTHEAST_ASIA, flag: "🇰🇭" },
  "Laos": { continent: CONTINENTS.ASIA, region: REGIONS.SOUTHEAST_ASIA, flag: "🇱🇦" },
  "Brunei": { continent: CONTINENTS.ASIA, region: REGIONS.SOUTHEAST_ASIA, flag: "🇧🇳" },
  
  // South Asia
  "Maldives": { continent: CONTINENTS.ASIA, region: REGIONS.SOUTH_ASIA, flag: "🇲🇻" },
  "India": { continent: CONTINENTS.ASIA, region: REGIONS.SOUTH_ASIA, flag: "🇮🇳" },
  "Sri Lanka": { continent: CONTINENTS.ASIA, region: REGIONS.SOUTH_ASIA, flag: "🇱🇰" },
  "Bangladesh": { continent: CONTINENTS.ASIA, region: REGIONS.SOUTH_ASIA, flag: "🇧🇩" },
  "Pakistan": { continent: CONTINENTS.ASIA, region: REGIONS.SOUTH_ASIA, flag: "🇵🇰" },
  "Nepal": { continent: CONTINENTS.ASIA, region: REGIONS.SOUTH_ASIA, flag: "🇳🇵" },
  "Bhutan": { continent: CONTINENTS.ASIA, region: REGIONS.SOUTH_ASIA, flag: "🇧🇹" },
  
  // East Asia
  "China": { continent: CONTINENTS.ASIA, region: REGIONS.EAST_ASIA, flag: "🇨🇳" },
  "Japan": { continent: CONTINENTS.ASIA, region: REGIONS.EAST_ASIA, flag: "🇯🇵" },
  "South Korea": { continent: CONTINENTS.ASIA, region: REGIONS.EAST_ASIA, flag: "🇰🇷" },
  "Taiwan": { continent: CONTINENTS.ASIA, region: REGIONS.EAST_ASIA, flag: "🇹🇼" },
  "Hong Kong": { continent: CONTINENTS.ASIA, region: REGIONS.EAST_ASIA, flag: "🇭🇰" },
  "Macau": { continent: CONTINENTS.ASIA, region: REGIONS.EAST_ASIA, flag: "🇲🇴" },
  "Mongolia": { continent: CONTINENTS.ASIA, region: REGIONS.EAST_ASIA, flag: "🇲🇳" },
  
  // Southern Europe
  "Italy": { continent: CONTINENTS.EUROPE, region: REGIONS.SOUTHERN_EUROPE, flag: "🇮🇹" },
  "Spain": { continent: CONTINENTS.EUROPE, region: REGIONS.SOUTHERN_EUROPE, flag: "🇪🇸" },
  "Greece": { continent: CONTINENTS.EUROPE, region: REGIONS.SOUTHERN_EUROPE, flag: "🇬🇷" },
  "Portugal": { continent: CONTINENTS.EUROPE, region: REGIONS.SOUTHERN_EUROPE, flag: "🇵🇹" },
  "Croatia": { continent: CONTINENTS.EUROPE, region: REGIONS.SOUTHERN_EUROPE, flag: "🇭🇷" },
  "Malta": { continent: CONTINENTS.EUROPE, region: REGIONS.SOUTHERN_EUROPE, flag: "🇲🇹" },
  "Cyprus": { continent: CONTINENTS.EUROPE, region: REGIONS.SOUTHERN_EUROPE, flag: "🇨🇾" },
  "Slovenia": { continent: CONTINENTS.EUROPE, region: REGIONS.SOUTHERN_EUROPE, flag: "🇸🇮" },
  
  // Western Europe
  "Germany": { continent: CONTINENTS.EUROPE, region: REGIONS.WESTERN_EUROPE, flag: "🇩🇪" },
  "France": { continent: CONTINENTS.EUROPE, region: REGIONS.WESTERN_EUROPE, flag: "🇫🇷" },
  "Switzerland": { continent: CONTINENTS.EUROPE, region: REGIONS.WESTERN_EUROPE, flag: "🇨🇭" },
  "Austria": { continent: CONTINENTS.EUROPE, region: REGIONS.WESTERN_EUROPE, flag: "🇦🇹" },
  "Belgium": { continent: CONTINENTS.EUROPE, region: REGIONS.WESTERN_EUROPE, flag: "🇧🇪" },
  "Netherlands": { continent: CONTINENTS.EUROPE, region: REGIONS.WESTERN_EUROPE, flag: "🇳🇱" },
  "Luxembourg": { continent: CONTINENTS.EUROPE, region: REGIONS.WESTERN_EUROPE, flag: "🇱🇺" },
  "Monaco": { continent: CONTINENTS.EUROPE, region: REGIONS.WESTERN_EUROPE, flag: "🇲🇨" },
  
  // Northern Europe
  "United Kingdom": { continent: CONTINENTS.EUROPE, region: REGIONS.NORTHERN_EUROPE, flag: "🇬🇧" },
  "Sweden": { continent: CONTINENTS.EUROPE, region: REGIONS.NORTHERN_EUROPE, flag: "🇸🇪" },
  "Norway": { continent: CONTINENTS.EUROPE, region: REGIONS.NORTHERN_EUROPE, flag: "🇳🇴" },
  "Denmark": { continent: CONTINENTS.EUROPE, region: REGIONS.NORTHERN_EUROPE, flag: "🇩🇰" },
  "Finland": { continent: CONTINENTS.EUROPE, region: REGIONS.NORTHERN_EUROPE, flag: "🇫🇮" },
  "Iceland": { continent: CONTINENTS.EUROPE, region: REGIONS.NORTHERN_EUROPE, flag: "🇮🇸" },
  "Ireland": { continent: CONTINENTS.EUROPE, region: REGIONS.NORTHERN_EUROPE, flag: "🇮🇪" },
  
  // Eastern Europe
  "Poland": { continent: CONTINENTS.EUROPE, region: REGIONS.EASTERN_EUROPE, flag: "🇵🇱" },
  "Czech Republic": { continent: CONTINENTS.EUROPE, region: REGIONS.EASTERN_EUROPE, flag: "🇨🇿" },
  "Hungary": { continent: CONTINENTS.EUROPE, region: REGIONS.EASTERN_EUROPE, flag: "🇭🇺" },
  "Romania": { continent: CONTINENTS.EUROPE, region: REGIONS.EASTERN_EUROPE, flag: "🇷🇴" },
  "Bulgaria": { continent: CONTINENTS.EUROPE, region: REGIONS.EASTERN_EUROPE, flag: "🇧🇬" },
  "Slovakia": { continent: CONTINENTS.EUROPE, region: REGIONS.EASTERN_EUROPE, flag: "🇸🇰" },
  
  // North America
  "United States": { continent: CONTINENTS.AMERICAS, region: REGIONS.NORTH_AMERICA, flag: "🇺🇸" },
  "Canada": { continent: CONTINENTS.AMERICAS, region: REGIONS.NORTH_AMERICA, flag: "🇨🇦" },
  "Mexico": { continent: CONTINENTS.AMERICAS, region: REGIONS.NORTH_AMERICA, flag: "🇲🇽" },
  
  // Caribbean
  "Jamaica": { continent: CONTINENTS.AMERICAS, region: REGIONS.CARIBBEAN, flag: "🇯🇲" },
  "Dominican Republic": { continent: CONTINENTS.AMERICAS, region: REGIONS.CARIBBEAN, flag: "🇩🇴" },
  "Bahamas": { continent: CONTINENTS.AMERICAS, region: REGIONS.CARIBBEAN, flag: "🇧🇸" },
  "Barbados": { continent: CONTINENTS.AMERICAS, region: REGIONS.CARIBBEAN, flag: "🇧🇧" },
  "Trinidad and Tobago": { continent: CONTINENTS.AMERICAS, region: REGIONS.CARIBBEAN, flag: "🇹🇹" },
  "Cayman Islands": { continent: CONTINENTS.AMERICAS, region: REGIONS.CARIBBEAN, flag: "🇰🇾" },
  "Turks and Caicos": { continent: CONTINENTS.AMERICAS, region: REGIONS.CARIBBEAN, flag: "🇹🇨" },
  "Aruba": { continent: CONTINENTS.AMERICAS, region: REGIONS.CARIBBEAN, flag: "🇦🇼" },
  "Saint Lucia": { continent: CONTINENTS.AMERICAS, region: REGIONS.CARIBBEAN, flag: "🇱🇨" },
  
  // Central America
  "Costa Rica": { continent: CONTINENTS.AMERICAS, region: REGIONS.CENTRAL_AMERICA, flag: "🇨🇷" },
  "Panama": { continent: CONTINENTS.AMERICAS, region: REGIONS.CENTRAL_AMERICA, flag: "🇵🇦" },
  "Belize": { continent: CONTINENTS.AMERICAS, region: REGIONS.CENTRAL_AMERICA, flag: "🇧🇿" },
  "Guatemala": { continent: CONTINENTS.AMERICAS, region: REGIONS.CENTRAL_AMERICA, flag: "🇬🇹" },
  
  // South America
  "Brazil": { continent: CONTINENTS.AMERICAS, region: REGIONS.SOUTH_AMERICA, flag: "🇧🇷" },
  "Argentina": { continent: CONTINENTS.AMERICAS, region: REGIONS.SOUTH_AMERICA, flag: "🇦🇷" },
  "Chile": { continent: CONTINENTS.AMERICAS, region: REGIONS.SOUTH_AMERICA, flag: "🇨🇱" },
  "Colombia": { continent: CONTINENTS.AMERICAS, region: REGIONS.SOUTH_AMERICA, flag: "🇨🇴" },
  "Peru": { continent: CONTINENTS.AMERICAS, region: REGIONS.SOUTH_AMERICA, flag: "🇵🇪" },
  "Uruguay": { continent: CONTINENTS.AMERICAS, region: REGIONS.SOUTH_AMERICA, flag: "🇺🇾" },
  "Ecuador": { continent: CONTINENTS.AMERICAS, region: REGIONS.SOUTH_AMERICA, flag: "🇪🇨" },
  
  // Middle East
  "United Arab Emirates": { continent: CONTINENTS.MIDDLE_EAST, region: REGIONS.MIDDLE_EAST, flag: "🇦🇪" },
  "Saudi Arabia": { continent: CONTINENTS.MIDDLE_EAST, region: REGIONS.MIDDLE_EAST, flag: "🇸🇦" },
  "Qatar": { continent: CONTINENTS.MIDDLE_EAST, region: REGIONS.MIDDLE_EAST, flag: "🇶🇦" },
  "Turkey": { continent: CONTINENTS.MIDDLE_EAST, region: REGIONS.MIDDLE_EAST, flag: "🇹🇷" },
  "Israel": { continent: CONTINENTS.MIDDLE_EAST, region: REGIONS.MIDDLE_EAST, flag: "🇮🇱" },
  "Jordan": { continent: CONTINENTS.MIDDLE_EAST, region: REGIONS.MIDDLE_EAST, flag: "🇯🇴" },
  "Lebanon": { continent: CONTINENTS.MIDDLE_EAST, region: REGIONS.MIDDLE_EAST, flag: "🇱🇧" },
  "Oman": { continent: CONTINENTS.MIDDLE_EAST, region: REGIONS.MIDDLE_EAST, flag: "🇴🇲" },
  "Kuwait": { continent: CONTINENTS.MIDDLE_EAST, region: REGIONS.MIDDLE_EAST, flag: "🇰🇼" },
  "Bahrain": { continent: CONTINENTS.MIDDLE_EAST, region: REGIONS.MIDDLE_EAST, flag: "🇧🇭" },
  
  // Oceania
  "Australia": { continent: CONTINENTS.OCEANIA, region: REGIONS.OCEANIA, flag: "🇦🇺" },
  "New Zealand": { continent: CONTINENTS.OCEANIA, region: REGIONS.OCEANIA, flag: "🇳🇿" },
  "Fiji": { continent: CONTINENTS.OCEANIA, region: REGIONS.OCEANIA, flag: "🇫🇯" },
  "Papua New Guinea": { continent: CONTINENTS.OCEANIA, region: REGIONS.OCEANIA, flag: "🇵🇬" },
  "Samoa": { continent: CONTINENTS.OCEANIA, region: REGIONS.OCEANIA, flag: "🇼🇸" },
  "Vanuatu": { continent: CONTINENTS.OCEANIA, region: REGIONS.OCEANIA, flag: "🇻🇺" },
};

// Quick filter popular regions (for Option C chips)
export const POPULAR_REGIONS = [
  { key: "Philippines", label: "Philippines", flag: "🇵🇭", type: "country" },
  { key: "Maldives", label: "Maldives", flag: "🇲🇻", type: "country" },
  { key: "Caribbean", label: "Caribbean", flag: "🏝️", type: "region" },
  { key: "United States", label: "USA", flag: "🇺🇸", type: "country" },
  { key: "Europe", label: "Europe", flag: "🇪🇺", type: "continent" },
] as const;

// Helper function to get continent from country
export function getContinentFromCountry(country: string): string | null {
  const mapping = COUNTRY_MAPPING[country];
  return mapping ? mapping.continent : null;
}

// Helper function to get region from country
export function getRegionFromCountry(country: string): string | null {
  const mapping = COUNTRY_MAPPING[country];
  return mapping ? mapping.region : null;
}

// Helper function to get flag from country
export function getFlagFromCountry(country: string): string {
  const mapping = COUNTRY_MAPPING[country];
  return mapping ? mapping.flag : "🌍";
}

// Get all countries for a specific continent
export function getCountriesByContinent(continent: string): string[] {
  return Object.entries(COUNTRY_MAPPING)
    .filter(([_, value]) => value.continent === continent)
    .map(([country, _]) => country);
}

// Get all countries for a specific region
export function getCountriesByRegion(region: string): string[] {
  // Handle common region name variations (no space vs with space)
  const regionAliases: Record<string, string> = {
    'NorthAmerica': 'North America',
    'SouthEastAsia': 'Southeast Asia',
    'SouthAsia': 'South Asia',
    'EastAsia': 'East Asia',
  };
  
  // Normalize the region name
  const normalizedRegion = regionAliases[region] || region;
  
  return Object.entries(COUNTRY_MAPPING)
    .filter(([_, value]) => value.region === normalizedRegion)
    .map(([country, _]) => country);
}

// Hierarchical structure for dropdown
export interface RegionHierarchy {
  continent: string;
  continentIcon: string;
  regions: {
    name: string;
    countries: {
      name: string;
      flag: string;
    }[];
  }[];
}

export function getRegionHierarchy(): RegionHierarchy[] {
  const hierarchy: RegionHierarchy[] = [
    {
      continent: CONTINENTS.ASIA,
      continentIcon: "🌏",
      regions: [
        {
          name: REGIONS.SOUTHEAST_ASIA,
          countries: getCountriesByRegion(REGIONS.SOUTHEAST_ASIA).map(c => ({
            name: c,
            flag: getFlagFromCountry(c),
          })),
        },
        {
          name: REGIONS.SOUTH_ASIA,
          countries: getCountriesByRegion(REGIONS.SOUTH_ASIA).map(c => ({
            name: c,
            flag: getFlagFromCountry(c),
          })),
        },
        {
          name: REGIONS.EAST_ASIA,
          countries: getCountriesByRegion(REGIONS.EAST_ASIA).map(c => ({
            name: c,
            flag: getFlagFromCountry(c),
          })),
        },
      ],
    },
    {
      continent: CONTINENTS.EUROPE,
      continentIcon: "🌍",
      regions: [
        {
          name: REGIONS.SOUTHERN_EUROPE,
          countries: getCountriesByRegion(REGIONS.SOUTHERN_EUROPE).map(c => ({
            name: c,
            flag: getFlagFromCountry(c),
          })),
        },
        {
          name: REGIONS.WESTERN_EUROPE,
          countries: getCountriesByRegion(REGIONS.WESTERN_EUROPE).map(c => ({
            name: c,
            flag: getFlagFromCountry(c),
          })),
        },
        {
          name: REGIONS.NORTHERN_EUROPE,
          countries: getCountriesByRegion(REGIONS.NORTHERN_EUROPE).map(c => ({
            name: c,
            flag: getFlagFromCountry(c),
          })),
        },
        {
          name: REGIONS.EASTERN_EUROPE,
          countries: getCountriesByRegion(REGIONS.EASTERN_EUROPE).map(c => ({
            name: c,
            flag: getFlagFromCountry(c),
          })),
        },
      ],
    },
    {
      continent: CONTINENTS.AMERICAS,
      continentIcon: "🌎",
      regions: [
        {
          name: REGIONS.NORTH_AMERICA,
          countries: getCountriesByRegion(REGIONS.NORTH_AMERICA).map(c => ({
            name: c,
            flag: getFlagFromCountry(c),
          })),
        },
        {
          name: REGIONS.CARIBBEAN,
          countries: getCountriesByRegion(REGIONS.CARIBBEAN).map(c => ({
            name: c,
            flag: getFlagFromCountry(c),
          })),
        },
        {
          name: REGIONS.CENTRAL_AMERICA,
          countries: getCountriesByRegion(REGIONS.CENTRAL_AMERICA).map(c => ({
            name: c,
            flag: getFlagFromCountry(c),
          })),
        },
        {
          name: REGIONS.SOUTH_AMERICA,
          countries: getCountriesByRegion(REGIONS.SOUTH_AMERICA).map(c => ({
            name: c,
            flag: getFlagFromCountry(c),
          })),
        },
      ],
    },
    {
      continent: CONTINENTS.MIDDLE_EAST,
      continentIcon: "🌍",
      regions: [
        {
          name: REGIONS.MIDDLE_EAST,
          countries: getCountriesByRegion(REGIONS.MIDDLE_EAST).map(c => ({
            name: c,
            flag: getFlagFromCountry(c),
          })),
        },
      ],
    },
    {
      continent: CONTINENTS.OCEANIA,
      continentIcon: "🌏",
      regions: [
        {
          name: REGIONS.OCEANIA,
          countries: getCountriesByRegion(REGIONS.OCEANIA).map(c => ({
            name: c,
            flag: getFlagFromCountry(c),
          })),
        },
      ],
    },
  ];

  return hierarchy;
}
