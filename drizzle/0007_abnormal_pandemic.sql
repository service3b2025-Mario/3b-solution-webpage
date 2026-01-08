CREATE TABLE `tour_feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingId` int NOT NULL,
	`userId` int NOT NULL,
	`propertyId` int NOT NULL,
	`rating` int NOT NULL,
	`tourQuality` int,
	`propertyInterest` enum('very_interested','interested','neutral','not_interested'),
	`wouldRecommend` boolean,
	`comments` text,
	`nextSteps` enum('schedule_visit','request_info','make_offer','not_ready','other'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tour_feedback_id` PRIMARY KEY(`id`)
);
