"use server";

import { redirect } from "next/navigation";

import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { INVALID_CREDENTIALS_MESSAGE, validateSignInForm, type FieldErrors } from "@/lib/auth/validation";
import { getDb } from "@/lib/db";
import { createSession } from "@/lib/services/session-service";
import { findUserByEmail } from "@/lib/services/user-service";

export type SignInActionState = {
	errors?: FieldErrors;
	formError?: string;
};

export async function signInAction(_previousState: SignInActionState, formData: FormData): Promise<SignInActionState> {
	const input = {
		email: String(formData.get("email") ?? ""),
		password: String(formData.get("password") ?? ""),
	};

	const errors = validateSignInForm(input);
	if (Object.keys(errors).length > 0) {
		return { errors };
	}

	try {
		const db = await getDb();
		const user = await findUserByEmail(db, input.email);

		if (!user) {
			return { formError: INVALID_CREDENTIALS_MESSAGE };
		}

		const passwordValid = await verifyPassword(input.password, user.passwordHash);
		if (!passwordValid) {
			return { formError: INVALID_CREDENTIALS_MESSAGE };
		}

		const session = await createSession(db, user.id);
		await setSessionCookie(session.id);
	} catch {
		return { formError: "Something went wrong. Please try again later." };
	}

	redirect("/dashboard");
}
