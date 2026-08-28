import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
	it("hashes and verifies a valid password", async () => {
		const hash = await hashPassword("Password1!");
		expect(hash).toContain(":");

		const valid = await verifyPassword("Password1!", hash);
		expect(valid).toBe(true);
	});

	it("rejects an incorrect password", async () => {
		const hash = await hashPassword("Password1!");
		const valid = await verifyPassword("WrongPass1!", hash);
		expect(valid).toBe(false);
	});

	it("produces different hashes for the same password", async () => {
		const first = await hashPassword("Password1!");
		const second = await hashPassword("Password1!");
		expect(first).not.toBe(second);
	});
});
