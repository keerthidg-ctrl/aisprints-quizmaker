import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { INVALID_CREDENTIALS_MESSAGE } from "@/lib/auth/validation";

describe("sign-in credentials", () => {
	it("accepts valid credentials for a stored user hash", async () => {
		const passwordHash = await hashPassword("Password1!");
		const valid = await verifyPassword("Password1!", passwordHash);
		expect(valid).toBe(true);
	});

	it("uses the PRD invalid credentials message constant", () => {
		expect(INVALID_CREDENTIALS_MESSAGE).toBe("Invalid email or password. Please try again.");
	});
});
