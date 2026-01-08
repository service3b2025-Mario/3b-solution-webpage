CREATE TABLE `resources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`category` enum('investment_guide','market_report','property_brochure','case_study','whitepaper','newsletter') NOT NULL,
	`fileUrl` text NOT NULL,
	`fileType` varchar(50),
	`fileSizeKb` int,
	`thumbnailUrl` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`requiresEmail` boolean NOT NULL DEFAULT true,
	`downloadCount` int NOT NULL DEFAULT 0,
	`order` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `resources_id` PRIMARY KEY(`id`)
);
