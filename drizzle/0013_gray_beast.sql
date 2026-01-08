ALTER TABLE `properties` ADD `assetClass` enum('Hospitality','Commercial','Residential','MixedUse','Land');--> statement-breakpoint
ALTER TABLE `properties` ADD `landSizeSqm` decimal(15,2);--> statement-breakpoint
ALTER TABLE `properties` ADD `landSizeHa` decimal(15,4);--> statement-breakpoint
ALTER TABLE `properties` ADD `buildingAreaSqm` decimal(15,2);--> statement-breakpoint
ALTER TABLE `properties` ADD `floorAreaSqm` decimal(15,2);--> statement-breakpoint
ALTER TABLE `properties` ADD `floors` int;--> statement-breakpoint
ALTER TABLE `properties` ADD `units` int;--> statement-breakpoint
ALTER TABLE `properties` ADD `unitsDetails` text;--> statement-breakpoint
ALTER TABLE `properties` ADD `floorAreaRatio` decimal(5,2);--> statement-breakpoint
ALTER TABLE `properties` ADD `askingPriceNet` decimal(15,2);--> statement-breakpoint
ALTER TABLE `properties` ADD `askingPriceGross` decimal(15,2);--> statement-breakpoint
ALTER TABLE `properties` ADD `incomeGenerating` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `properties` ADD `incomeDetails` text;--> statement-breakpoint
ALTER TABLE `properties` ADD `interiorFeatures` json;--> statement-breakpoint
ALTER TABLE `properties` ADD `exteriorFeatures` json;--> statement-breakpoint
ALTER TABLE `properties` ADD `others` text;