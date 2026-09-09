export type McqFieldErrors = Partial<Record<string, string>>;

export const MIN_MCQ_CHOICES = 2;
export const MAX_MCQ_CHOICES = 6;

export interface McqChoiceInput {
	text: string;
	isCorrect: boolean;
}

export interface McqFormInput {
	name: string;
	question: string;
	choices: McqChoiceInput[];
}

export function validateMcqName(value: string): string | undefined {
	const trimmed = value.trim();
	if (!trimmed) {
		return "Name is required.";
	}
	if (trimmed.length > 120) {
		return "Name must not exceed 120 characters.";
	}
	return undefined;
}

export function validateMcqQuestion(value: string): string | undefined {
	const trimmed = value.trim();
	if (!trimmed) {
		return "Question is required.";
	}
	if (trimmed.length > 2000) {
		return "Question must not exceed 2000 characters.";
	}
	return undefined;
}

export function validateMcqChoices(choices: McqChoiceInput[]): string | undefined {
	if (choices.length < MIN_MCQ_CHOICES) {
		return `At least ${MIN_MCQ_CHOICES} choices are required.`;
	}
	if (choices.length > MAX_MCQ_CHOICES) {
		return `No more than ${MAX_MCQ_CHOICES} choices are allowed.`;
	}

	for (let index = 0; index < choices.length; index++) {
		const text = choices[index].text.trim();
		if (!text) {
			return `Choice ${index + 1} text is required.`;
		}
		if (text.length > 500) {
			return `Choice ${index + 1} must not exceed 500 characters.`;
		}
	}

	const correctCount = choices.filter((choice) => choice.isCorrect).length;
	if (correctCount !== 1) {
		return "Exactly one choice must be marked as correct.";
	}

	return undefined;
}

function collectErrors(entries: Array<[string, string | undefined]>): McqFieldErrors {
	return Object.fromEntries(entries.filter((entry): entry is [string, string] => entry[1] !== undefined));
}

export function validateMcqForm(input: McqFormInput): McqFieldErrors {
	return collectErrors([
		["name", validateMcqName(input.name)],
		["question", validateMcqQuestion(input.question)],
		["choices", validateMcqChoices(input.choices)],
	]);
}

export function parseMcqFormData(formData: FormData): McqFormInput {
	const choiceCount = Number(formData.get("choiceCount") ?? "0");
	const choices: McqChoiceInput[] = [];
	const correctIndex = Number(formData.get("correctChoiceIndex") ?? "-1");

	for (let index = 0; index < choiceCount; index++) {
		choices.push({
			text: String(formData.get(`choiceText_${index}`) ?? ""),
			isCorrect: index === correctIndex,
		});
	}

	return {
		name: String(formData.get("name") ?? ""),
		question: String(formData.get("question") ?? ""),
		choices,
	};
}
