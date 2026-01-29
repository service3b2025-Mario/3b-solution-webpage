-- Migration: Legal Page Enhancements
-- Adds version history, site settings, and consent logging

-- =====================================================
-- LEGAL PAGE VERSIONS TABLE
-- Tracks version history for legal pages
-- =====================================================

CREATE TABLE IF NOT EXISTS `legal_page_versions` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `legal_page_id` int NOT NULL,
  `version_number` int NOT NULL DEFAULT 1,
  `title` varchar(255) NOT NULL,
  `content` text,
  `meta_title` varchar(255),
  `meta_description` text,
  `changed_by` varchar(255) DEFAULT 'admin',
  `change_summary` varchar(500),
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_legal_page_versions` (`legal_page_id`, `version_number` DESC)
);

-- =====================================================
-- SITE SETTINGS TABLE
-- Stores configurable placeholder values for legal pages
-- =====================================================

CREATE TABLE IF NOT EXISTS `site_settings` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `setting_key` varchar(100) NOT NULL UNIQUE,
  `setting_value` text,
  `setting_type` varchar(20) DEFAULT 'text',
  `category` varchar(50) DEFAULT 'general',
  `description` varchar(500),
  `is_sensitive` boolean DEFAULT false,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_settings_category` (`category`)
);

-- =====================================================
-- CONSENT LOGS TABLE (GDPR Requirement)
-- Logs user cookie consent for compliance
-- =====================================================

CREATE TABLE IF NOT EXISTS `consent_logs` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `session_id` varchar(255),
  `ip_address` varchar(45),
  `user_agent` text,
  `consent_essential` boolean DEFAULT true,
  `consent_analytics` boolean DEFAULT false,
  `consent_marketing` boolean DEFAULT false,
  `ccpa_opt_out` boolean DEFAULT false,
  `consent_timestamp` timestamp DEFAULT CURRENT_TIMESTAMP,
  `consent_version` varchar(20) DEFAULT '1.0',
  INDEX `idx_consent_session` (`session_id`),
  INDEX `idx_consent_timestamp` (`consent_timestamp`)
);

-- =====================================================
-- ADD VERSION COLUMN TO LEGAL PAGES
-- =====================================================

ALTER TABLE `legal_pages` ADD COLUMN IF NOT EXISTS `current_version` int DEFAULT 1;

-- =====================================================
-- INSERT DEFAULT PLACEHOLDER SETTINGS
-- =====================================================

INSERT IGNORE INTO `site_settings` (`setting_key`, `setting_value`, `category`, `description`) VALUES
-- Contact Information
('phone', '', 'contact', 'German business phone number (required by TMG)'),
('fax', '', 'contact', 'Fax number (optional)'),
('email', 'info@3bsolution.de', 'contact', 'Main business email'),

-- Business Registration
('gewerbeamt_city', '', 'registration', 'City that issued the Gewerbeschein'),
('gewerbeschein_number', '', 'registration', 'Gewerbeschein registration number'),
('registration_date', '', 'registration', 'Date of business registration'),

-- IHK Information
('ihk_region', '', 'registration', 'IHK region/city (e.g., IHK Potsdam)'),
('ihk_number', '', 'registration', 'IHK membership number'),

-- Tax Information
('finanzamt_city', '', 'tax', 'City of the Finanzamt'),
('steuernummer', '', 'tax', 'Tax number (11-13 digits)'),
('ust_id_nr', '', 'tax', 'VAT ID (DE + 11 digits, if applicable)'),

-- Insurance
('insurance_company', '', 'insurance', 'Professional liability insurance company'),
('policy_number', '', 'insurance', 'Insurance policy number'),
('coverage_amount', '', 'insurance', 'Coverage amount (e.g., EUR 1,000,000)'),
('insurance_valid_until', '', 'insurance', 'Insurance expiry date'),

-- Licensing
('license_34c_date', '', 'licensing', '34c GewO license issue date'),
('license_34c_valid_until', '', 'licensing', '34c GewO license expiry date'),
('license_34f_number', '', 'licensing', '34f GewO registration number'),

-- DPO Information (Pre-filled)
('dpo_name', 'Mario Bock', 'legal', 'Data Protection Officer name'),
('dpo_phone', '+8613701368354', 'legal', 'Data Protection Officer phone'),
('georg_mobile', '+4917656787896', 'legal', 'Georg Blascheck mobile number');
