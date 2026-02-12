ALTER TABLE `tours` ADD `slug` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `tours` ADD `includedItems` text;--> statement-breakpoint
ALTER TABLE `tours` ADD `itinerary` text;--> statement-breakpoint
ALTER TABLE `tours` ADD CONSTRAINT `tours_slug_unique` UNIQUE(`slug`);