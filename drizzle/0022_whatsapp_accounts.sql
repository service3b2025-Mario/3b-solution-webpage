-- WhatsApp Team Accounts Tables (MySQL/TiDB)
-- Migration: 0022_whatsapp_accounts

CREATE TABLE IF NOT EXISTS `whatsapp_accounts` (
  `id` int AUTO_INCREMENT NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` varchar(100) NOT NULL,
  `title` varchar(255),
  `phone_number` varchar(50) NOT NULL,
  `country_code` varchar(10) NOT NULL DEFAULT '+49',
  `display_order` int DEFAULT 0,
  `is_active` boolean DEFAULT true,
  `is_visible` boolean DEFAULT true,
  `avatar_url` text,
  `team_member_id` int,
  `default_message` text,
  `visible_on_pages` text,
  `total_clicks` int DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `whatsapp_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `whatsapp_clicks` (
  `id` int AUTO_INCREMENT NOT NULL,
  `account_id` int NOT NULL,
  `page_path` varchar(255),
  `page_title` varchar(255),
  `property_id` int,
  `visitor_id` varchar(100),
  `user_agent` text,
  `referrer` text,
  `utm_source` varchar(100),
  `utm_medium` varchar(100),
  `utm_campaign` varchar(100),
  `clicked_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `whatsapp_clicks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_whatsapp_accounts_active` ON `whatsapp_accounts` (`is_active`, `is_visible`);
--> statement-breakpoint
CREATE INDEX `idx_whatsapp_accounts_order` ON `whatsapp_accounts` (`display_order`);
--> statement-breakpoint
CREATE INDEX `idx_whatsapp_clicks_account` ON `whatsapp_clicks` (`account_id`);
--> statement-breakpoint
CREATE INDEX `idx_whatsapp_clicks_date` ON `whatsapp_clicks` (`clicked_at`);
