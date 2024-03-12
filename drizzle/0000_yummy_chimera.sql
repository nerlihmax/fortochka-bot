CREATE TABLE `users` (
	`tg_id` integer PRIMARY KEY NOT NULL,
	`tg_displayname` text NOT NULL,
	`fortnite_id` text NOT NULL,
	`fortnite_nickname` text NOT NULL,
	`wins` integer DEFAULT 0,
	`level` integer DEFAULT 0,
	`kills` integer DEFAULT 0,
	`kd` real DEFAULT 0,
	`matches` integer DEFAULT 0,
	`played` integer DEFAULT 0
);
