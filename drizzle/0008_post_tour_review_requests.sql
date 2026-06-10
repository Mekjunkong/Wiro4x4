CREATE TABLE `postTourReviewEvents` (
  `id` int AUTO_INCREMENT NOT NULL,
  `bookingId` int,
  `channel` enum('whatsapp') NOT NULL DEFAULT 'whatsapp',
  `state` enum('request_sent','response_received','follow_up_sent') NOT NULL,
  `guestReference` varchar(255) NOT NULL,
  `guestPhone` varchar(50),
  `guestName` varchar(255),
  `externalMessageId` varchar(255),
  `dedupeKey` varchar(255) NOT NULL,
  `metadata` json,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `postTourReviewEvents_id` PRIMARY KEY(`id`),
  CONSTRAINT `postTourReviewEvents_dedupeKey_unique` UNIQUE(`dedupeKey`)
);
--> statement-breakpoint
CREATE INDEX `idx_postTourReviewEvents_bookingId_state` ON `postTourReviewEvents` (`bookingId`,`state`);
--> statement-breakpoint
CREATE INDEX `idx_postTourReviewEvents_guestReference` ON `postTourReviewEvents` (`guestReference`);
--> statement-breakpoint
CREATE INDEX `idx_postTourReviewEvents_externalMessageId` ON `postTourReviewEvents` (`externalMessageId`);
