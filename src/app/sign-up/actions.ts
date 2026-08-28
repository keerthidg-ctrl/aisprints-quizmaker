"use server";

import { redirect } from "next/navigation";

import { validateSignUpForm, type FieldErrors } from "@/lib/auth/validation";
import { getDb } from "@/lib/db";
import { createUser } from "@/lib/services/user-service";

export type SignUpActionState = {
	errors?: FieldErrors;
	formError?: string;
};

export async function signUpAction(_previousState: SignUpActionState, formData: FormData): Promise<SignUpActionState> {
	const input = {
		fullName: String(formData.get("fullName") ?? ""),
		email: String(formData.get("email") ?? ""),
		password: String(formData.get("password") ?? ""),
		confirmPassword: String(formData.get("confirmPassword") ?? ""),
	};

	const errors = validateSignUpForm(input);
	if (Object.keys(errors).length > 0) {
		return { errors };
	}

	try {
		const db = await getDb();
		const result = await createUser(db, {
			fullName: input.fullName,
			email: input.email,
			password: input.password,
		});

		if (!result.success) {
			return { errors: { email: result.message } };
		}
	} catch {
		return { formError: "Something went wrong. Please try again later." };
	}

	redirect("/sign-in?registered=1");
}
