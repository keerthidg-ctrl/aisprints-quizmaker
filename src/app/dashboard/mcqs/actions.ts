"use server";

import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/auth/route-guards";
import { parseMcqFormData, validateMcqForm, type McqFieldErrors } from "@/lib/mcq/validation";
import { getDb } from "@/lib/db";
import { createMcq, deleteMcq, recordAttempt, updateMcq } from "@/lib/services/mcq-service";

export type McqActionState = {
	errors?: McqFieldErrors;
	formError?: string;
};

export async function createMcqAction(
	_previousState: McqActionState,
	formData: FormData,
): Promise<McqActionState> {
	const user = await requireAuth();
	const input = parseMcqFormData(formData);
	const errors = validateMcqForm(input);

	if (Object.keys(errors).length > 0) {
		return { errors };
	}

	try {
		const db = await getDb();
		const result = await createMcq(db, user.id, input);

		if (!result.success) {
			return { formError: "Something went wrong while creating the question. Please try again." };
		}

		redirect("/dashboard/mcqs");
	} catch (error) {
		if (error instanceof Error && error.message === "NEXT_REDIRECT") {
			throw error;
		}

		return { formError: "Something went wrong while creating the question. Please try again." };
	}
}

export async function updateMcqAction(
	mcqId: string,
	_previousState: McqActionState,
	formData: FormData,
): Promise<McqActionState> {
	const user = await requireAuth();
	const input = parseMcqFormData(formData);
	const errors = validateMcqForm(input);

	if (Object.keys(errors).length > 0) {
		return { errors };
	}

	try {
		const db = await getDb();
		const result = await updateMcq(db, user.id, mcqId, input);

		if (!result.success) {
			if (result.error === "not_found") {
				return { formError: "This question could not be found." };
			}

			return { formError: "Something went wrong while saving the question. Please try again." };
		}

		redirect("/dashboard/mcqs");
	} catch (error) {
		if (error instanceof Error && error.message === "NEXT_REDIRECT") {
			throw error;
		}

		return { formError: "Something went wrong while saving the question. Please try again." };
	}
}

export async function deleteMcqAction(mcqId: string): Promise<{ success: boolean; error?: string }> {
	const user = await requireAuth();

	try {
		const db = await getDb();
		const result = await deleteMcq(db, user.id, mcqId);

		if (!result.success) {
			if (result.error === "not_found") {
				return { success: false, error: "This question could not be found." };
			}

			return { success: false, error: "Something went wrong while deleting the question." };
		}

		return { success: true };
	} catch {
		return { success: false, error: "Something went wrong while deleting the question." };
	}
}

export type AttemptActionState = {
	formError?: string;
	isCorrect?: boolean;
};

export async function submitAttemptAction(
	mcqId: string,
	_previousState: AttemptActionState,
	formData: FormData,
): Promise<AttemptActionState> {
	const user = await requireAuth();
	const choiceId = String(formData.get("choiceId") ?? "");

	if (!choiceId) {
		return { formError: "Please select an answer before submitting." };
	}

	try {
		const db = await getDb();
		const result = await recordAttempt(db, user.id, mcqId, choiceId);

		if (!result.success) {
			if (result.error === "not_found") {
				return { formError: "This question could not be found." };
			}
			if (result.error === "invalid_choice") {
				return { formError: "The selected answer is not valid for this question." };
			}

			return { formError: "Something went wrong while recording your attempt." };
		}

		return { isCorrect: result.attempt.isCorrect };
	} catch {
		return { formError: "Something went wrong while recording your attempt." };
	}
}
