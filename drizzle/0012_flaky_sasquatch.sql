CREATE TABLE `download_tag_assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`downloadId` int NOT NULL,
	`tagId` int NOT NULL,
	`assignedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `download_tag_assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `download_tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`color` varchar(7) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `download_tags_id` PRIMARY KEY(`id`),
	CONSTRAINT `download_tags_name_unique` UNIQUE(`name`)
);
