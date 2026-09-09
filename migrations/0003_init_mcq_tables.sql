CREATE TABLE mcqs (
	id TEXT PRIMARY KEY NOT NULL,
	user_id TEXT NOT NULL,
	name TEXT NOT NULL,
	question TEXT NOT NULL,
	created_at INTEGER NOT NULL,
	updated_at INTEGER NOT NULL,
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_mcqs_user_id ON mcqs(user_id);

CREATE TABLE mcq_choices (
	id TEXT PRIMARY KEY NOT NULL,
	mcq_id TEXT NOT NULL,
	choice_text TEXT NOT NULL,
	is_correct INTEGER NOT NULL DEFAULT 0,
	sort_order INTEGER NOT NULL,
	created_at INTEGER NOT NULL,
	FOREIGN KEY (mcq_id) REFERENCES mcqs(id) ON DELETE CASCADE
);

CREATE INDEX idx_mcq_choices_mcq_id ON mcq_choices(mcq_id);

CREATE TABLE mcq_attempts (
	id TEXT PRIMARY KEY NOT NULL,
	mcq_id TEXT NOT NULL,
	user_id TEXT NOT NULL,
	choice_id TEXT NOT NULL,
	is_correct INTEGER NOT NULL,
	created_at INTEGER NOT NULL,
	FOREIGN KEY (mcq_id) REFERENCES mcqs(id) ON DELETE CASCADE,
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY (choice_id) REFERENCES mcq_choices(id)
);

CREATE INDEX idx_mcq_attempts_mcq_id ON mcq_attempts(mcq_id);
CREATE INDEX idx_mcq_attempts_user_id ON mcq_attempts(user_id);
