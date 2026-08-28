import { cookies } from "next/headers";

import { SESSION_COOKIE_NAME, SESSION_DURATION_MS, type SessionUser } from "@/lib/auth/session-constants";
import { getDb } from "@/lib/db";
import { deleteSession, getSessionWithUser } from "@/lib/services/session-service";

export async function setSessionCookie(sessionId: string): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: SESSION_DURATION_MS / 1000,
	});
}

export async function clearSessionCookie(): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSessionIdFromCookie(): Promise<string | null> {
	const cookieStore = await cookies();
	return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
	const sessionId = await getSessionIdFromCookie();
	if (!sessionId) {
		return null;
	}

	const db = await getDb();
	const session = await getSessionWithUser(db, sessionId);
	return session?.user ?? null;
}

export async function invalidateCurrentSession(): Promise<void> {
	const sessionId = await getSessionIdFromCookie();
	if (!sessionId) {
		await clearSessionCookie();
		return;
	}

	const db = await getDb();
	await deleteSession(db, sessionId);
	await clearSessionCookie();
}
