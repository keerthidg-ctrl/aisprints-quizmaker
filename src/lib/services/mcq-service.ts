import type { McqChoiceInput, McqFormInput } from "@/lib/mcq/validation";

export interface McqRecord {
	id: string;
	userId: string;
	name: string;
	question: string;
	createdAt: number;
	updatedAt: number;
}

export interface McqChoiceRecord {
	id: string;
	mcqId: string;
	choiceText: string;
	isCorrect: boolean;
	sortOrder: number;
	createdAt: number;
}

export interface McqWithChoices extends McqRecord {
	choices: McqChoiceRecord[];
}

export interface McqAttemptRecord {
	id: string;
	mcqId: string;
	userId: string;
	choiceId: string;
	isCorrect: boolean;
	createdAt: number;
}

interface McqRow {
	id: string;
	user_id: string;
	name: string;
	question: string;
	created_at: number;
	updated_at: number;
}

interface McqChoiceRow {
	id: string;
	mcq_id: string;
	choice_text: string;
	is_correct: number;
	sort_order: number;
	created_at: number;
}

function mapMcq(row: McqRow): McqRecord {
	return {
		id: row.id,
		userId: row.user_id,
		name: row.name,
		question: row.question,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
	};
}

function mapChoice(row: McqChoiceRow): McqChoiceRecord {
	return {
		id: row.id,
		mcqId: row.mcq_id,
		choiceText: row.choice_text,
		isCorrect: row.is_correct === 1,
		sortOrder: row.sort_order,
		createdAt: row.created_at,
	};
}

export async function listMcqsByUser(db: D1Database, userId: string): Promise<McqRecord[]> {
	const result = await db
		.prepare(
			"SELECT id, user_id, name, question, created_at, updated_at FROM mcqs WHERE user_id = ?1 ORDER BY updated_at DESC",
		)
		.bind(userId)
		.all<McqRow>();

	return result.results.map(mapMcq);
}

export async function findMcqById(db: D1Database, userId: string, mcqId: string): Promise<McqWithChoices | null> {
	const mcqResult = await db
		.prepare("SELECT id, user_id, name, question, created_at, updated_at FROM mcqs WHERE id = ?1 AND user_id = ?2")
		.bind(mcqId, userId)
		.all<McqRow>();

	const mcqRow = mcqResult.results[0];
	if (!mcqRow) {
		return null;
	}

	const choicesResult = await db
		.prepare(
			"SELECT id, mcq_id, choice_text, is_correct, sort_order, created_at FROM mcq_choices WHERE mcq_id = ?1 ORDER BY sort_order ASC",
		)
		.bind(mcqId)
		.all<McqChoiceRow>();

	return {
		...mapMcq(mcqRow),
		choices: choicesResult.results.map(mapChoice),
	};
}

async function insertChoices(
	db: D1Database,
	mcqId: string,
	choices: McqChoiceInput[],
	createdAt: number,
): Promise<void> {
	for (let index = 0; index < choices.length; index++) {
		const choice = choices[index];
		await db
			.prepare(
				"INSERT INTO mcq_choices (id, mcq_id, choice_text, is_correct, sort_order, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
			)
			.bind(
				crypto.randomUUID(),
				mcqId,
				choice.text.trim(),
				choice.isCorrect ? 1 : 0,
				index,
				createdAt,
			)
			.run();
	}
}

export type CreateMcqResult = { success: true; mcqId: string } | { success: false; error: "create_failed" };

export async function createMcq(db: D1Database, userId: string, input: McqFormInput): Promise<CreateMcqResult> {
	const id = crypto.randomUUID();
	const now = Date.now();

	try {
		await db
			.prepare(
				"INSERT INTO mcqs (id, user_id, name, question, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
			)
			.bind(id, userId, input.name.trim(), input.question.trim(), now, now)
			.run();

		await insertChoices(db, id, input.choices, now);
	} catch {
		return { success: false, error: "create_failed" };
	}

	return { success: true, mcqId: id };
}

export type UpdateMcqResult =
	| { success: true }
	| { success: false; error: "not_found" | "update_failed" };

export async function updateMcq(
	db: D1Database,
	userId: string,
	mcqId: string,
	input: McqFormInput,
): Promise<UpdateMcqResult> {
	const existing = await findMcqById(db, userId, mcqId);
	if (!existing) {
		return { success: false, error: "not_found" };
	}

	const now = Date.now();

	try {
		await db
			.prepare("UPDATE mcqs SET name = ?1, question = ?2, updated_at = ?3 WHERE id = ?4 AND user_id = ?5")
			.bind(input.name.trim(), input.question.trim(), now, mcqId, userId)
			.run();

		await db.prepare("DELETE FROM mcq_choices WHERE mcq_id = ?1").bind(mcqId).run();
		await insertChoices(db, mcqId, input.choices, now);
	} catch {
		return { success: false, error: "update_failed" };
	}

	return { success: true };
}

export type DeleteMcqResult = { success: true } | { success: false; error: "not_found" | "delete_failed" };

export async function deleteMcq(db: D1Database, userId: string, mcqId: string): Promise<DeleteMcqResult> {
	const existing = await findMcqById(db, userId, mcqId);
	if (!existing) {
		return { success: false, error: "not_found" };
	}

	try {
		await db.prepare("DELETE FROM mcqs WHERE id = ?1 AND user_id = ?2").bind(mcqId, userId).run();
	} catch {
		return { success: false, error: "delete_failed" };
	}

	return { success: true };
}

export type RecordAttemptResult =
	| { success: true; attempt: McqAttemptRecord }
	| { success: false; error: "not_found" | "invalid_choice" | "record_failed" };

export async function recordAttempt(
	db: D1Database,
	userId: string,
	mcqId: string,
	choiceId: string,
): Promise<RecordAttemptResult> {
	const mcq = await findMcqById(db, userId, mcqId);
	if (!mcq) {
		return { success: false, error: "not_found" };
	}

	const selectedChoice = mcq.choices.find((choice) => choice.id === choiceId);
	if (!selectedChoice) {
		return { success: false, error: "invalid_choice" };
	}

	const id = crypto.randomUUID();
	const createdAt = Date.now();

	try {
		await db
			.prepare(
				"INSERT INTO mcq_attempts (id, mcq_id, user_id, choice_id, is_correct, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
			)
			.bind(id, mcqId, userId, choiceId, selectedChoice.isCorrect ? 1 : 0, createdAt)
			.run();
	} catch {
		return { success: false, error: "record_failed" };
	}

	return {
		success: true,
		attempt: {
			id,
			mcqId,
			userId,
			choiceId,
			isCorrect: selectedChoice.isCorrect,
			createdAt,
		},
	};
}
