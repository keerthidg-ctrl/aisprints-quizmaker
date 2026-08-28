import { hashPassword } from "@/lib/auth/password";

export interface UserRecord {
	id: string;
	fullName: string;
	email: string;
	passwordHash: string;
	createdAt: number;
}

interface UserRow {
	id: string;
	full_name: string;
	email: string;
	password_hash: string;
	created_at: number;
}

function mapUser(row: UserRow): UserRecord {
	return {
		id: row.id,
		fullName: row.full_name,
		email: row.email,
		passwordHash: row.password_hash,
		createdAt: row.created_at,
	};
}

export async function findUserByEmail(db: D1Database, email: string): Promise<UserRecord | null> {
	const result = await db
		.prepare("SELECT id, full_name, email, password_hash, created_at FROM users WHERE email = ?1 COLLATE NOCASE")
		.bind(email.trim())
		.all<UserRow>();

	const row = result.results[0];
	return row ? mapUser(row) : null;
}

export type CreateUserInput = {
	fullName: string;
	email: string;
	password: string;
};

export type CreateUserResult =
	| { success: true }
	| { success: false; error: "duplicate_email"; message: string };

export async function createUser(db: D1Database, input: CreateUserInput): Promise<CreateUserResult> {
	const existingUser = await findUserByEmail(db, input.email);
	if (existingUser) {
		return {
			success: false,
			error: "duplicate_email",
			message: "An account with this email already exists. Please sign in.",
		};
	}

	const passwordHash = await hashPassword(input.password);
	const id = crypto.randomUUID();
	const createdAt = Date.now();

	try {
		await db
			.prepare(
				"INSERT INTO users (id, full_name, email, password_hash, created_at) VALUES (?1, ?2, ?3, ?4, ?5)",
			)
			.bind(id, input.fullName.trim(), input.email.trim().toLowerCase(), passwordHash, createdAt)
			.run();
	} catch {
		return {
			success: false,
			error: "duplicate_email",
			message: "An account with this email already exists. Please sign in.",
		};
	}

	return { success: true };
}
