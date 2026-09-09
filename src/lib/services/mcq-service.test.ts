import { describe, expect, it, vi } from "vitest";

import {
	createMcq,
	deleteMcq,
	findMcqById,
	listMcqsByUser,
	recordAttempt,
	updateMcq,
} from "@/lib/services/mcq-service";

type MockMcq = {
	id: string;
	userId: string;
	name: string;
	question: string;
	createdAt: number;
	updatedAt: number;
};

type MockChoice = {
	id: string;
	mcqId: string;
	choiceText: string;
	isCorrect: boolean;
	sortOrder: number;
	createdAt: number;
};

type MockAttempt = {
	id: string;
	mcqId: string;
	userId: string;
	choiceId: string;
	isCorrect: boolean;
	createdAt: number;
};

function createMockDb(seed?: { mcqs?: MockMcq[]; choices?: MockChoice[]; attempts?: MockAttempt[] }) {
	const mcqs = [...(seed?.mcqs ?? [])];
	const choices = [...(seed?.choices ?? [])];
	const attempts = [...(seed?.attempts ?? [])];

	return {
		prepare: vi.fn((sql: string) => ({
			bind: vi.fn((...args: unknown[]) => {
				const run = (handler: () => void) => ({
					run: vi.fn(async () => {
						handler();
						return { success: true };
					}),
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

					return { all: vi.fn(async () => ({ results })) };
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

					return { all: vi.fn(async () => ({ results })) };
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

					return { all: vi.fn(async () => ({ results })) };
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

				throw new Error(`Unhandled SQL in mock: ${sql}`);
			}),
		})),
	} as unknown as D1Database;
}

describe("mcq-service", () => {
	it("lists mcqs for a user", async () => {
		const db = createMockDb({
			mcqs: [
				{
					id: "mcq-1",
					userId: "user-1",
					name: "Math",
					question: "2 + 2?",
					createdAt: 1,
					updatedAt: 2,
				},
			],
		});

		const result = await listMcqsByUser(db, "user-1");
		expect(result).toHaveLength(1);
		expect(result[0]).toMatchObject({ id: "mcq-1", name: "Math" });
	});

	it("creates an mcq with choices", async () => {
		const db = createMockDb({});
		const result = await createMcq(db, "user-1", {
			name: "Science",
			question: "What is H2O?",
			choices: [
				{ text: "Water", isCorrect: true },
				{ text: "Air", isCorrect: false },
			],
		});

		expect(result.success).toBe(true);
		if (result.success) {
			const mcq = await findMcqById(db, "user-1", result.mcqId);
			expect(mcq?.choices).toHaveLength(2);
			expect(mcq?.choices.find((choice) => choice.isCorrect)?.choiceText).toBe("Water");
		}
	});

	it("updates an existing mcq", async () => {
		const db = createMockDb({
			mcqs: [
				{
					id: "mcq-1",
					userId: "user-1",
					name: "Old",
					question: "Old question",
					createdAt: 1,
					updatedAt: 1,
				},
			],
			choices: [
				{
					id: "choice-1",
					mcqId: "mcq-1",
					choiceText: "A",
					isCorrect: true,
					sortOrder: 0,
					createdAt: 1,
				},
				{
					id: "choice-2",
					mcqId: "mcq-1",
					choiceText: "B",
					isCorrect: false,
					sortOrder: 1,
					createdAt: 1,
				},
			],
		});

		const result = await updateMcq(db, "user-1", "mcq-1", {
			name: "Updated",
			question: "Updated question",
			choices: [
				{ text: "X", isCorrect: false },
				{ text: "Y", isCorrect: true },
			],
		});

		expect(result).toEqual({ success: true });
		const mcq = await findMcqById(db, "user-1", "mcq-1");
		expect(mcq?.name).toBe("Updated");
		expect(mcq?.choices).toHaveLength(2);
	});

	it("deletes an mcq", async () => {
		const db = createMockDb({
			mcqs: [
				{
					id: "mcq-1",
					userId: "user-1",
					name: "Delete me",
					question: "Question",
					createdAt: 1,
					updatedAt: 1,
				},
			],
			choices: [
				{
					id: "choice-1",
					mcqId: "mcq-1",
					choiceText: "A",
					isCorrect: true,
					sortOrder: 0,
					createdAt: 1,
				},
				{
					id: "choice-2",
					mcqId: "mcq-1",
					choiceText: "B",
					isCorrect: false,
					sortOrder: 1,
					createdAt: 1,
				},
			],
		});

		const result = await deleteMcq(db, "user-1", "mcq-1");
		expect(result).toEqual({ success: true });
		expect(await findMcqById(db, "user-1", "mcq-1")).toBeNull();
	});

	it("records an attempt with correctness", async () => {
		const db = createMockDb({
			mcqs: [
				{
					id: "mcq-1",
					userId: "user-1",
					name: "Quiz",
					question: "Pick one",
					createdAt: 1,
					updatedAt: 1,
				},
			],
			choices: [
				{
					id: "choice-1",
					mcqId: "mcq-1",
					choiceText: "Right",
					isCorrect: true,
					sortOrder: 0,
					createdAt: 1,
				},
				{
					id: "choice-2",
					mcqId: "mcq-1",
					choiceText: "Wrong",
					isCorrect: false,
					sortOrder: 1,
					createdAt: 1,
				},
			],
		});

		const result = await recordAttempt(db, "user-1", "mcq-1", "choice-1");
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.attempt.isCorrect).toBe(true);
		}

		const wrongResult = await recordAttempt(db, "user-1", "mcq-1", "choice-2");
		expect(wrongResult.success).toBe(true);
		if (wrongResult.success) {
			expect(wrongResult.attempt.isCorrect).toBe(false);
		}
	});
});
