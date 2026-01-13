-- WhatsApp Team Accounts Tables
-- Migration: 0022_whatsapp_accounts

-- Create WhatsApp Accounts Table
CREATE TABLE IF NOT EXISTS whatsapp_accounts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL,
  title VARCHAR(255),
  phone_number VARCHAR(50) NOT NULL,
  country_code VARCHAR(10) NOT NULL DEFAULT '+49',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_visible BOOLEAN DEFAULT true,
  avatar_url TEXT,
  team_member_id INTEGER,
  default_message TEXT DEFAULT 'Hi! I''m interested in learning more about 3B Solution''s real estate investment opportunities.',
  visible_on_pages TEXT DEFAULT '["contact", "team", "about", "property"]',
  total_clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create WhatsApp Clicks Tracking Table
CREATE TABLE IF NOT EXISTS whatsapp_clicks (
  id SERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES whatsapp_accounts(id) ON DELETE CASCADE,
  page_path VARCHAR(255),
  page_title VARCHAR(255),
  property_id INTEGER,
  visitor_id VARCHAR(100),
  user_agent TEXT,
  referrer TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  clicked_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_accounts_active ON whatsapp_accounts(is_active, is_visible);
CREATE INDEX IF NOT EXISTS idx_whatsapp_accounts_order ON whatsapp_accounts(display_order);
CREATE INDEX IF NOT EXISTS idx_whatsapp_clicks_account ON whatsapp_clicks(account_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_clicks_date ON whatsapp_clicks(clicked_at);
