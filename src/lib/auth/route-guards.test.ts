import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("next/navigation", () => ({
	redirect: vi.fn((path: string) => {
		throw new Error(`REDIRECT:${path}`);
	}),
}));

vi.mock("@/lib/auth/session", () => ({
	getCurrentUser: vi.fn(),
}));

import { getCurrentUser } from "@/lib/auth/session";
import { redirectIfAuthenticated, requireAuth } from "@/lib/auth/route-guards";

describe("route guards", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("requireAuth returns the user when authenticated", async () => {
		vi.mocked(getCurrentUser).mockResolvedValue({
			id: "user-1",
			fullName: "Jane Doe",
			email: "jane@example.com",
		});

		const user = await requireAuth();
		expect(user.fullName).toBe("Jane Doe");
	});

	it("requireAuth redirects unauthenticated users to sign-in", async () => {
		vi.mocked(getCurrentUser).mockResolvedValue(null);

		await expect(requireAuth()).rejects.toThrow("REDIRECT:/sign-in");
	});

	it("redirectIfAuthenticated sends authenticated users to dashboard", async () => {
		vi.mocked(getCurrentUser).mockResolvedValue({
			id: "user-1",
			fullName: "Jane Doe",
			email: "jane@example.com",
		});

		await expect(redirectIfAuthenticated()).rejects.toThrow("REDIRECT:/dashboard");
	});

	it("redirectIfAuthenticated allows unauthenticated access", async () => {
		vi.mocked(getCurrentUser).mockResolvedValue(null);
		await expect(redirectIfAuthenticated()).resolves.toBeUndefined();
	});
});
