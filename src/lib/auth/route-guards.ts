import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import type { SessionUser } from "@/lib/auth/session-constants";

export async function requireAuth(): Promise<SessionUser> {
	const user = await getCurrentUser();
	if (!user) {
		redirect("/sign-in");
	}

	return user;
}

export async function redirectIfAuthenticated(): Promise<void> {
	const user = await getCurrentUser();
	if (user) {
		redirect("/dashboard");
	}
}
