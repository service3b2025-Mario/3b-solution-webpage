import { eq, desc, asc, and, or, like, sql, inArray, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { 
  InsertUser, users, 
  properties, Property, InsertProperty,
  services, Service, InsertService,
  locations, Location, InsertLocation,
  teamMembers, TeamMember, InsertTeamMember,
  successStories, SuccessStory, InsertSuccessStory,
  marketReports, MarketReport, InsertMarketReport,
  leads, Lead, InsertLead,
  bookings, Booking, InsertBooking,
  marketAlerts, MarketAlert, InsertMarketAlert,
  siteSettings, SiteSetting, InsertSiteSetting,
  portfolioStats, PortfolioStat, InsertPortfolioStat,
  analyticsEvents, AnalyticsEvent, InsertAnalyticsEvent,
  fxRates, FxRate, InsertFxRate,
  legalPages, LegalPage, InsertLegalPage,
  savedSearches, SavedSearch, InsertSavedSearch,
  wishlist, Wishlist, InsertWishlist,
  agentAvailability, AgentAvailability, InsertAgentAvailability,
  tourFeedback, TourFeedback, InsertTourFeedback,
  downloads, Download, InsertDownload,
  downloadTags, DownloadTag, InsertDownloadTag,
  downloadTagAssignments, DownloadTagAssignment, InsertDownloadTagAssignment,
  resources, Resource, InsertResource
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb( ) {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// User operations
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  ["name", "email", "loginMethod"].forEach((field) => {
    const value = user[field as keyof InsertUser];
    if (value !== undefined) {
      (values as any)[field] = value ?? null;
      updateSet[field] = value ?? null;
    }
  });

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = 'admin';
    updateSet.role = 'admin';
  }

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Properties operations
export async function getProperties(filters?: {
  region?: string;
  country?: string;
  location?: string;
  locationType?: 'country' | 'region' | 'continent';
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  featured?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };

  const conditions = [];
  
  // New hierarchical location filtering
  if (filters?.location && filters?.locationType) {
    const { getCountriesByContinent, getCountriesByRegion, COUNTRY_MAPPING } = await import('../shared/regionMapping');
    
    if (filters.locationType === 'country') {
      // Direct country match
      conditions.push(eq(properties.country, filters.location));
    } else if (filters.locationType === 'region') {
      // Get all countries in this region
      const countries = getCountriesByRegion(filters.location);
      if (countries.length > 0) {
        conditions.push(inArray(properties.country, countries));
      }
    } else if (filters.locationType === 'continent') {
      // Special handling for "Europe" continent filter
      if (filters.location === 'Europe') {
        const countries = getCountriesByContinent('Europe');
        if (countries.length > 0) {
          conditions.push(inArray(properties.country, countries));
        }
      } else {
        // Get all countries in this continent
        const countries = getCountriesByContinent(filters.location);
        if (countries.length > 0) {
          conditions.push(inArray(properties.country, countries));
        }
      }
    }
  }
  
  // Legacy region filtering (keep for backward compatibility)
  if (filters?.region) {
    const { getCountriesByContinent, getCountriesByRegion, REGIONS } = await import('../shared/regionMapping');
    
    // Use country field for filtering
    // If filtering by SouthEastAsia, show all Philippines properties (since Philippines is in SEA)
    if (filters.region === 'SouthEastAsia') {
      conditions.push(eq(properties.country, 'Philippines'));
    } else if (filters.region === 'Philippines') {
      // Show all properties where country is Philippines
      conditions.push(eq(properties.country, 'Philippines'));
    } else if (filters.region === 'Caribbean') {
      // Get all countries in Caribbean region
      const countries = getCountriesByRegion(REGIONS.CARIBBEAN);
      if (countries.length > 0) {
        conditions.push(inArray(properties.country, countries));
      }
    } else if (filters.region === 'Maldives') {
      // Direct country match for Maldives
      conditions.push(eq(properties.country, 'Maldives'));
    } else if (filters.region === 'Europe') {
      // Get all countries in Europe continent
      const countries = getCountriesByContinent('Europe');
      if (countries.length > 0) {
        conditions.push(inArray(properties.country, countries));
      }
    } else {
      // For other regions, try country first, then check if it's a region
      const countries = getCountriesByRegion(filters.region);
      if (countries.length > 0) {
        conditions.push(inArray(properties.country, countries));
      } else {
        // Fallback to direct country match
        conditions.push(eq(properties.country, filters.region));
      }
    }
  }
  if (filters?.country) conditions.push(eq(properties.country, filters.country));
  if (filters?.propertyType) conditions.push(eq(properties.propertyType, filters.propertyType as any));
  if (filters?.status) conditions.push(eq(properties.status, filters.status as any));
  if (filters?.featured !== undefined) conditions.push(eq(properties.featured, filters.featured));
  // Price filtering with currency conversion
  // Note: Filter prices are in USD, but properties may be stored in different currencies
  // We need to convert property prices to USD for comparison
  if (filters?.minPrice || filters?.maxPrice) {
    // Fetch exchange rates
    const exchangeRates: Record<string, number> = {
      USD: 1,
      PHP: 56.5,  // 1 USD = 56.5 PHP
      EUR: 0.95,  // 1 USD = 0.95 EUR
      GBP: 0.79,  // 1 USD = 0.79 GBP
      CNY: 7.25,  // 1 USD = 7.25 CNY
      SGD: 1.35,  // 1 USD = 1.35 SGD
    };
    
    // We need to filter in application layer since SQL can't easily convert currencies
    // Mark that we need post-query filtering
    (filters as any)._needsCurrencyFilter = true;
    (filters as any)._exchangeRates = exchangeRates;
  }
  if (filters?.search) {
    conditions.push(or(
      like(properties.title, `%${filters.search}%`),
      like(properties.city, `%${filters.search}%`),
      like(properties.country, `%${filters.search}%`)
    ));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  
  // Build query - apply limit only if explicitly provided, otherwise fetch all
  let items = await db.select().from(properties)
    .where(whereClause)
    .orderBy(filters?.sortOrder === 'asc' ? asc(properties.createdAt) : desc(properties.createdAt))
    .limit(filters?.limit || 1000) // Use high limit as fallback
    .offset(filters?.offset || 0);
  
  // Apply currency conversion filtering if needed
  if ((filters as any)?._needsCurrencyFilter && (filters?.minPrice || filters?.maxPrice)) {
    const exchangeRates = (filters as any)._exchangeRates;
    
    items = items.filter(property => {
      // Skip properties without prices
      if (!property.askingPriceNet && !property.askingPriceGross) return false;
      
      // Get the property price (prefer Net, fallback to Gross)
      const propertyPrice = property.askingPriceNet || property.askingPriceGross;
      if (!propertyPrice) return false;
      
      // Convert property price to USD
      const currency = property.currency || 'USD';
      const rate = exchangeRates[currency] || 1;
      const priceInUSD = parseFloat(propertyPrice.toString()) / rate;
      
      // Apply min/max filters
      if (filters.minPrice && priceInUSD < filters.minPrice) return false;
      if (filters.maxPrice && priceInUSD > filters.maxPrice) return false;
      
      return true;
    });
  }
  
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(properties).where(whereClause);
  const totalBeforeFilter = countResult[0]?.count || 0;
  
  // If we filtered by currency, return the filtered count
  const total = (filters as any)?._needsCurrencyFilter ? items.length : totalBeforeFilter;

  return { items, total };
}

export async function getPropertyBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(properties).where(eq(properties.slug, slug)).limit(1);
  return result[0] || null;
}

export async function getPropertyById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(properties).where(eq(properties.id, id)).limit(1);
  return result[0] || null;
}

export async function createProperty(data: InsertProperty) {
  const db = await getDb();
  if (!db) return null;
  
  // Sanitize data: convert empty arrays to null, empty strings to null
  const sanitizedData = { ...data };
  
  // Convert empty arrays to null for JSON fields
  if (Array.isArray(sanitizedData.images) && sanitizedData.images.length === 0) {
    sanitizedData.images = null as any;
  }
  if (Array.isArray(sanitizedData.features) && sanitizedData.features.length === 0) {
    sanitizedData.features = null as any;
  }
  if (Array.isArray(sanitizedData.amenities) && sanitizedData.amenities.length === 0) {
    sanitizedData.amenities = null as any;
  }
  if (Array.isArray(sanitizedData.interiorFeatures) && sanitizedData.interiorFeatures.length === 0) {
    sanitizedData.interiorFeatures = null as any;
  }
  if (Array.isArray(sanitizedData.exteriorFeatures) && sanitizedData.exteriorFeatures.length === 0) {
    sanitizedData.exteriorFeatures = null as any;
  }
  
  // Convert empty object to null for imageCaptions
  if (sanitizedData.imageCaptions && typeof sanitizedData.imageCaptions === 'object' && Object.keys(sanitizedData.imageCaptions).length === 0) {
    sanitizedData.imageCaptions = null as any;
  }
  
  // Convert empty strings to null for optional text fields
  if (sanitizedData.priceMax === '') sanitizedData.priceMax = null as any;
  if (sanitizedData.priceMin === '') sanitizedData.priceMin = null as any;
  if (sanitizedData.description === '') sanitizedData.description = null as any;
  if (sanitizedData.shortDescription === '') sanitizedData.shortDescription = null as any;
  
  // Convert NaN and invalid numbers to null for numeric fields
  const numericFields = ['landSizeSqm', 'landSizeHa', 'buildingAreaSqm', 'floorAreaSqm', 'floors', 'units', 'floorAreaRatio', 'askingPriceNet', 'askingPriceGross', 'expectedReturn', 'bedrooms', 'bathrooms', 'yearBuilt'] as const;
  numericFields.forEach(field => {
    const value = (sanitizedData as any)[field];
    if (value !== undefined && value !== null) {
      // Check if value is NaN, contains "NaN", or is not a valid number
      if (typeof value === 'string' && (value.includes('NaN') || value === '' || isNaN(parseFloat(value)))) {
        (sanitizedData as any)[field] = null;
      } else if (typeof value === 'number' && isNaN(value)) {
        (sanitizedData as any)[field] = null;
      }
    }
  });
  
  try {
    const result = await db.insert(properties).values(sanitizedData);
    return result[0].insertId;
  } catch (error: any) {
    console.error('[createProperty] Database insertion failed:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('SQL State:', error.sqlState);
    console.error('SQL Message:', error.sqlMessage);
    console.error('Sanitized data:', JSON.stringify(sanitizedData, null, 2));
    throw error;
  }
}

export async function updateProperty(id: number, data: Partial<InsertProperty>) {
  const db = await getDb();
  if (!db) return false;
  
  // Sanitize data: convert empty arrays to null, empty strings to null
  const sanitizedData = { ...data };
  
  // Convert empty arrays to null for JSON fields
  if (Array.isArray(sanitizedData.images) && sanitizedData.images.length === 0) {
    sanitizedData.images = null as any;
  }
  if (Array.isArray(sanitizedData.features) && sanitizedData.features.length === 0) {
    sanitizedData.features = null as any;
  }
  if (Array.isArray(sanitizedData.amenities) && sanitizedData.amenities.length === 0) {
    sanitizedData.amenities = null as any;
  }
  if (Array.isArray(sanitizedData.interiorFeatures) && sanitizedData.interiorFeatures.length === 0) {
    sanitizedData.interiorFeatures = null as any;
  }
  if (Array.isArray(sanitizedData.exteriorFeatures) && sanitizedData.exteriorFeatures.length === 0) {
    sanitizedData.exteriorFeatures = null as any;
  }
  
  // Convert empty object to null for imageCaptions
  if (sanitizedData.imageCaptions && typeof sanitizedData.imageCaptions === 'object' && Object.keys(sanitizedData.imageCaptions).length === 0) {
    sanitizedData.imageCaptions = null as any;
  }
  
  // Convert empty strings to null for optional text fields
  if (sanitizedData.priceMax === '') sanitizedData.priceMax = null as any;
  if (sanitizedData.priceMin === '') sanitizedData.priceMin = null as any;
  if (sanitizedData.description === '') sanitizedData.description = null as any;
  if (sanitizedData.shortDescription === '') sanitizedData.shortDescription = null as any;
  
  // Convert NaN and invalid numbers to null for numeric fields
  const numericFields = ['landSizeSqm', 'landSizeHa', 'buildingAreaSqm', 'floorAreaSqm', 'floors', 'units', 'floorAreaRatio', 'askingPriceNet', 'askingPriceGross', 'expectedReturn', 'bedrooms', 'bathrooms', 'yearBuilt'] as const;
  numericFields.forEach(field => {
    const value = (sanitizedData as any)[field];
    if (value !== undefined && value !== null) {
      // Check if value is NaN, contains "NaN", or is not a valid number
      if (typeof value === 'string' && (value.includes('NaN') || value === '' || isNaN(parseFloat(value)))) {
        (sanitizedData as any)[field] = null;
      } else if (typeof value === 'number' && isNaN(value)) {
        (sanitizedData as any)[field] = null;
      }
    }
  });
  
  await db.update(properties).set(sanitizedData).where(eq(properties.id, id));
  return true;
}

export async function deleteProperty(id: number) {
  const db = await getDb();
  if (!db) return false;
  await db.delete(properties).where(eq(properties.id, id));
  return true;
}

export async function incrementPropertyViews(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(properties).set({ views: sql`${properties.views} + 1` }).where(eq(properties.id, id));
}

export async function getRealPropertyNameStats() {
  const db = await getDb();
  if (!db) return { total: 0, filled: 0, empty: 0, emptyProperties: [] };
  
  // Get all properties with id, title, slug, and realPropertyName
  const allProperties = await db.select({
    id: properties.id,
    title: properties.title,
    slug: properties.slug,
    realPropertyName: properties.realPropertyName,
  }).from(properties);
  
  const total = allProperties.length;
  const filled = allProperties.filter(p => p.realPropertyName && p.realPropertyName.trim() !== '').length;
  const empty = total - filled;
  const emptyProperties = allProperties
    .filter(p => !p.realPropertyName || p.realPropertyName.trim() === '')
    .map(p => ({ id: p.id, title: p.title, slug: p.slug }));
  
  return { total, filled, empty, emptyProperties };
}

export async function getFeaturedPropertiesCount() {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db.select({ count: sql<number>`count(*)` })
    .from(properties)
    .where(eq(properties.featured, true));
  
  return result[0]?.count || 0;
}

// Services operations
export async function getServices(activeOnly = true) {
  const db = await getDb();
  if (!db) return [];
  const query = db.select().from(services).orderBy(asc(services.order));
  if (activeOnly) return query.where(eq(services.isActive, true));
  return query;
}

export async function getServiceBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(services).where(eq(services.slug, slug)).limit(1);
  return result[0] || null;
}

export async function createService(data: InsertService) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(services).values(data);
  return result[0].insertId;
}

export async function updateService(id: number, data: Partial<InsertService>) {
  const db = await getDb();
  if (!db) return false;
  await db.update(services).set(data).where(eq(services.id, id));
  return true;
}

export async function deleteService(id: number) {
  const db = await getDb();
  if (!db) return false;
  await db.delete(services).where(eq(services.id, id));
  return true;
}

// Locations operations
export async function getLocations(activeOnly = true) {
  const db = await getDb();
  if (!db) return [];
  const query = db.select().from(locations).orderBy(asc(locations.order));
  if (activeOnly) return query.where(eq(locations.isActive, true));
  return query;
}

export async function createLocation(data: InsertLocation) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(locations).values(data);
  return result[0].insertId;
}

export async function updateLocation(id: number, data: Partial<InsertLocation>) {
  const db = await getDb();
  if (!db) return false;
  await db.update(locations).set(data).where(eq(locations.id, id));
  return true;
}

export async function deleteLocation(id: number) {
  const db = await getDb();
  if (!db) return false;
  await db.delete(locations).where(eq(locations.id, id));
  return true;
}

// Team members operations
export async function getTeamMembers(expertsOnly = false) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(teamMembers).where(eq(teamMembers.isActive, true)).orderBy(asc(teamMembers.order));
  if (expertsOnly) {
    return db.select().from(teamMembers).where(and(eq(teamMembers.isActive, true), eq(teamMembers.isExpert, true))).orderBy(asc(teamMembers.order));
  }
  return query;
}

export async function getTeamMemberById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(teamMembers).where(eq(teamMembers.id, id)).limit(1);
  return result[0] || null;
}

export async function createTeamMember(data: InsertTeamMember) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(teamMembers).values(data);
  return result[0].insertId;
}

export async function updateTeamMember(id: number, data: Partial<InsertTeamMember>) {
  const db = await getDb();
  if (!db) return false;
  await db.update(teamMembers).set(data).where(eq(teamMembers.id, id));
  return true;
}

export async function deleteTeamMember(id: number) {
  const db = await getDb();
  if (!db) return false;
  await db.delete(teamMembers).where(eq(teamMembers.id, id));
  return true;
}

// Success stories operations
export async function getSuccessStories(filters?: { featured?: boolean; clientType?: string; limit?: number; offset?: number }) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };

  const conditions = [eq(successStories.isActive, true)];
  if (filters?.featured !== undefined) conditions.push(eq(successStories.featured, filters.featured));
  if (filters?.clientType) conditions.push(eq(successStories.clientType, filters.clientType as any));

  const whereClause = and(...conditions);
  
  const [items, countResult] = await Promise.all([
    db.select().from(successStories)
      .where(whereClause)
      .orderBy(desc(successStories.createdAt))
      .limit(filters?.limit || 20)
      .offset(filters?.offset || 0),
    db.select({ count: sql<number>`count(*)` }).from(successStories).where(whereClause)
  ]);

  return { items, total: countResult[0]?.count || 0 };
}

export async function getFeaturedStory() {
  const db = await getDb();
  if (!db) return null;
  const currentMonth = new Date().toISOString().slice(0, 7);
  let result = await db.select().from(successStories)
    .where(and(eq(successStories.isActive, true), eq(successStories.featuredMonth, currentMonth)))
    .limit(1);
  if (!result[0]) {
    result = await db.select().from(successStories)
      .where(and(eq(successStories.isActive, true), eq(successStories.featured, true)))
      .orderBy(desc(successStories.createdAt))
      .limit(1);
  }
  return result[0] || null;
}

export async function getStoryBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(successStories).where(eq(successStories.slug, slug)).limit(1);
  return result[0] || null;
}

export async function createSuccessStory(data: InsertSuccessStory) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(successStories).values(data);
  return result[0].insertId;
}

export async function updateSuccessStory(id: number, data: Partial<InsertSuccessStory>) {
  const db = await getDb();
  if (!db) return false;
  await db.update(successStories).set(data).where(eq(successStories.id, id));
  return true;
}

export async function deleteSuccessStory(id: number) {
  const db = await getDb();
  if (!db) return false;
  await db.delete(successStories).where(eq(successStories.id, id));
  return true;
}

// Market reports operations
export async function getMarketReports(filters?: { category?: string; region?: string; limit?: number }) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(marketReports.isActive, true)];
  if (filters?.category) conditions.push(eq(marketReports.category, filters.category));
  if (filters?.region) conditions.push(eq(marketReports.region, filters.region));

  return db.select().from(marketReports)
    .where(and(...conditions))
    .orderBy(desc(marketReports.publishedAt))
    .limit(filters?.limit || 20);
}

export async function createMarketReport(data: InsertMarketReport) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(marketReports).values(data);
  return result[0].insertId;
}

export async function updateMarketReport(id: number, data: Partial<InsertMarketReport>) {
  const db = await getDb();
  if (!db) return false;
  await db.update(marketReports).set(data).where(eq(marketReports.id, id));
  return true;
}

export async function deleteMarketReport(id: number) {
  const db = await getDb();
  if (!db) return false;
  await db.delete(marketReports).where(eq(marketReports.id, id));
  return true;
}

export async function incrementReportDownloads(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(marketReports).set({ downloadCount: sql`${marketReports.downloadCount} + 1` }).where(eq(marketReports.id, id));
}

// Leads operations
export async function createLead(data: InsertLead) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(leads).values(data);
  return result[0].insertId;
}

export async function getLeads(filters?: { status?: string; source?: string; limit?: number; offset?: number }) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };

  const conditions = [];
  if (filters?.status) conditions.push(eq(leads.status, filters.status as any));
  if (filters?.source) conditions.push(eq(leads.source, filters.source));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  
  const [items, countResult] = await Promise.all([
    db.select().from(leads)
      .where(whereClause)
      .orderBy(desc(leads.createdAt))
      .limit(filters?.limit || 50)
      .offset(filters?.offset || 0),
    db.select({ count: sql<number>`count(*)` }).from(leads).where(whereClause)
  ]);

  return { items, total: countResult[0]?.count || 0 };
}

export async function updateLead(id: number, data: Partial<InsertLead>) {
  const db = await getDb();
  if (!db) return false;
  await db.update(leads).set(data).where(eq(leads.id, id));
  return true;
}

// Bookings operations
export async function createBooking(data: InsertBooking) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(bookings).values(data);
  return result[0].insertId;
}

export async function getBookings(filters?: { expertId?: number; status?: string; fromDate?: Date; limit?: number }) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (filters?.expertId) conditions.push(eq(bookings.expertId, filters.expertId));
  if (filters?.status) conditions.push(eq(bookings.status, filters.status as any));
  if (filters?.fromDate) conditions.push(gte(bookings.scheduledAt, filters.fromDate));

  return db.select().from(bookings)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(asc(bookings.scheduledAt))
    .limit(filters?.limit || 50);
}

export async function updateBooking(id: number, data: Partial<InsertBooking>) {
  const db = await getDb();
  if (!db) return false;
  await db.update(bookings).set(data).where(eq(bookings.id, id));
  return true;
}

export async function getBookingsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select()
    .from(bookings)
    .leftJoin(properties, eq(bookings.propertyId, properties.id))
    .where(eq(bookings.userId, userId))
    .orderBy(desc(bookings.scheduledAt));
}

export async function getBookingById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.select().from(bookings).where(eq(bookings.id, id));
  return result;
}

export async function cancelBooking(id: number, userId: number) {
  const db = await getDb();
  if (!db) return false;
  await db.update(bookings)
    .set({ status: 'cancelled' })
    .where(and(eq(bookings.id, id), eq(bookings.userId, userId)));
  return true;
}

// Agent Availability operations
export async function getAgentAvailability(agentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select()
    .from(agentAvailability)
    .where(and(eq(agentAvailability.agentId, agentId), eq(agentAvailability.isActive, true)));
}

export async function createAgentAvailability(data: InsertAgentAvailability) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(agentAvailability).values(data);
  return result[0].insertId;
}

export async function getAvailableTimeSlots(agentId: number, date: Date) {
  const db = await getDb();
  if (!db) return [];
  
  const dayOfWeek = date.getDay();
  
  // Get agent's availability for this day
  const availability = await db.select()
    .from(agentAvailability)
    .where(and(
      eq(agentAvailability.agentId, agentId),
      eq(agentAvailability.dayOfWeek, dayOfWeek),
      eq(agentAvailability.isActive, true)
    ));
  
  if (availability.length === 0) return [];
  
  // Get existing bookings for this agent on this date
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const existingBookings = await db.select()
    .from(bookings)
    .where(and(
      eq(bookings.expertId, agentId),
      gte(bookings.scheduledAt, startOfDay),
      sql`${bookings.scheduledAt} <= ${endOfDay}`,
      sql`${bookings.status} IN ('scheduled', 'confirmed')`
    ));
  
  return { availability, existingBookings };
}

// Market alerts operations
export async function createMarketAlert(data: InsertMarketAlert) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(marketAlerts).values(data);
  return result[0].insertId;
}

export async function getMarketAlerts(activeOnly = true) {
  const db = await getDb();
  if (!db) return [];
  if (activeOnly) return db.select().from(marketAlerts).where(eq(marketAlerts.isActive, true));
  return db.select().from(marketAlerts);
}

// Site settings operations
export async function getSetting(key: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
  return result[0]?.value || null;
}

export async function getSettingsByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(siteSettings).where(eq(siteSettings.category, category));
}

export async function getAllSettings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(siteSettings);
}

export async function upsertSetting(key: string, value: string, type: 'text' | 'number' | 'json' | 'html' = 'text', category?: string) {
  const db = await getDb();
  if (!db) return false;
  await db.insert(siteSettings).values({ key, value, type, category })
    .onDuplicateKeyUpdate({ set: { value, type, category } });
  return true;
}

// Portfolio stats operations
export async function getPortfolioStats() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(portfolioStats).where(eq(portfolioStats.isActive, true)).orderBy(asc(portfolioStats.order));
}

export async function upsertPortfolioStat(data: InsertPortfolioStat) {
  const db = await getDb();
  if (!db) return null;
  if (data.id) {
    await db.update(portfolioStats).set(data).where(eq(portfolioStats.id, data.id));
    return data.id;
  }
  const result = await db.insert(portfolioStats).values(data);
  return result[0].insertId;
}

// Analytics operations
export async function trackEvent(data: InsertAnalyticsEvent) {
  const db = await getDb();
  if (!db) return;
  await db.insert(analyticsEvents).values(data);
}

export async function getAnalyticsSummary(fromDate?: Date, toDate?: Date) {
  const db = await getDb();
  if (!db) return null;

  const conditions = [];
  if (fromDate) conditions.push(gte(analyticsEvents.createdAt, fromDate));
  if (toDate) conditions.push(lte(analyticsEvents.createdAt, toDate));
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [pageViews, leadsBySource, eventsByType] = await Promise.all([
    db.select({ 
      page: analyticsEvents.page, 
      count: sql<number>`count(*)` 
    }).from(analyticsEvents)
      .where(and(whereClause, eq(analyticsEvents.eventType, 'page_view')))
      .groupBy(analyticsEvents.page),
    db.select({ 
      source: leads.source, 
      count: sql<number>`count(*)` 
    }).from(leads)
      .groupBy(leads.source),
    db.select({ 
      eventType: analyticsEvents.eventType, 
      count: sql<number>`count(*)` 
    }).from(analyticsEvents)
      .where(whereClause)
      .groupBy(analyticsEvents.eventType)
  ]);

  return { pageViews, leadsBySource, eventsByType };
}

// FX rates operations
export async function getFxRates(baseCurrency = 'USD') {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(fxRates).where(eq(fxRates.baseCurrency, baseCurrency));
}

export async function upsertFxRate(data: InsertFxRate) {
  const db = await getDb();
  if (!db) return false;
  await db.insert(fxRates).values(data)
    .onDuplicateKeyUpdate({ set: { rate: data.rate, fetchedAt: data.fetchedAt } });
  return true;
}

export async function getLatestFxRate(baseCurrency: string, targetCurrency: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(fxRates)
    .where(and(eq(fxRates.baseCurrency, baseCurrency), eq(fxRates.targetCurrency, targetCurrency)))
    .orderBy(desc(fxRates.fetchedAt))
    .limit(1);
  return result[0] || null;
}

// Legal pages operations
export async function getLegalPages() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(legalPages).where(eq(legalPages.isActive, true)).orderBy(asc(legalPages.order));
}

export async function getLegalPageBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(legalPages).where(eq(legalPages.slug, slug)).limit(1);
  return result[0] || null;
}

export async function getAllLegalPages() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(legalPages).orderBy(asc(legalPages.order));
}

export async function createLegalPage(data: InsertLegalPage) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(legalPages).values(data);
  return result[0].insertId;
}

export async function updateLegalPage(id: number, data: Partial<InsertLegalPage>) {
  const db = await getDb();
  if (!db) return false;
  await db.update(legalPages).set(data).where(eq(legalPages.id, id));
  return true;
}

export async function deleteLegalPage(id: number) {
  const db = await getDb();
  if (!db) return false;
  await db.delete(legalPages).where(eq(legalPages.id, id));
  return true;
}

// Saved searches operations
export async function getSavedSearchesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(savedSearches).where(eq(savedSearches.userId, userId)).orderBy(desc(savedSearches.createdAt));
}

export async function createSavedSearch(data: InsertSavedSearch) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(savedSearches).values(data);
  return result;
}

export async function deleteSavedSearch(id: number, userId: number) {
  const db = await getDb();
  if (!db) return false;
  await db.delete(savedSearches).where(and(eq(savedSearches.id, id), eq(savedSearches.userId, userId)));
  return true;
}

export async function toggleSavedSearchNotifications(id: number, userId: number, enabled: boolean) {
  const db = await getDb();
  if (!db) return false;
  await db.update(savedSearches)
    .set({ notificationsEnabled: enabled })
    .where(and(eq(savedSearches.id, id), eq(savedSearches.userId, userId)));
  return true;
}

export async function getSavedSearchById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.select().from(savedSearches).where(eq(savedSearches.id, id));
  return result;
}

export async function getAllSavedSearchesWithNotifications() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(savedSearches).where(eq(savedSearches.notificationsEnabled, true));
}

export async function updateSavedSearchLastNotified(id: number) {
  const db = await getDb();
  if (!db) return false;
  await db.update(savedSearches)
    .set({ lastNotified: new Date() })
    .where(eq(savedSearches.id, id));
  return true;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.select().from(users).where(eq(users.id, id));
  return result;
}

// Wishlist operations
export async function getWishlistByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  // Join with properties to get full property details
  const results = await db
    .select({
      id: wishlist.id,
      userId: wishlist.userId,
      propertyId: wishlist.propertyId,
      createdAt: wishlist.createdAt,
      property: properties,
    })
    .from(wishlist)
    .leftJoin(properties, eq(wishlist.propertyId, properties.id))
    .where(eq(wishlist.userId, userId))
    .orderBy(desc(wishlist.createdAt));
  
  return results;
}

export async function addToWishlist(userId: number, propertyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if already in wishlist
  const existing = await db
    .select()
    .from(wishlist)
    .where(and(eq(wishlist.userId, userId), eq(wishlist.propertyId, propertyId)));
  
  if (existing.length > 0) {
    return { success: false, message: "Already in wishlist" };
  }
  
  await db.insert(wishlist).values({ userId, propertyId });
  return { success: true };
}

export async function removeFromWishlist(userId: number, propertyId: number) {
  const db = await getDb();
  if (!db) return false;
  
  await db
    .delete(wishlist)
    .where(and(eq(wishlist.userId, userId), eq(wishlist.propertyId, propertyId)));
  
  return true;
}

export async function isInWishlist(userId: number, propertyId: number) {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db
    .select()
    .from(wishlist)
    .where(and(eq(wishlist.userId, userId), eq(wishlist.propertyId, propertyId)));
  
  return result.length > 0;
}


// Sales Funnel Analytics
export async function getSalesFunnelStats() {
  const db = await getDb();
  if (!db) return { totalVisitors: 0, registeredUsers: 0, engagedUsers: 0, inquiries: 0, bookings: 0, wishlistActions: 0, savedSearches: 0, avgPropertiesViewed: 0 };
  const [
    totalVisitors,
    registeredUsers,
    usersWithWishlist,
    usersWithSavedSearches,
    totalInquiries,
    totalBookings,
    wishlistCount,
    savedSearchCount,
  ] = await Promise.all([
    // Total visitors (from analytics events)
    db.select({ count: sql<number>`count(distinct ${analyticsEvents.sessionId})` })
      .from(analyticsEvents)
      .then((r: any) => r[0]?.count || 0),
    // Registered users
    db.select({ count: sql<number>`count(*)` })
      .from(users)
      .then((r: any) => r[0]?.count || 0),
    // Users with wishlist items
    db.select({ count: sql<number>`count(distinct ${wishlist.userId})` })
      .from(wishlist)
      .then((r: any) => r[0]?.count || 0),
    // Users with saved searches
    db.select({ count: sql<number>`count(distinct ${savedSearches.userId})` })
      .from(savedSearches)
      .then((r: any) => r[0]?.count || 0),
    // Total inquiries (leads)
    db.select({ count: sql<number>`count(*)` })
      .from(leads)
      .then((r: any) => r[0]?.count || 0),
    // Total bookings
    db.select({ count: sql<number>`count(*)` })
      .from(bookings)
      .then((r: any) => r[0]?.count || 0),
    // Total wishlist actions
    db.select({ count: sql<number>`count(*)` })
      .from(wishlist)
      .then((r: any) => r[0]?.count || 0),
    // Total saved searches
    db.select({ count: sql<number>`count(*)` })
      .from(savedSearches)
      .then((r: any) => r[0]?.count || 0),
  ]);

  const engagedUsers = Math.max(usersWithWishlist, usersWithSavedSearches);
  
  return {
    totalVisitors,
    registeredUsers,
    engagedUsers,
    inquiries: totalInquiries,
    bookings: totalBookings,
    wishlistActions: wishlistCount,
    savedSearches: savedSearchCount,
    avgPropertiesViewed: totalVisitors > 0 ? Math.round((totalVisitors * 3.5)) : 0, // Placeholder calculation
  };
}

export async function getRecentUsers(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  const recentUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(limit);

  // Get wishlist and saved search counts for each user
  const usersWithCounts = await Promise.all(
    recentUsers.map(async (user) => {
      const [wishlistCount, savedSearchCount] = await Promise.all([
        db.select({ count: sql<number>`count(*)` })
          .from(wishlist)
          .where(eq(wishlist.userId, user.id))
          .then((r: any) => r[0]?.count || 0),
        db.select({ count: sql<number>`count(*)` })
          .from(savedSearches)
          .where(eq(savedSearches.userId, user.id))
          .then((r: any) => r[0]?.count || 0),
      ]);
      
      return {
        ...user,
        wishlistCount,
        savedSearchCount,
      };
    })
  );

  return usersWithCounts;
}


export async function getUserEngagement(userId: string) {
  const db = await getDb();
  if (!db) return null;

  // Get user's wishlist with property details
  const wishlistData = await db
    .select({
      id: wishlist.id,
      propertyId: wishlist.propertyId,
      createdAt: wishlist.createdAt,
      property: {
        id: properties.id,
        title: properties.title,
        city: properties.city,
        country: properties.country,
        priceMin: properties.priceMin,
        mainImage: properties.mainImage,
      },
    })
    .from(wishlist)
    .leftJoin(properties, eq(wishlist.propertyId, properties.id))
    .where(eq(wishlist.userId, parseInt(userId)));

  // Get user's saved searches
  const userSavedSearches = await db
    .select()
    .from(savedSearches)
    .where(eq(savedSearches.userId, parseInt(userId)));

  // Build engagement timeline
  const timeline = [
    ...wishlistData.map((item: any) => ({
      type: 'wishlist',
      description: `Added "${item.property?.title}" to wishlist`,
      createdAt: item.createdAt,
    })),
    ...userSavedSearches.map((search: any) => ({
      type: 'search',
      description: `Saved search: "${search.name}"`,
      createdAt: search.createdAt,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return {
    wishlist: wishlistData,
    savedSearches: userSavedSearches,
    timeline,
    propertyViews: 0, // TODO: Implement property view tracking
  };
}

// Tour Feedback operations
export async function createTourFeedback(data: InsertTourFeedback) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(tourFeedback).values(data);
  return result[0].insertId;
}

export async function getTourFeedbackByBookingId(bookingId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(tourFeedback).where(eq(tourFeedback.bookingId, bookingId)).limit(1);
  return result[0] || null;
}

export async function getTourFeedbackByPropertyId(propertyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tourFeedback).where(eq(tourFeedback.propertyId, propertyId)).orderBy(desc(tourFeedback.createdAt));
}

export async function getAllTourFeedback() {
  const db = await getDb();
  if (!db) return [];
  
  const results = await db
    .select({
      id: tourFeedback.id,
      bookingId: tourFeedback.bookingId,
      userId: tourFeedback.userId,
      propertyId: tourFeedback.propertyId,
      rating: tourFeedback.rating,
      tourQuality: tourFeedback.tourQuality,
      propertyInterest: tourFeedback.propertyInterest,
      wouldRecommend: tourFeedback.wouldRecommend,
      comments: tourFeedback.comments,
      nextSteps: tourFeedback.nextSteps,
      createdAt: tourFeedback.createdAt,
      propertyTitle: properties.title,
      userName: users.name,
      userEmail: users.email,
    })
    .from(tourFeedback)
    .leftJoin(properties, eq(tourFeedback.propertyId, properties.id))
    .leftJoin(users, eq(tourFeedback.userId, users.id))
    .orderBy(desc(tourFeedback.createdAt));
  
  return results;
}

export async function getPropertyAverageRating(propertyId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const feedbacks = await getTourFeedbackByPropertyId(propertyId);
  if (!feedbacks.length) return null;
  
  const sum = feedbacks.reduce((acc, f) => acc + (f.rating || 0), 0);
  return {
    average: sum / feedbacks.length,
    count: feedbacks.length
  };
}

// ============================================
// Downloads Tracking Functions
// ============================================

export async function trackDownload(data: {
  fullName: string;
  email: string;
  resourceType: "report" | "brochure" | "photo" | "document" | "guide";
  resourceId?: number;
  resourceTitle: string;
  resourceUrl: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  const result = await db.insert(downloads).values({
    fullName: data.fullName,
    email: data.email,
    resourceType: data.resourceType,
    resourceId: data.resourceId,
    resourceTitle: data.resourceTitle,
    resourceUrl: data.resourceUrl,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
  });
  
  return Number(result[0].insertId);
}

export async function getAllDownloads() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(downloads).orderBy(desc(downloads.createdAt));
}

export async function getDownloadsByEmail(email: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(downloads).where(eq(downloads.email, email)).orderBy(desc(downloads.createdAt));
}

export async function getDownloadsByResourceType(resourceType: "report" | "brochure" | "photo" | "document" | "guide") {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(downloads).where(eq(downloads.resourceType, resourceType)).orderBy(desc(downloads.createdAt));
}

export async function getDownloadStats() {
  const db = await getDb();
  if (!db) return { total: 0, byType: {}, uniqueEmails: 0 };
  
  const allDownloads = await getAllDownloads();
  const uniqueEmails = new Set(allDownloads.map(d => d.email)).size;
  
  const byType = allDownloads.reduce((acc, download) => {
    acc[download.resourceType] = (acc[download.resourceType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    total: allDownloads.length,
    byType,
    uniqueEmails,
  };
}

// ============================================
// Download Tags Management
// ============================================

export async function createDownloadTag(data: { name: string; color: string; description?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(downloadTags).values({
    name: data.name,
    color: data.color,
    description: data.description,
  });
  
  return Number(result[0].insertId);
}

export async function getAllDownloadTags() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(downloadTags).orderBy(downloadTags.name);
}

export async function getDownloadTagById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(downloadTags).where(eq(downloadTags.id, id));
  return result[0] || null;
}

export async function updateDownloadTag(id: number, data: { name?: string; color?: string; description?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(downloadTags).set(data).where(eq(downloadTags.id, id));
  return true;
}

export async function deleteDownloadTag(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // First delete all assignments
  await db.delete(downloadTagAssignments).where(eq(downloadTagAssignments.tagId, id));
  
  // Then delete the tag
  await db.delete(downloadTags).where(eq(downloadTags.id, id));
  return true;
}

export async function assignTagToDownload(downloadId: number, tagId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if assignment already exists
  const existing = await db.select()
    .from(downloadTagAssignments)
    .where(
      and(
        eq(downloadTagAssignments.downloadId, downloadId),
        eq(downloadTagAssignments.tagId, tagId)
      )
    );
  
  if (existing.length > 0) {
    return existing[0].id;
  }
  
  const result = await db.insert(downloadTagAssignments).values({
    downloadId,
    tagId,
  });
  
  return Number(result[0].insertId);
}

export async function removeTagFromDownload(downloadId: number, tagId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(downloadTagAssignments)
    .where(
      and(
        eq(downloadTagAssignments.downloadId, downloadId),
        eq(downloadTagAssignments.tagId, tagId)
      )
    );
  
  return true;
}

export async function getTagsForDownload(downloadId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select({
    id: downloadTags.id,
    name: downloadTags.name,
    color: downloadTags.color,
    description: downloadTags.description,
  })
    .from(downloadTagAssignments)
    .innerJoin(downloadTags, eq(downloadTagAssignments.tagId, downloadTags.id))
    .where(eq(downloadTagAssignments.downloadId, downloadId));
  
  return result;
}

export async function getDownloadsWithTags() {
  const db = await getDb();
  if (!db) return [];
  
  const allDownloads = await getAllDownloads();
  
  // Get tags for each download
  const downloadsWithTags = await Promise.all(
    allDownloads.map(async (download) => {
      const tags = await getTagsForDownload(download.id);
      return {
        ...download,
        tags,
      };
    })
  );
  
  return downloadsWithTags;
}

export async function getDownloadsByTag(tagId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select({
    id: downloads.id,
    fullName: downloads.fullName,
    email: downloads.email,
    resourceType: downloads.resourceType,
    resourceId: downloads.resourceId,
    resourceTitle: downloads.resourceTitle,
    resourceUrl: downloads.resourceUrl,
    ipAddress: downloads.ipAddress,
    userAgent: downloads.userAgent,
    createdAt: downloads.createdAt,
  })
    .from(downloadTagAssignments)
    .innerJoin(downloads, eq(downloadTagAssignments.downloadId, downloads.id))
    .where(eq(downloadTagAssignments.tagId, tagId))
    .orderBy(desc(downloads.createdAt));
  
  return result;
}

// Get property counts by region (using country field)
// Now supports hierarchical counts: country, region, and continent
export async function getPropertyCountsByRegion() {
  const db = await getDb();
  if (!db) return {};
  
  const result = await db
    .select({
      country: properties.country,
      count: sql<number>`count(*)`
    })
    .from(properties)
    .groupBy(properties.country);
  
  const counts: Record<string, number> = {};
  
  // Import region mapping
  const { COUNTRY_MAPPING, CONTINENTS, REGIONS, getCountriesByRegion, getCountriesByContinent } = await import('../shared/regionMapping');
  
  // First, count by country
  result.forEach(row => {
    if (row.country) {
      counts[row.country] = row.count;
    }
  });
  
  // Calculate region counts
  const regionCounts: Record<string, number> = {};
  Object.values(REGIONS).forEach(region => {
    const countries = getCountriesByRegion(region);
    regionCounts[region] = countries.reduce((sum, country) => sum + (counts[country] || 0), 0);
    if (regionCounts[region] > 0) {
      counts[region] = regionCounts[region];
    }
  });
  
  // Calculate continent counts
  Object.values(CONTINENTS).forEach(continent => {
    const countries = getCountriesByContinent(continent);
    const continentCount = countries.reduce((sum, country) => sum + (counts[country] || 0), 0);
    if (continentCount > 0) {
      counts[continent] = continentCount;
    }
  });
  
  // Legacy support: Philippines is part of SouthEastAsia
  if (counts['Philippines']) {
    counts['SouthEastAsia'] = counts['Philippines'];
  }
  
  // Add "all" count
  const allCount = result.reduce((sum, row) => sum + row.count, 0);
  counts['all'] = allCount;
  
  return counts;
}

export async function getPropertyCountsByType() {
  const db = await getDb();
  if (!db) return {};
  
  const result = await db
    .select({
      type: properties.propertyType,
      count: sql<number>`count(*)`
    })
    .from(properties)
    .groupBy(properties.propertyType);
  
  const counts: Record<string, number> = {};
  result.forEach(row => {
    counts[row.type] = row.count;
  });
  
  return counts;
}

// ========== Resources Management ==========

// Get all active resources
export async function getActiveResources() {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(resources)
    .where(eq(resources.isActive, true))
    .orderBy(asc(resources.order), desc(resources.createdAt));
}

// Get resources by category
export async function getResourcesByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(resources)
    .where(and(
      eq(resources.isActive, true),
      sql`${resources.category} = ${category}`
    ))
    .orderBy(asc(resources.order), desc(resources.createdAt));
}

// Get single resource by ID
export async function getResourceById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(resources)
    .where(eq(resources.id, id))
    .limit(1);
  
  return result[0] || null;
}

// Increment download count
export async function incrementResourceDownloadCount(id: number) {
  const db = await getDb();
  if (!db) return;
  
  await db
    .update(resources)
    .set({ downloadCount: sql`${resources.downloadCount} + 1` })
    .where(eq(resources.id, id));
}


