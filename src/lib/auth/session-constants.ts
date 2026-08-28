export const SESSION_COOKIE_NAME = "quizmaker_session";
export const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

export interface SessionUser {
	id: string;
	fullName: string;
	email: string;
}

export interface SessionRecord {
	id: string;
	userId: string;
	expiresAt: number;
}
