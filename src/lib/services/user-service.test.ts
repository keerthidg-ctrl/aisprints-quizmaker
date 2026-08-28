import { describe, expect, it, vi } from "vitest";

import { createUser, findUserByEmail } from "@/lib/services/user-service";

function createMockDb(options: {
	existingEmails?: string[];
	insertShouldFail?: boolean;
}) {
	const existingEmails = new Set((options.existingEmails ?? []).map((email) => email.toLowerCase()));

	return {
		prepare: vi.fn((sql: string) => ({
			bind: vi.fn((...args: unknown[]) => {
				if (sql.includes("SELECT")) {
					const email = String(args[0]).toLowerCase();
					const user = existingEmails.has(email)
						? [
								{
									id: "user-1",
									full_name: "Existing User",
									email,
									password_hash: "hash",
									created_at: Date.now(),
								},
							]
						: [];

					return {
						all: vi.fn(async () => ({ results: user })),
					};
				}

				return {
					run: vi.fn(async () => {
						if (options.insertShouldFail) {
							throw new Error("UNIQUE constraint failed");
						}

						const email = String(args[2]).toLowerCase();
						existingEmails.add(email);
						return { success: true };
					}),
				};
			}),
		})),
	} as unknown as D1Database;
}

describe("user-service", () => {
	it("creates a user when email is available", async () => {
		const db = createMockDb({});
		const result = await createUser(db, {
			fullName: "Jane Doe",
			email: "jane@example.com",
			password: "Password1!",
		});

		expect(result).toEqual({ success: true });
	});

	it("rejects duplicate email registration", async () => {
		const db = createMockDb({ existingEmails: ["jane@example.com"] });
		const result = await createUser(db, {
			fullName: "Jane Doe",
			email: "jane@example.com",
			password: "Password1!",
		});

		expect(result).toEqual({
			success: false,
			error: "duplicate_email",
			message: "An account with this email already exists. Please sign in.",
		});
	});

	it("finds a user by email", async () => {
		const db = createMockDb({ existingEmails: ["jane@example.com"] });
		const user = await findUserByEmail(db, "jane@example.com");

		expect(user).toMatchObject({
			id: "user-1",
			fullName: "Existing User",
			email: "jane@example.com",
		});
	});

	it("returns null when user does not exist", async () => {
		const db = createMockDb({});
		const user = await findUserByEmail(db, "missing@example.com");
		expect(user).toBeNull();
	});
});
