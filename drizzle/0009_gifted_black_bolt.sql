ALTER TABLE `bookings` ADD `confirmedAt` timestamp;--> statement-breakpoint
ALTER TABLE `bookings` ADD `confirmedBy` int;--> statement-breakpoint
ALTER TABLE `bookings` ADD `adminNotes` text;