import { describe, expect, it } from "vitest";

import { parseMcqFormData, validateMcqForm } from "@/lib/mcq/validation";
import {
	createMcq,
	deleteMcq,
	findMcqById,
	listMcqsByUser,
	recordAttempt,
	updateMcq,
} from "@/lib/services/mcq-service";

/**
 * In-memory D1 mock for integration-style service tests.
 * Exercises create → read → update → attempt → delete in one flow.
 */
function createIntegrationMockDb() {
	const mcqs: Array<{
		id: string;
		userId: string;
		name: string;
		question: string;
		createdAt: number;
		updatedAt: number;
	}> = [];
	const choices: Array<{
		id: string;
		mcqId: string;
		choiceText: string;
		isCorrect: boolean;
		sortOrder: number;
		createdAt: number;
	}> = [];
	const attempts: Array<{
		id: string;
		mcqId: string;
		userId: string;
		choiceId: string;
		isCorrect: boolean;
		createdAt: number;
	}> = [];

	return {
		db: {
			prepare: (sql: string) => ({
				bind: (...args: unknown[]) => {
					const run = (handler: () => void) => ({
						run: async () => {
							handler();
							return { success: true };
						},
					});

					if (sql.startsWith("SELECT") && sql.includes("FROM mcqs WHERE user_id = ?1 ORDER BY")) {
						const userId = String(args[0]);
						const results = mcqs
							.filter((mcq) => mcq.userId === userId)
							.map((mcq) => ({
								id: mcq.id,
								user_id: mcq.userId,
								name: mcq.name,
								question: mcq.question,
								created_at: mcq.createdAt,
								updated_at: mcq.updatedAt,
							}));
						return { all: async () => ({ results }) };
					}

					if (sql.startsWith("SELECT") && sql.includes("FROM mcqs WHERE id = ?1 AND user_id = ?2")) {
						const [mcqId, userId] = args as [string, string];
						const mcq = mcqs.find((item) => item.id === mcqId && item.userId === userId);
						const results = mcq
							? [
									{
										id: mcq.id,
										user_id: mcq.userId,
										name: mcq.name,
										question: mcq.question,
										created_at: mcq.createdAt,
										updated_at: mcq.updatedAt,
									},
								]
							: [];
						return { all: async () => ({ results }) };
					}

					if (sql.startsWith("SELECT") && sql.includes("FROM mcq_choices WHERE mcq_id = ?1 ORDER BY")) {
						const mcqId = String(args[0]);
						const results = choices
							.filter((choice) => choice.mcqId === mcqId)
							.sort((a, b) => a.sortOrder - b.sortOrder)
							.map((choice) => ({
								id: choice.id,
								mcq_id: choice.mcqId,
								choice_text: choice.choiceText,
								is_correct: choice.isCorrect ? 1 : 0,
								sort_order: choice.sortOrder,
								created_at: choice.createdAt,
							}));
						return { all: async () => ({ results }) };
					}

					if (sql.startsWith("INSERT INTO mcqs")) {
						return run(() => {
							const [id, userId, name, question, createdAt, updatedAt] = args as [
								string,
								string,
								string,
								string,
								number,
								number,
							];
							mcqs.push({ id, userId, name, question, createdAt, updatedAt });
						});
					}

					if (sql.startsWith("INSERT INTO mcq_choices")) {
						return run(() => {
							const [id, mcqId, choiceText, isCorrect, sortOrder, createdAt] = args as [
								string,
								string,
								string,
								number,
								number,
								number,
							];
							choices.push({
								id,
								mcqId,
								choiceText,
								isCorrect: isCorrect === 1,
								sortOrder,
								createdAt,
							});
						});
					}

					if (sql.startsWith("UPDATE mcqs SET")) {
						return run(() => {
							const [name, question, updatedAt, mcqId, userId] = args as [string, string, number, string, string];
							const mcq = mcqs.find((item) => item.id === mcqId && item.userId === userId);
							if (mcq) {
								mcq.name = name;
								mcq.question = question;
								mcq.updatedAt = updatedAt;
							}
						});
					}

					if (sql.startsWith("DELETE FROM mcq_choices WHERE mcq_id = ?1")) {
						return run(() => {
							const mcqId = String(args[0]);
							for (let index = choices.length - 1; index >= 0; index--) {
								if (choices[index].mcqId === mcqId) {
									choices.splice(index, 1);
								}
							}
						});
					}

					if (sql.startsWith("DELETE FROM mcqs WHERE id = ?1 AND user_id = ?2")) {
						return run(() => {
							const [mcqId, userId] = args as [string, string];
							const index = mcqs.findIndex((item) => item.id === mcqId && item.userId === userId);
							if (index >= 0) {
								mcqs.splice(index, 1);
							}
						});
					}

					if (sql.startsWith("INSERT INTO mcq_attempts")) {
						return run(() => {
							const [id, mcqId, userId, choiceId, isCorrect, createdAt] = args as [
								string,
								string,
								string,
								string,
								number,
								number,
							];
							attempts.push({
								id,
								mcqId,
								userId,
								choiceId,
								isCorrect: isCorrect === 1,
								createdAt,
							});
						});
					}

					throw new Error(`Unhandled SQL in integration mock: ${sql}`);
				},
			}),
		} as unknown as D1Database,
		getAttempts: () => attempts,
	};
}

describe("mcq integration", () => {
	it("supports create, list, edit, preview attempt, and delete for one user", async () => {
		const { db, getAttempts } = createIntegrationMockDb();
		const userId = "user-1";

		const formData = new FormData();
		formData.set("name", "Integration Quiz");
		formData.set("question", "Which planet is known as the Red Planet?");
		formData.set("choiceCount", "2");
		formData.set("correctChoiceIndex", "1");
		formData.set("choiceText_0", "Venus");
		formData.set("choiceText_1", "Mars");

		const input = parseMcqFormData(formData);
		expect(validateMcqForm(input)).toEqual({});

		const createResult = await createMcq(db, userId, input);
		expect(createResult.success).toBe(true);
		if (!createResult.success) {
			return;
		}

		const listed = await listMcqsByUser(db, userId);
		expect(listed).toHaveLength(1);
		expect(listed[0]?.name).toBe("Integration Quiz");

		const created = await findMcqById(db, userId, createResult.mcqId);
		expect(created?.choices).toHaveLength(2);

		const correctChoice = created?.choices.find((choice) => choice.isCorrect);
		expect(correctChoice?.choiceText).toBe("Mars");

		const updateResult = await updateMcq(db, userId, createResult.mcqId, {
			name: "Updated Integration Quiz",
			question: "Which planet is Mars?",
			choices: [
				{ text: "Earth", isCorrect: false },
				{ text: "Mars", isCorrect: true },
			],
		});
		expect(updateResult).toEqual({ success: true });

		const updated = await findMcqById(db, userId, createResult.mcqId);
		const updatedCorrectChoice = updated?.choices.find((choice) => choice.isCorrect);
		expect(updated?.name).toBe("Updated Integration Quiz");
		expect(updatedCorrectChoice).toBeDefined();

		const attemptResult = await recordAttempt(
			db,
			userId,
			createResult.mcqId,
			updatedCorrectChoice!.id,
		);
		expect(attemptResult.success).toBe(true);
		if (attemptResult.success) {
			expect(attemptResult.attempt.isCorrect).toBe(true);
		}

		expect(getAttempts()).toHaveLength(1);

		const deleteResult = await deleteMcq(db, userId, createResult.mcqId);
		expect(deleteResult).toEqual({ success: true });
		expect(await findMcqById(db, userId, createResult.mcqId)).toBeNull();
		expect(await listMcqsByUser(db, userId)).toHaveLength(0);
	});
});
