ALTER TABLE `leads` MODIFY COLUMN `email` varchar(320);--> statement-breakpoint
ALTER TABLE `leads` ADD `sourceCode` varchar(120);--> statement-breakpoint
ALTER TABLE `leads` ADD `sourceChannel` varchar(24);--> statement-breakpoint
ALTER TABLE `leads` ADD `landingPage` varchar(240);--> statement-breakpoint
ALTER TABLE `leads` ADD `language` varchar(2);--> statement-breakpoint
ALTER TABLE `leads` ADD `utmSource` varchar(64);--> statement-breakpoint
ALTER TABLE `leads` ADD `utmMedium` varchar(64);--> statement-breakpoint
ALTER TABLE `leads` ADD `utmCampaign` varchar(64);--> statement-breakpoint
ALTER TABLE `leads` ADD `travelDate` timestamp;--> statement-breakpoint
ALTER TABLE `leads` ADD `groupSize` int;--> statement-breakpoint
ALTER TABLE `leads` ADD `estimatedValueThb` int;--> statement-breakpoint
ALTER TABLE `leads` ADD `lostReason` text;--> statement-breakpoint
ALTER TABLE `leads` ADD `completedAt` timestamp;--> statement-breakpoint
CREATE INDEX `idx_leads_sourceCode` ON `leads` (`sourceCode`);--> statement-breakpoint
CREATE INDEX `idx_leads_completedAt` ON `leads` (`completedAt`);
