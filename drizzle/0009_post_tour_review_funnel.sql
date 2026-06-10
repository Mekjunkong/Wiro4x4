ALTER TABLE `reviews` ADD `bookingId` int;--> statement-breakpoint
ALTER TABLE `reviews` ADD `reviewRequestId` int;--> statement-breakpoint
ALTER TABLE `reviews` ADD `source` varchar(50) DEFAULT 'website';--> statement-breakpoint
CREATE TABLE `postTourReviewRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingId` int NOT NULL,
	`phoneNumber` varchar(50) NOT NULL,
	`customerName` varchar(255),
	`language` enum('en','he') NOT NULL DEFAULT 'en',
	`status` enum('scheduled','sent','opened','clicked','reviewed','failed') NOT NULL DEFAULT 'scheduled',
	`scheduledAt` timestamp NOT NULL,
	`sentAt` timestamp,
	`openedAt` timestamp,
	`clickedAt` timestamp,
	`reviewedAt` timestamp,
	`rating` int,
	`comments` text,
	`whatsappMessageId` varchar(255),
	`reviewUrl` varchar(1024),
	`opsFollowUpUrl` varchar(1024),
	`escalatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `postTourReviewRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_postTourReview_bookingId` ON `postTourReviewRequests` (`bookingId`);--> statement-breakpoint
CREATE INDEX `idx_postTourReview_status_scheduledAt` ON `postTourReviewRequests` (`status`,`scheduledAt`);--> statement-breakpoint
CREATE INDEX `idx_postTourReview_whatsappMessageId` ON `postTourReviewRequests` (`whatsappMessageId`);
