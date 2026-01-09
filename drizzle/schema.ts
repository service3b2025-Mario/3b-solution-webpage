import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";

// Core user table backing auth flow
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Properties table
export const properties = mysqlTable("properties", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  realPropertyName: varchar("realPropertyName", { length: 255 }),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  shortDescription: text("shortDescription"),
  longDescription: text("longDescription"),
  region: mysqlEnum("region", ["Philippines", "SouthEastAsia", "Maldives", "Europe", "NorthAmerica", "Caribbean"]).notNull(),
  continent: varchar("continent", { length: 50 }),
  country: varchar("country", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }),
  address: text("address"),
  propertyType: mysqlEnum("propertyType", ["Hospitality", "Island", "Resort", "CityHotel", "CountrysideHotel", "MixedUse", "Office", "CityLand", "Land", "Residential", "Retail", "Commercial", "Lot", "HouseAndLot"]).notNull(),
  assetClass: mysqlEnum("assetClass", ["Hospitality", "Commercial", "Residential", "MixedUse", "Land"]),
  landSizeSqm: decimal("landSizeSqm", { precision: 15, scale: 2 }),
  landSizeHa: decimal("landSizeHa", { precision: 15, scale: 4 }),
  landPricePerSqm: decimal("landPricePerSqm", { precision: 15, scale: 2 }),
  buildingAreaSqm: decimal("buildingAreaSqm", { precision: 15, scale: 2 }),
  floorAreaSqm: decimal("floorAreaSqm", { precision: 15, scale: 2 }),
  floors: int("floors"),
  units: int("units"),
  unitsDetails: text("unitsDetails"),
  floorAreaRatio: decimal("floorAreaRatio", { precision: 5, scale: 2 }),
  askingPriceNet: decimal("askingPriceNet", { precision: 15, scale: 2 }),
  askingPriceGross: decimal("askingPriceGross", { precision: 15, scale: 2 }),
  incomeGenerating: boolean("incomeGenerating").default(false),
  incomeDetails: text("incomeDetails"),
  priceMin: decimal("priceMin", { precision: 15, scale: 2 }),
  priceMax: decimal("priceMax", { precision: 15, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("USD"),
  roiPercent: decimal("roiPercent", { precision: 5, scale: 2 }),
  possibleRoiPercent: decimal("possibleRoiPercent", { precision: 5, scale: 2 }),
  expectedReturn: decimal("expectedReturn", { precision: 5, scale: 2 }),
  investmentTimeline: varchar("investmentTimeline", { length: 50 }),
  size: varchar("size", { length: 100 }),
  sizeUnit: varchar("sizeUnit", { length: 20 }),
  bedrooms: int("bedrooms"),
  bathrooms: int("bathrooms"),
  yearBuilt: int("yearBuilt"),
  features: json("features").$type<string[]>(),
  amenities: json("amenities").$type<string[]>(),
  interiorFeatures: json("interiorFeatures").$type<string[]>(),
  exteriorFeatures: json("exteriorFeatures").$type<string[]>(),
  images: json("images").$type<string[]>(),
  imageCaptions: json("imageCaptions").$type<Record<string, string>>(),
  mainImage: text("mainImage"),
  floorPlan: text("floorPlan"),
  videoUrl: text("videoUrl"),
  virtualTourUrl: text("virtualTourUrl"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  status: mysqlEnum("status", ["available", "reserved", "sold", "offMarket"]).default("available"),
  offMarket: boolean("offMarket").default(false),
  others: text("others"),
  featured: boolean("featured").default(false),
  views: int("views").default(0),
  seoTitle: varchar("seoTitle", { length: 255 }),
  seoDescription: text("seoDescription"),
  seoKeywords: text("seoKeywords"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Property = typeof properties.$inferSelect;
export type InsertProperty = typeof properties.$inferInsert;

// Services table
export const services = mysqlTable("services", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  shortDescription: text("shortDescription"),
  fullDescription: text("fullDescription"),
  icon: varchar("icon", { length: 100 }),
  image: text("image"),
  features: json("features").$type<string[]>(),
  order: int("order").default(0),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;

// Locations (for global presence)
export const locations = mysqlTable("locations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  region: varchar("region", { length: 100 }),
  description: text("description"),
  image: text("image"),
  projectCount: int("projectCount").default(0),
  specialization: varchar("specialization", { length: 255 }),
  order: int("order").default(0),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Location = typeof locations.$inferSelect;
export type InsertLocation = typeof locations.$inferInsert;

// Team members
export const teamMembers = mysqlTable("team_members", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 255 }).notNull(),
  bio: text("bio"),
  shortBio: text("short_bio"),
  photo: text("image"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  linkedIn: text("linkedin"),
  location: varchar("location", { length: 255 }),
  calendlyUrl: text("calendly_url"),
  googleMeetUrl: text("google_meet_url"),
  teamsUrl: text("teams_url"),
  zoomUrl: text("zoom_url"),
  isExpert: boolean("is_expert").default(false),
  order: int("order").default(0),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = typeof teamMembers.$inferInsert;

// Success stories
export const successStories = mysqlTable("success_stories", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  clientName: varchar("clientName", { length: 255 }),
  clientType: mysqlEnum("clientType", ["FamilyOffice", "PrivateInvestor", "Institutional", "Developer", "Partner"]),
  location: varchar("location", { length: 255 }),
  propertyType: varchar("propertyType", { length: 100 }),
  investmentAmount: varchar("investmentAmount", { length: 100 }),
  returnAchieved: varchar("returnAchieved", { length: 100 }),
  timeline: varchar("timeline", { length: 100 }),
  shortDescription: text("shortDescription"),
  fullStory: text("fullStory"),
  challenge: text("challenge"),
  solution: text("solution"),
  results: text("results"),
  testimonial: text("testimonial"),
  image: text("image"),
  images: json("images").$type<string[]>(),
  featured: boolean("featured").default(false),
  featuredMonth: varchar("featuredMonth", { length: 7 }),
  tags: json("tags").$type<string[]>(),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SuccessStory = typeof successStories.$inferSelect;
export type InsertSuccessStory = typeof successStories.$inferInsert;

// Market reports
export const marketReports = mysqlTable("market_reports", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  region: varchar("region", { length: 100 }),
  fileUrl: text("fileUrl"),
  thumbnailUrl: text("thumbnailUrl"),
  downloadCount: int("downloadCount").default(0),
  isActive: boolean("isActive").default(true),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MarketReport = typeof marketReports.$inferSelect;
export type InsertMarketReport = typeof marketReports.$inferInsert;

// Leads
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  firstName: varchar("firstName", { length: 100 }),
  lastName: varchar("lastName", { length: 100 }),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  company: varchar("company", { length: 255 }),
  investorType: mysqlEnum("investorType", ["FamilyOffice", "PrivateInvestor", "Institutional", "Developer", "Partner", "Other"]),
  investmentRange: varchar("investmentRange", { length: 100 }),
  interestedRegions: json("interestedRegions").$type<string[]>(),
  interestedPropertyTypes: json("interestedPropertyTypes").$type<string[]>(),
  message: text("message"),
  source: varchar("source", { length: 100 }),
  sourcePage: varchar("sourcePage", { length: 255 }),
  utmSource: varchar("utmSource", { length: 100 }),
  utmMedium: varchar("utmMedium", { length: 100 }),
  utmCampaign: varchar("utmCampaign", { length: 100 }),
  propertyId: int("propertyId"),
  status: mysqlEnum("status", ["new", "contacted", "qualified", "converted", "lost"]).default("new"),
  score: int("score").default(0),
  notes: text("notes"),
  adminResponse: text("adminResponse"),
  respondedAt: timestamp("respondedAt"),
  respondedBy: int("respondedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

// Bookings (Virtual Tour Appointments)
export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  propertyId: int("propertyId"),
  leadId: int("leadId"),
  expertId: int("expertId"),
  type: mysqlEnum("type", ["GoogleMeet", "Teams", "Zoom", "Phone"]).notNull(),
  scheduledAt: timestamp("scheduledAt").notNull(),
  duration: int("duration").default(30),
  timezone: varchar("timezone", { length: 100 }),
  meetingUrl: text("meetingUrl"),
  status: mysqlEnum("status", ["scheduled", "confirmed", "completed", "cancelled", "rescheduled"]).default("scheduled"),
  notes: text("notes"),
  userEmail: varchar("userEmail", { length: 320 }),
  userName: varchar("userName", { length: 255 }),
  reminderSent: boolean("reminderSent").default(false),
  confirmedAt: timestamp("confirmedAt"),
  confirmedBy: int("confirmedBy"),
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

// Agent Availability
export const agentAvailability = mysqlTable("agent_availability", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull(),
  dayOfWeek: int("dayOfWeek").notNull(), // 0-6 (Sunday-Saturday)
  startTime: varchar("startTime", { length: 5 }).notNull(), // HH:MM format
  endTime: varchar("endTime", { length: 5 }).notNull(), // HH:MM format
  timezone: varchar("timezone", { length: 100 }).default("UTC"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AgentAvailability = typeof agentAvailability.$inferSelect;
export type InsertAgentAvailability = typeof agentAvailability.$inferInsert;

// Tour Feedback
export const tourFeedback = mysqlTable("tour_feedback", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("bookingId").notNull(),
  userId: int("userId").notNull(),
  propertyId: int("propertyId").notNull(),
  rating: int("rating").notNull(), // 1-5 stars
  tourQuality: int("tourQuality"), // 1-5 rating for tour experience
  propertyInterest: mysqlEnum("propertyInterest", ["very_interested", "interested", "neutral", "not_interested"]),
  wouldRecommend: boolean("wouldRecommend"),
  comments: text("comments"),
  nextSteps: mysqlEnum("nextSteps", ["schedule_visit", "request_info", "make_offer", "not_ready", "other"]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TourFeedback = typeof tourFeedback.$inferSelect;
export type InsertTourFeedback = typeof tourFeedback.$inferInsert;

// Market alerts subscriptions
export const marketAlerts = mysqlTable("market_alerts", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  name: varchar("name", { length: 255 }),
  regions: json("regions").$type<string[]>(),
  propertyTypes: json("propertyTypes").$type<string[]>(),
  priceRange: varchar("priceRange", { length: 100 }),
  frequency: mysqlEnum("frequency", ["daily", "weekly", "monthly"]).default("weekly"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MarketAlert = typeof marketAlerts.$inferSelect;
export type InsertMarketAlert = typeof marketAlerts.$inferInsert;

// Site settings (for editable content)
export const siteSettings = mysqlTable("site_settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  type: mysqlEnum("type", ["text", "number", "json", "html"]).default("text"),
  category: varchar("category", { length: 100 }),
  description: text("description"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = typeof siteSettings.$inferInsert;

// Portfolio statistics
export const portfolioStats = mysqlTable("portfolio_stats", {
  id: int("id").autoincrement().primaryKey(),
  label: varchar("label", { length: 100 }).notNull(),
  value: varchar("value", { length: 100 }).notNull(),
  suffix: varchar("suffix", { length: 20 }),
  order: int("order").default(0),
  isActive: boolean("isActive").default(true),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PortfolioStat = typeof portfolioStats.$inferSelect;
export type InsertPortfolioStat = typeof portfolioStats.$inferInsert;

// Analytics events
export const analyticsEvents = mysqlTable("analytics_events", {
  id: int("id").autoincrement().primaryKey(),
  eventType: varchar("eventType", { length: 100 }).notNull(),
  eventData: json("eventData"),
  page: varchar("page", { length: 255 }),
  propertyId: int("propertyId"),
  sessionId: varchar("sessionId", { length: 100 }),
  userId: int("userId"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  referrer: text("referrer"),
  utmSource: varchar("utmSource", { length: 100 }),
  utmMedium: varchar("utmMedium", { length: 100 }),
  utmCampaign: varchar("utmCampaign", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = typeof analyticsEvents.$inferInsert;

// FX rates cache
export const fxRates = mysqlTable("fx_rates", {
  id: int("id").autoincrement().primaryKey(),
  baseCurrency: varchar("baseCurrency", { length: 3 }).notNull(),
  targetCurrency: varchar("targetCurrency", { length: 3 }).notNull(),
  rate: decimal("rate", { precision: 20, scale: 10 }).notNull(),
  source: varchar("source", { length: 100 }),
  fetchedAt: timestamp("fetchedAt").defaultNow().notNull(),
});

export type FxRate = typeof fxRates.$inferSelect;
export type InsertFxRate = typeof fxRates.$inferInsert;

// Legal pages (Terms of Service, Privacy Policy, Imprint)
export const legalPages = mysqlTable("legal_pages", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  metaTitle: varchar("metaTitle", { length: 255 }),
  metaDescription: text("metaDescription"),
  isActive: boolean("isActive").default(true),
  order: int("order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LegalPage = typeof legalPages.$inferSelect;
export type InsertLegalPage = typeof legalPages.$inferInsert;

// Saved Searches table
export const savedSearches = mysqlTable("saved_searches", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  filters: json("filters").$type<{
    region?: string;
    country?: string;
    propertyType?: string;
    priceMin?: number;
    priceMax?: number;
    bedrooms?: number;
    status?: string;
  }>().notNull(),
  notificationsEnabled: boolean("notificationsEnabled").default(true),
  lastNotified: timestamp("lastNotified"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SavedSearch = typeof savedSearches.$inferSelect;
export type InsertSavedSearch = typeof savedSearches.$inferInsert;

// Wishlist table
export const wishlist = mysqlTable("wishlist", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  propertyId: int("propertyId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Wishlist = typeof wishlist.$inferSelect;
export type InsertWishlist = typeof wishlist.$inferInsert;

// Downloads tracking table
export const downloads = mysqlTable("downloads", {
  id: int("id").autoincrement().primaryKey(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  resourceType: mysqlEnum("resourceType", ["report", "brochure", "photo", "document", "guide"]).notNull(),
  resourceId: int("resourceId"), // ID of the report, property, etc.
  resourceTitle: varchar("resourceTitle", { length: 255 }),
  resourceUrl: text("resourceUrl"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Download = typeof downloads.$inferSelect;
export type InsertDownload = typeof downloads.$inferInsert;

// Download Tags for lead segmentation
export const downloadTags = mysqlTable("download_tags", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  color: varchar("color", { length: 7 }).notNull(), // Hex color code
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DownloadTag = typeof downloadTags.$inferSelect;
export type InsertDownloadTag = typeof downloadTags.$inferInsert;

// Many-to-many relationship between downloads and tags
export const downloadTagAssignments = mysqlTable("download_tag_assignments", {
  id: int("id").autoincrement().primaryKey(),
  downloadId: int("downloadId").notNull(),
  tagId: int("tagId").notNull(),
  assignedAt: timestamp("assignedAt").defaultNow().notNull(),
});

export type DownloadTagAssignment = typeof downloadTagAssignments.$inferSelect;
export type InsertDownloadTagAssignment = typeof downloadTagAssignments.$inferInsert;

// Resources library for downloadable documents
export const resources = mysqlTable("resources", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", ["investment_guide", "market_report", "property_brochure", "case_study", "whitepaper", "newsletter"]).notNull(),
  fileUrl: text("fileUrl").notNull(), // S3 URL or external link
  fileType: varchar("fileType", { length: 50 }), // PDF, DOCX, etc.
  fileSizeKb: int("fileSizeKb"),
  thumbnailUrl: text("thumbnailUrl"),
  isActive: boolean("isActive").default(true).notNull(),
  requiresEmail: boolean("requiresEmail").default(true).notNull(), // Capture lead info before download
  downloadCount: int("downloadCount").default(0).notNull(),
  order: int("order").default(0).notNull(), // Display order
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Resource = typeof resources.$inferSelect;
export type InsertResource = typeof resources.$inferInsert;
