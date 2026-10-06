CREATE TABLE `ai_cache` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`source` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `colleges` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`city` text NOT NULL,
	`state` text NOT NULL,
	`is_demo` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `colleges_slug_unique` ON `colleges` (`slug`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`college_id` text,
	`ref_code` text,
	`session_id` text NOT NULL,
	`is_demo` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`college_id`) REFERENCES `colleges`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `events_type_college` ON `events` (`type`,`college_id`);--> statement-breakpoint
CREATE INDEX `events_created_demo` ON `events` (`created_at`,`is_demo`);--> statement-breakpoint
CREATE TABLE `llm_calls` (
	`id` text PRIMARY KEY NOT NULL,
	`feature` text NOT NULL,
	`latency_ms` integer NOT NULL,
	`fallback_used` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `registrations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`college_id` text NOT NULL,
	`branch` text NOT NULL,
	`year` text NOT NULL,
	`idea_text` text NOT NULL,
	`build_card` text NOT NULL,
	`own_code` text NOT NULL,
	`ref_code` text,
	`angle` text,
	`is_ambassador` integer DEFAULT 0 NOT NULL,
	`is_demo` integer DEFAULT 0 NOT NULL,
	`readiness` text DEFAULT '{"laptop":false,"account":false,"repo":false}' NOT NULL,
	`consent_at` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`college_id`) REFERENCES `colleges`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `registrations_email_unique` ON `registrations` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `registrations_own_code_unique` ON `registrations` (`own_code`);--> statement-breakpoint
CREATE INDEX `registrations_college_created` ON `registrations` (`college_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `registrations_ref_demo` ON `registrations` (`ref_code`,`is_demo`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
