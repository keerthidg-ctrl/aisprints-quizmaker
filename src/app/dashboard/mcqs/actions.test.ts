import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	createMcqAction,
	deleteMcqAction,
	submitAttemptAction,
	updateMcqAction,
} from "@/app/dashboard/mcqs/actions";

const mockUser = {
	id: "user-1",
	fullName: "Test User",
	email: "test@example.com",
};

const mockDb = {} as D1Database;

vi.mock("@/lib/auth/route-guards", () => ({
	requireAuth: vi.fn(async () => mockUser),
}));

vi.mock("@/lib/db", () => ({
	getDb: vi.fn(async () => mockDb),
}));

vi.mock("next/navigation", () => ({
	redirect: vi.fn((url: string) => {
		const error = new Error("NEXT_REDIRECT");
		error.message = "NEXT_REDIRECT";
		(error as Error & { digest?: string }).digest = `NEXT_REDIRECT;${url}`;
		throw error;
	}),
}));

vi.mock("@/lib/services/mcq-service", () => ({
	createMcq: vi.fn(),
	updateMcq: vi.fn(),
	deleteMcq: vi.fn(),
	recordAttempt: vi.fn(),
}));

import { getDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth/route-guards";
import { redirect } from "next/navigation";
import { createMcq, deleteMcq, recordAttempt, updateMcq } from "@/lib/services/mcq-service";

function buildValidMcqFormData(): FormData {
	const formData = new FormData();
	formData.set("name", "Chapter 1");
	formData.set("question", "What is 2 + 2?");
	formData.set("choiceCount", "2");
	formData.set("correctChoiceIndex", "1");
	formData.set("choiceText_0", "3");
	formData.set("choiceText_1", "4");
	return formData;
}

describe("mcq server actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(requireAuth).mockResolvedValue(mockUser);
		vi.mocked(getDb).mockResolvedValue(mockDb);
	});

	describe("createMcqAction", () => {
		it("returns field errors when validation fails", async () => {
			const formData = new FormData();
			formData.set("name", "");
			formData.set("question", "");
			formData.set("choiceCount", "1");
			formData.set("correctChoiceIndex", "0");
			formData.set("choiceText_0", "");

			const result = await createMcqAction({}, formData);

			expect(result.errors).toBeDefined();
			expect(createMcq).not.toHaveBeenCalled();
			expect(redirect).not.toHaveBeenCalled();
		});

		it("creates an mcq for the authenticated user and redirects on success", async () => {
			vi.mocked(createMcq).mockResolvedValue({ success: true, mcqId: "mcq-1" });

			await expect(createMcqAction({}, buildValidMcqFormData())).rejects.toThrow("NEXT_REDIRECT");

			expect(requireAuth).toHaveBeenCalledOnce();
			expect(getDb).toHaveBeenCalledOnce();
			expect(createMcq).toHaveBeenCalledWith(
				mockDb,
				"user-1",
				expect.objectContaining({
					name: "Chapter 1",
					question: "What is 2 + 2?",
					choices: [
						{ text: "3", isCorrect: false },
						{ text: "4", isCorrect: true },
					],
				}),
			);
			expect(redirect).toHaveBeenCalledWith("/dashboard/mcqs");
		});

		it("returns a form error when persistence fails", async () => {
			vi.mocked(createMcq).mockResolvedValue({ success: false, error: "create_failed" });

			const result = await createMcqAction({}, buildValidMcqFormData());

			expect(result).toEqual({
				formError: "Something went wrong while creating the question. Please try again.",
			});
		});
	});

	describe("updateMcqAction", () => {
		it("returns field errors when validation fails", async () => {
			const formData = new FormData();
			formData.set("name", "");
			formData.set("question", "");
			formData.set("choiceCount", "1");
			formData.set("correctChoiceIndex", "0");
			formData.set("choiceText_0", "");

			const result = await updateMcqAction("mcq-1", {}, formData);

			expect(result.errors).toBeDefined();
			expect(updateMcq).not.toHaveBeenCalled();
		});

		it("updates an mcq for the authenticated user and redirects on success", async () => {
			vi.mocked(updateMcq).mockResolvedValue({ success: true });

			await expect(updateMcqAction("mcq-1", {}, buildValidMcqFormData())).rejects.toThrow("NEXT_REDIRECT");

			expect(updateMcq).toHaveBeenCalledWith(mockDb, "user-1", "mcq-1", expect.any(Object));
			expect(redirect).toHaveBeenCalledWith("/dashboard/mcqs");
		});

		it("returns a not found message when the mcq does not exist", async () => {
			vi.mocked(updateMcq).mockResolvedValue({ success: false, error: "not_found" });

			const result = await updateMcqAction("missing-mcq", {}, buildValidMcqFormData());

			expect(result).toEqual({ formError: "This question could not be found." });
		});

		it("returns a generic form error when the update fails", async () => {
			vi.mocked(updateMcq).mockResolvedValue({ success: false, error: "update_failed" });

			const result = await updateMcqAction("mcq-1", {}, buildValidMcqFormData());

			expect(result).toEqual({
				formError: "Something went wrong while saving the question. Please try again.",
			});
		});
	});

	describe("deleteMcqAction", () => {
		it("deletes an mcq for the authenticated user", async () => {
			vi.mocked(deleteMcq).mockResolvedValue({ success: true });

			const result = await deleteMcqAction("mcq-1");

			expect(deleteMcq).toHaveBeenCalledWith(mockDb, "user-1", "mcq-1");
			expect(result).toEqual({ success: true });
		});

		it("returns a not found error when the mcq does not exist", async () => {
			vi.mocked(deleteMcq).mockResolvedValue({ success: false, error: "not_found" });

			const result = await deleteMcqAction("missing-mcq");

			expect(result).toEqual({
				success: false,
				error: "This question could not be found.",
			});
		});

		it("returns a generic error when deletion fails", async () => {
			vi.mocked(deleteMcq).mockResolvedValue({ success: false, error: "delete_failed" });

			const result = await deleteMcqAction("mcq-1");

			expect(result).toEqual({
				success: false,
				error: "Something went wrong while deleting the question.",
			});
		});
	});

	describe("submitAttemptAction", () => {
		it("requires a selected choice", async () => {
			const result = await submitAttemptAction("mcq-1", {}, new FormData());

			expect(result).toEqual({ formError: "Please select an answer before submitting." });
			expect(recordAttempt).not.toHaveBeenCalled();
		});

		it("records an attempt for the authenticated user", async () => {
			vi.mocked(recordAttempt).mockResolvedValue({
				success: true,
				attempt: {
					id: "attempt-1",
					mcqId: "mcq-1",
					userId: "user-1",
					choiceId: "choice-1",
					isCorrect: true,
					createdAt: 1,
				},
			});

			const formData = new FormData();
			formData.set("choiceId", "choice-1");

			const result = await submitAttemptAction("mcq-1", {}, formData);

			expect(recordAttempt).toHaveBeenCalledWith(mockDb, "user-1", "mcq-1", "choice-1");
			expect(result).toEqual({ isCorrect: true });
		});

		it("returns a not found message when the mcq does not exist", async () => {
			vi.mocked(recordAttempt).mockResolvedValue({ success: false, error: "not_found" });

			const formData = new FormData();
			formData.set("choiceId", "choice-1");

			const result = await submitAttemptAction("missing-mcq", {}, formData);

			expect(result).toEqual({ formError: "This question could not be found." });
		});

		it("returns an invalid choice message when the choice does not belong to the mcq", async () => {
			vi.mocked(recordAttempt).mockResolvedValue({ success: false, error: "invalid_choice" });

			const formData = new FormData();
			formData.set("choiceId", "choice-missing");

			const result = await submitAttemptAction("mcq-1", {}, formData);

			expect(result).toEqual({
				formError: "The selected answer is not valid for this question.",
			});
		});

		it("returns a generic error when attempt recording fails", async () => {
			vi.mocked(recordAttempt).mockResolvedValue({ success: false, error: "record_failed" });

			const formData = new FormData();
			formData.set("choiceId", "choice-1");

			const result = await submitAttemptAction("mcq-1", {}, formData);

			expect(result).toEqual({
				formError: "Something went wrong while recording your attempt.",
			});
		});
	});
});
