CREATE TABLE `artifact_imports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceName` varchar(160) NOT NULL,
	`importedCount` int NOT NULL,
	`status` varchar(32) NOT NULL,
	`detail` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `artifact_imports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `operation_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`operationKey` varchar(64) NOT NULL,
	`label` varchar(160) NOT NULL,
	`status` varchar(32) NOT NULL,
	`detail` text NOT NULL,
	`metadataJson` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `operation_snapshots_id` PRIMARY KEY(`id`),
	CONSTRAINT `operation_snapshots_operationKey_unique` UNIQUE(`operationKey`)
);
--> statement-breakpoint
CREATE TABLE `reels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reelId` varchar(32) NOT NULL,
	`sequence` int NOT NULL,
	`batchId` varchar(24) NOT NULL,
	`domain` varchar(128) NOT NULL,
	`angle` varchar(128) NOT NULL,
	`format` varchar(160) NOT NULL,
	`language` varchar(24) NOT NULL,
	`durationTargetSeconds` int NOT NULL,
	`aspectRatio` varchar(16) NOT NULL,
	`researchStatus` varchar(64) NOT NULL,
	`scriptStatus` varchar(64) NOT NULL,
	`mediaStatus` varchar(64) NOT NULL,
	`qcStatus` varchar(64) NOT NULL,
	`driveStatus` varchar(64) NOT NULL,
	`sourceRefsJson` text NOT NULL,
	`artifactMetaJson` text NOT NULL,
	`summary` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reels_id` PRIMARY KEY(`id`),
	CONSTRAINT `reels_reelId_unique` UNIQUE(`reelId`),
	CONSTRAINT `reels_sequence_unique` UNIQUE(`sequence`)
);
--> statement-breakpoint
CREATE INDEX `artifact_import_source_idx` ON `artifact_imports` (`sourceName`);--> statement-breakpoint
CREATE INDEX `operation_status_idx` ON `operation_snapshots` (`status`);--> statement-breakpoint
CREATE INDEX `reels_batch_idx` ON `reels` (`batchId`);--> statement-breakpoint
CREATE INDEX `reels_domain_idx` ON `reels` (`domain`);--> statement-breakpoint
CREATE INDEX `reels_drive_status_idx` ON `reels` (`driveStatus`);