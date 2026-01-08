CREATE TABLE `analytics_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventType` varchar(100) NOT NULL,
	`eventData` json,
	`page` varchar(255),
	`propertyId` int,
	`sessionId` varchar(100),
	`userId` int,
	`ipAddress` varchar(45),
	`userAgent` text,
	`referrer` text,
	`utmSource` varchar(100),
	`utmMedium` varchar(100),
	`utmCampaign` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int,
	`expertId` int,
	`type` enum('GoogleMeet','Teams','Zoom','Phone') NOT NULL,
	`scheduledAt` timestamp NOT NULL,
	`duration` int DEFAULT 30,
	`timezone` varchar(100),
	`meetingUrl` text,
	`status` enum('scheduled','confirmed','completed','cancelled','rescheduled') DEFAULT 'scheduled',
	`notes` text,
	`reminderSent` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fx_rates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`baseCurrency` varchar(3) NOT NULL,
	`targetCurrency` varchar(3) NOT NULL,
	`rate` decimal(20,10) NOT NULL,
	`source` varchar(100),
	`fetchedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fx_rates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firstName` varchar(100),
	`lastName` varchar(100),
	`email` varchar(320) NOT NULL,
	`phone` varchar(50),
	`company` varchar(255),
	`investorType` enum('FamilyOffice','PrivateInvestor','Institutional','Developer','Partner','Other'),
	`investmentRange` varchar(100),
	`interestedRegions` json,
	`interestedPropertyTypes` json,
	`message` text,
	`source` varchar(100),
	`sourcePage` varchar(255),
	`utmSource` varchar(100),
	`utmMedium` varchar(100),
	`utmCampaign` varchar(100),
	`propertyId` int,
	`status` enum('new','contacted','qualified','converted','lost') DEFAULT 'new',
	`score` int DEFAULT 0,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `locations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`country` varchar(100) NOT NULL,
	`region` varchar(100),
	`description` text,
	`image` text,
	`projectCount` int DEFAULT 0,
	`specialization` varchar(255),
	`order` int DEFAULT 0,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `locations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `market_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(255),
	`regions` json,
	`propertyTypes` json,
	`priceRange` varchar(100),
	`frequency` enum('daily','weekly','monthly') DEFAULT 'weekly',
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `market_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `market_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100),
	`region` varchar(100),
	`fileUrl` text,
	`thumbnailUrl` text,
	`downloadCount` int DEFAULT 0,
	`isActive` boolean DEFAULT true,
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `market_reports_id` PRIMARY KEY(`id`),
	CONSTRAINT `market_reports_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `portfolio_stats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`label` varchar(100) NOT NULL,
	`value` varchar(100) NOT NULL,
	`suffix` varchar(20),
	`order` int DEFAULT 0,
	`isActive` boolean DEFAULT true,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `portfolio_stats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `properties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`shortDescription` text,
	`region` enum('SouthEastAsia','Maldives','MiddleEast','Europe','NorthAmerica','Caribbean','SouthAmerica') NOT NULL,
	`country` varchar(100) NOT NULL,
	`city` varchar(100),
	`address` text,
	`propertyType` enum('Hospitality','Island','Resort','CityHotel','CountrysideHotel','MixedUse','Office','CityLand','Land','Residential','Retail','Commercial','Lot','HouseAndLot') NOT NULL,
	`priceMin` decimal(15,2),
	`priceMax` decimal(15,2),
	`currency` varchar(3) DEFAULT 'USD',
	`expectedReturn` decimal(5,2),
	`investmentTimeline` varchar(50),
	`size` varchar(100),
	`sizeUnit` varchar(20),
	`bedrooms` int,
	`bathrooms` int,
	`yearBuilt` int,
	`features` json,
	`amenities` json,
	`images` json,
	`mainImage` text,
	`floorPlan` text,
	`videoUrl` text,
	`virtualTourUrl` text,
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`status` enum('available','pending','sold','offMarket') DEFAULT 'available',
	`featured` boolean DEFAULT false,
	`views` int DEFAULT 0,
	`seoTitle` varchar(255),
	`seoDescription` text,
	`seoKeywords` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `properties_id` PRIMARY KEY(`id`),
	CONSTRAINT `properties_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`shortDescription` text,
	`fullDescription` text,
	`icon` varchar(100),
	`image` text,
	`features` json,
	`order` int DEFAULT 0,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `services_id` PRIMARY KEY(`id`),
	CONSTRAINT `services_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `site_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text,
	`type` enum('text','number','json','html') DEFAULT 'text',
	`category` varchar(100),
	`description` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `site_settings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `success_stories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`clientName` varchar(255),
	`clientType` enum('FamilyOffice','PrivateInvestor','Institutional','Developer','Partner'),
	`location` varchar(255),
	`propertyType` varchar(100),
	`investmentAmount` varchar(100),
	`returnAchieved` varchar(100),
	`timeline` varchar(100),
	`shortDescription` text,
	`fullStory` text,
	`challenge` text,
	`solution` text,
	`results` text,
	`testimonial` text,
	`image` text,
	`images` json,
	`featured` boolean DEFAULT false,
	`featuredMonth` varchar(7),
	`tags` json,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `success_stories_id` PRIMARY KEY(`id`),
	CONSTRAINT `success_stories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `team_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`role` varchar(255) NOT NULL,
	`bio` text,
	`shortBio` text,
	`photo` text,
	`email` varchar(320),
	`phone` varchar(50),
	`linkedIn` text,
	`calendlyUrl` text,
	`googleMeetUrl` text,
	`teamsUrl` text,
	`zoomUrl` text,
	`isExpert` boolean DEFAULT false,
	`order` int DEFAULT 0,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `team_members_id` PRIMARY KEY(`id`)
);
