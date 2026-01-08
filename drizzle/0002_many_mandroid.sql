CREATE TABLE `legal_pages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text,
	`metaTitle` varchar(255),
	`metaDescription` text,
	`isActive` boolean DEFAULT true,
	`order` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `legal_pages_id` PRIMARY KEY(`id`),
	CONSTRAINT `legal_pages_slug_unique` UNIQUE(`slug`)
);
