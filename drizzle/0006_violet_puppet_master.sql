CREATE TABLE `agent_availability` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int NOT NULL,
	`dayOfWeek` int NOT NULL,
	`startTime` varchar(5) NOT NULL,
	`endTime` varchar(5) NOT NULL,
	`timezone` varchar(100) DEFAULT 'UTC',
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agent_availability_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `bookings` ADD `userId` int;--> statement-breakpoint
ALTER TABLE `bookings` ADD `propertyId` int;--> statement-breakpoint
ALTER TABLE `bookings` ADD `userEmail` varchar(320);--> statement-breakpoint
ALTER TABLE `bookings` ADD `userName` varchar(255);