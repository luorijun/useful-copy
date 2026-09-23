CREATE TABLE `access_code_sequence` (
	`name` text PRIMARY KEY NOT NULL,
	`next_value` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `drops` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`text_content` text,
	`object_key` text,
	`file_name` text,
	`mime_type` text,
	`file_size` integer,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL
);
