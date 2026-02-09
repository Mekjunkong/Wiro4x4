CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`action` varchar(50) NOT NULL,
	`resourceType` varchar(50) NOT NULL,
	`resourceId` int,
	`oldValue` text,
	`newValue` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scheduledEmails` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('reminder','feedback','lead_alert','daily_summary') NOT NULL,
	`targetId` int,
	`targetEmail` varchar(320),
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	`status` enum('sent','failed') NOT NULL DEFAULT 'sent',
	CONSTRAINT `scheduledEmails_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscribers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(255),
	`language` varchar(10) DEFAULT 'en',
	`subscribedAt` timestamp NOT NULL DEFAULT (now()),
	`isActive` int NOT NULL DEFAULT 1,
	CONSTRAINT `subscribers_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscribers_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `bookings` ADD `reminderSentAt` timestamp;--> statement-breakpoint
ALTER TABLE `bookings` ADD `feedbackSentAt` timestamp;--> statement-breakpoint
ALTER TABLE `leads` ADD `score` int DEFAULT 0;--> statement-breakpoint
CREATE INDEX `idx_auditLogs_userId` ON `auditLogs` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_auditLogs_resourceType_resourceId` ON `auditLogs` (`resourceType`,`resourceId`);--> statement-breakpoint
CREATE INDEX `idx_scheduledEmails_type_targetId` ON `scheduledEmails` (`type`,`targetId`);--> statement-breakpoint
CREATE INDEX `idx_bookings_assignedAgentId` ON `bookings` (`assignedAgentId`);--> statement-breakpoint
CREATE INDEX `idx_bookings_status_createdAt` ON `bookings` (`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_financialRecords_bookingId` ON `financialRecords` (`bookingId`);--> statement-breakpoint
CREATE INDEX `idx_leads_convertedToBookingId` ON `leads` (`convertedToBookingId`);--> statement-breakpoint
CREATE INDEX `idx_payments_bookingId` ON `payments` (`bookingId`);