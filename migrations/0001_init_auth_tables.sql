CREATE TABLE users (
	id TEXT PRIMARY KEY NOT NULL,
	full_name TEXT NOT NULL,
	email TEXT NOT NULL UNIQUE COLLATE NOCASE,
	password_hash TEXT NOT NULL,
	created_at INTEGER NOT NULL
);

CREATE INDEX idx_users_email ON users(email);
