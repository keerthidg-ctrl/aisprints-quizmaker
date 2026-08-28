import { describe, expect, it, vi } from "vitest";

import { SESSION_DURATION_MS } from "@/lib/auth/session-constants";
import {
	createSession,
	deleteSession,
	getSessionWithUser,
	isSessionExpired,
} from "@/lib/services/session-service";

function createMockDb(options: {
	sessions?: Array<{ id: string; user_id: string; expires_at: number }>;
	users?: Array<{ id: string; full_name: string; email: string }>;
}) {
	const sessions = [...(options.sessions ?? [])];
	const users = [...(options.users ?? [])];

	return {
		prepare: vi.fn((sql: string) => ({
			bind: vi.fn((...args: unknown[]) => {
				if (sql.includes("INSERT INTO sessions")) {
					const [id, userId, expiresAt] = args as [string, string, number];
					sessions.push({ id, user_id: userId, expires_at: expiresAt });
					return { run: vi.fn(async () => ({ success: true })) };
				}

				if (sql.includes("DELETE FROM sessions")) {
					const sessionId = String(args[0]);
					const index = sessions.findIndex((session) => session.id === sessionId);
					if (index >= 0) {
						sessions.splice(index, 1);
					}
					return { run: vi.fn(async () => ({ success: true })) };
				}

				if (sql.includes("FROM sessions") && sql.includes("JOIN users")) {
					const sessionId = String(args[0]);
					const now = Number(args[1]);
					const session = sessions.find((entry) => entry.id === sessionId && entry.expires_at > now);
					if (!session) {
						return { all: vi.fn(async () => ({ results: [] })) };
					}

					const user = users.find((entry) => entry.id === session.user_id);
					if (!user) {
						return { all: vi.fn(async () => ({ results: [] })) };
					}

					return {
						all: vi.fn(async () => ({
							results: [
								{
									session_id: session.id,
									user_id: user.id,
									expires_at: session.expires_at,
									full_name: user.full_name,
									email: user.email,
								},
							],
						})),
					};
				}

				return { run: vi.fn(async () => ({ success: true })), all: vi.fn(async () => ({ results: [] })) };
			}),
		})),
	} as unknown as D1Database;
}

describe("session-service", () => {
	it("creates a session with a future expiry", async () => {
		const db = createMockDb({});
		const before = Date.now();
		const session = await createSession(db, "user-1");
		const after = Date.now();

		expect(session.userId).toBe("user-1");
		expect(session.expiresAt).toBeGreaterThanOrEqual(before + SESSION_DURATION_MS);
		expect(session.expiresAt).toBeLessThanOrEqual(after + SESSION_DURATION_MS);
	});

	it("returns the authenticated user for a valid session", async () => {
		const db = createMockDb({
			sessions: [{ id: "session-1", user_id: "user-1", expires_at: Date.now() + 1000 }],
			users: [{ id: "user-1", full_name: "Jane Doe", email: "jane@example.com" }],
		});

		const result = await getSessionWithUser(db, "session-1");
		expect(result).toEqual({
			session: { id: "session-1", userId: "user-1", expiresAt: expect.any(Number) },
			user: { id: "user-1", fullName: "Jane Doe", email: "jane@example.com" },
		});
	});

	it("returns null for expired sessions", async () => {
		const db = createMockDb({
			sessions: [{ id: "session-1", user_id: "user-1", expires_at: Date.now() - 1000 }],
			users: [{ id: "user-1", full_name: "Jane Doe", email: "jane@example.com" }],
		});

		const result = await getSessionWithUser(db, "session-1");
		expect(result).toBeNull();
	});

	it("deletes a session", async () => {
		const db = createMockDb({
			sessions: [{ id: "session-1", user_id: "user-1", expires_at: Date.now() + 1000 }],
		});

		await deleteSession(db, "session-1");
		const result = await getSessionWithUser(db, "session-1");
		expect(result).toBeNull();
	});

	it("detects expired sessions", () => {
		expect(isSessionExpired(Date.now() - 1)).toBe(true);
		expect(isSessionExpired(Date.now() + 1000)).toBe(false);
	});
});
