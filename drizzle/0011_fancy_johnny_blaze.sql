CREATE TABLE `downloads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fullName` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`resourceType` enum('report','brochure','photo','document','guide') NOT NULL,
	`resourceId` int,
	`resourceTitle` varchar(255),
	`resourceUrl` text,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `downloads_id` PRIMARY KEY(`id`)
);
