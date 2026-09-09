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

type MockDbOptions = {
	mcqs?: MockMcq[];
	choices?: MockChoice[];
	attempts?: MockAttempt[];
	insertMcqShouldFail?: boolean;
	insertAttemptShouldFail?: boolean;
};

function createOwnedMcqSeed(userId = "user-1", mcqId = "mcq-1") {
	return {
		mcqs: [
			{
				id: mcqId,
				userId,
				name: "Sample MCQ",
				question: "Sample question?",
				createdAt: 1,
				updatedAt: 1,
			},
		],
		choices: [
			{
				id: "choice-1",
				mcqId,
				choiceText: "Correct",
				isCorrect: true,
				sortOrder: 0,
				createdAt: 1,
			},
			{
				id: "choice-2",
				mcqId,
				choiceText: "Incorrect",
				isCorrect: false,
				sortOrder: 1,
				createdAt: 1,
			},
		],
	};
}

function createMockDb(seed?: MockDbOptions) {
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
					return {
						run: vi.fn(async () => {
							if (seed?.insertMcqShouldFail) {
								throw new Error("insert failed");
							}

							const [id, userId, name, question, createdAt, updatedAt] = args as [
								string,
								string,
								string,
								string,
								number,
								number,
							];
							mcqs.push({ id, userId, name, question, createdAt, updatedAt });
							return { success: true };
						}),
					};
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
					return {
						run: vi.fn(async () => {
							if (seed?.insertAttemptShouldFail) {
								throw new Error("insert failed");
							}

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
							return { success: true };
						}),
					};
				}

				throw new Error(`Unhandled SQL in mock: ${sql}`);
			}),
		})),
	} as unknown as D1Database;
}

describe("mcq-service", () => {
	describe("listMcqsByUser", () => {
		it("lists mcqs for a user", async () => {
			const db = createMockDb(createOwnedMcqSeed());
			const result = await listMcqsByUser(db, "user-1");

			expect(result).toHaveLength(1);
			expect(result[0]).toMatchObject({ id: "mcq-1", name: "Sample MCQ" });
		});

		it("returns an empty list when the user has no mcqs", async () => {
			const db = createMockDb(createOwnedMcqSeed());
			const result = await listMcqsByUser(db, "user-2");

			expect(result).toEqual([]);
		});

		it("does not return mcqs owned by another user", async () => {
			const db = createMockDb({
				mcqs: [
					...createOwnedMcqSeed("user-1").mcqs,
					{
						id: "mcq-2",
						userId: "user-2",
						name: "Other user MCQ",
						question: "Hidden question?",
						createdAt: 1,
						updatedAt: 1,
					},
				],
			});

			const result = await listMcqsByUser(db, "user-1");
			expect(result).toHaveLength(1);
			expect(result[0]?.id).toBe("mcq-1");
		});
	});

	describe("findMcqById", () => {
		it("returns an mcq with ordered choices", async () => {
			const db = createMockDb(createOwnedMcqSeed());
			const mcq = await findMcqById(db, "user-1", "mcq-1");

			expect(mcq).toMatchObject({ id: "mcq-1", name: "Sample MCQ" });
			expect(mcq?.choices).toHaveLength(2);
			expect(mcq?.choices[0]?.choiceText).toBe("Correct");
		});

		it("returns null when the mcq does not exist", async () => {
			const db = createMockDb(createOwnedMcqSeed());
			const mcq = await findMcqById(db, "user-1", "missing-mcq");

			expect(mcq).toBeNull();
		});

		it("returns null when another user owns the mcq", async () => {
			const db = createMockDb(createOwnedMcqSeed("user-1"));
			const mcq = await findMcqById(db, "user-2", "mcq-1");

			expect(mcq).toBeNull();
		});
	});

	describe("createMcq", () => {
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

		it("returns create_failed when the database insert fails", async () => {
			const db = createMockDb({ insertMcqShouldFail: true });
			const result = await createMcq(db, "user-1", {
				name: "Science",
				question: "What is H2O?",
				choices: [
					{ text: "Water", isCorrect: true },
					{ text: "Air", isCorrect: false },
				],
			});

			expect(result).toEqual({ success: false, error: "create_failed" });
		});
	});

	describe("updateMcq", () => {
		it("updates an existing mcq", async () => {
			const db = createMockDb(createOwnedMcqSeed());
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

		it("returns not_found when the mcq does not exist", async () => {
			const db = createMockDb(createOwnedMcqSeed());
			const result = await updateMcq(db, "user-1", "missing-mcq", {
				name: "Updated",
				question: "Updated question",
				choices: [
					{ text: "X", isCorrect: false },
					{ text: "Y", isCorrect: true },
				],
			});

			expect(result).toEqual({ success: false, error: "not_found" });
		});

		it("returns not_found when another user owns the mcq", async () => {
			const db = createMockDb(createOwnedMcqSeed("user-1"));
			const result = await updateMcq(db, "user-2", "mcq-1", {
				name: "Hijacked",
				question: "Should not save",
				choices: [
					{ text: "X", isCorrect: true },
					{ text: "Y", isCorrect: false },
				],
			});

			expect(result).toEqual({ success: false, error: "not_found" });
			const mcq = await findMcqById(db, "user-1", "mcq-1");
			expect(mcq?.name).toBe("Sample MCQ");
		});
	});

	describe("deleteMcq", () => {
		it("deletes an mcq", async () => {
			const db = createMockDb(createOwnedMcqSeed());
			const result = await deleteMcq(db, "user-1", "mcq-1");

			expect(result).toEqual({ success: true });
			expect(await findMcqById(db, "user-1", "mcq-1")).toBeNull();
		});

		it("returns not_found when the mcq does not exist", async () => {
			const db = createMockDb(createOwnedMcqSeed());
			const result = await deleteMcq(db, "user-1", "missing-mcq");

			expect(result).toEqual({ success: false, error: "not_found" });
		});

		it("returns not_found when another user owns the mcq", async () => {
			const db = createMockDb(createOwnedMcqSeed("user-1"));
			const result = await deleteMcq(db, "user-2", "mcq-1");

			expect(result).toEqual({ success: false, error: "not_found" });
			expect(await findMcqById(db, "user-1", "mcq-1")).not.toBeNull();
		});
	});

	describe("recordAttempt", () => {
		it("records an attempt with correctness", async () => {
			const db = createMockDb(createOwnedMcqSeed());
			const correctResult = await recordAttempt(db, "user-1", "mcq-1", "choice-1");
			const incorrectResult = await recordAttempt(db, "user-1", "mcq-1", "choice-2");

			expect(correctResult.success).toBe(true);
			if (correctResult.success) {
				expect(correctResult.attempt.isCorrect).toBe(true);
			}

			expect(incorrectResult.success).toBe(true);
			if (incorrectResult.success) {
				expect(incorrectResult.attempt.isCorrect).toBe(false);
			}
		});

		it("returns not_found when the mcq does not exist", async () => {
			const db = createMockDb(createOwnedMcqSeed());
			const result = await recordAttempt(db, "user-1", "missing-mcq", "choice-1");

			expect(result).toEqual({ success: false, error: "not_found" });
		});

		it("returns not_found when another user owns the mcq", async () => {
			const db = createMockDb(createOwnedMcqSeed("user-1"));
			const result = await recordAttempt(db, "user-2", "mcq-1", "choice-1");

			expect(result).toEqual({ success: false, error: "not_found" });
		});

		it("returns invalid_choice when the choice does not belong to the mcq", async () => {
			const db = createMockDb(createOwnedMcqSeed());
			const result = await recordAttempt(db, "user-1", "mcq-1", "choice-missing");

			expect(result).toEqual({ success: false, error: "invalid_choice" });
		});

		it("returns record_failed when the database insert fails", async () => {
			const db = createMockDb({ ...createOwnedMcqSeed(), insertAttemptShouldFail: true });
			const result = await recordAttempt(db, "user-1", "mcq-1", "choice-1");

			expect(result).toEqual({ success: false, error: "record_failed" });
		});
	});
});
