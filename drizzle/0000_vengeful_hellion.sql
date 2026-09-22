CREATE TABLE `drops` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`text_content` text,
	`object_key` text,
	`file_name` text,
	`mime_type` text,
	`file_size` integer,
	`access_salt` text,
	`access_hash` text,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL
);
