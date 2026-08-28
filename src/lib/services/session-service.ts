import { SESSION_DURATION_MS, type SessionRecord, type SessionUser } from "@/lib/auth/session-constants";

interface SessionUserRow {
	session_id: string;
	user_id: string;
	expires_at: number;
	full_name: string;
	email: string;
}

export function isSessionExpired(expiresAt: number, now = Date.now()): boolean {
	return expiresAt <= now;
}

export async function createSession(db: D1Database, userId: string): Promise<SessionRecord> {
	const id = crypto.randomUUID();
	const expiresAt = Date.now() + SESSION_DURATION_MS;

	await db.prepare("INSERT INTO sessions (id, user_id, expires_at) VALUES (?1, ?2, ?3)").bind(id, userId, expiresAt).run();

	return { id, userId, expiresAt };
}

export async function deleteSession(db: D1Database, sessionId: string): Promise<void> {
	await db.prepare("DELETE FROM sessions WHERE id = ?1").bind(sessionId).run();
}

export async function getSessionWithUser(
	db: D1Database,
	sessionId: string,
): Promise<{ session: SessionRecord; user: SessionUser } | null> {
	const result = await db
		.prepare(
			`SELECT s.id AS session_id, s.user_id, s.expires_at, u.full_name, u.email
			 FROM sessions s
			 INNER JOIN users u ON u.id = s.user_id
			 WHERE s.id = ?1 AND s.expires_at > ?2`,
		)
		.bind(sessionId, Date.now())
		.all<SessionUserRow>();

	const row = result.results[0];
	if (!row) {
		return null;
	}

	return {
		session: {
			id: row.session_id,
			userId: row.user_id,
			expiresAt: row.expires_at,
		},
		user: {
			id: row.user_id,
			fullName: row.full_name,
			email: row.email,
		},
	};
}
