-- Performance Optimization: Add indexes for frequently queried fields
-- This migration adds database indexes to improve query performance

-- Properties table indexes for filtering and sorting
CREATE INDEX IF NOT EXISTS idx_properties_country ON properties(country);
CREATE INDEX IF NOT EXISTS idx_properties_region ON properties(region);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_propertyType ON properties(propertyType);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(featured);

-- Composite indexes for common filter combinations
CREATE INDEX IF NOT EXISTS idx_properties_country_status ON properties(country, status);
CREATE INDEX IF NOT EXISTS idx_properties_region_type ON properties(region, propertyType);
CREATE INDEX IF NOT EXISTS idx_properties_status_featured ON properties(status, featured);

-- Bookings table indexes for tour management
CREATE INDEX IF NOT EXISTS idx_bookings_userId ON bookings(userId);
CREATE INDEX IF NOT EXISTS idx_bookings_propertyId ON bookings(propertyId);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_meetingDate ON bookings(meetingDate);

-- Leads table indexes for CRM
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_createdAt ON leads(createdAt);

-- Wishlist table indexes for user engagement
CREATE INDEX IF NOT EXISTS idx_wishlist_userId ON wishlist(userId);
CREATE INDEX IF NOT EXISTS idx_wishlist_propertyId ON wishlist(propertyId);

-- Saved searches table indexes
CREATE INDEX IF NOT EXISTS idx_savedSearches_userId ON savedSearches(userId);
CREATE INDEX IF NOT EXISTS idx_savedSearches_notificationsEnabled ON savedSearches(notificationsEnabled);

-- Downloads table indexes for analytics
CREATE INDEX IF NOT EXISTS idx_downloads_email ON downloads(email);
CREATE INDEX IF NOT EXISTS idx_downloads_resourceType ON downloads(resourceType);
CREATE INDEX IF NOT EXISTS idx_downloads_downloadedAt ON downloads(downloadedAt);

-- Market reports table indexes
CREATE INDEX IF NOT EXISTS idx_marketReports_category ON marketReports(category);
CREATE INDEX IF NOT EXISTS idx_marketReports_region ON marketReports(region);
CREATE INDEX IF NOT EXISTS idx_marketReports_isActive ON marketReports(isActive);
