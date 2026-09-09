import { MAX_MCQ_CHOICES, MIN_MCQ_CHOICES } from "@/lib/mcq/validation";

export type McqFormChoice = {
	text: string;
	isCorrect: boolean;
};

export type McqFormValues = {
	name: string;
	question: string;
	choices: McqFormChoice[];
};

export function createDefaultChoices(): McqFormChoice[] {
	return [
		{ text: "", isCorrect: true },
		{ text: "", isCorrect: false },
	];
}

export function getInitialCorrectIndex(choices: McqFormChoice[]): number {
	const index = choices.findIndex((choice) => choice.isCorrect);
	return index >= 0 ? index : 0;
}

export function updateChoiceAt(choices: McqFormChoice[], index: number, text: string): McqFormChoice[] {
	return choices.map((choice, choiceIndex) => (choiceIndex === index ? { ...choice, text } : choice));
}

export function addChoiceRow(choices: McqFormChoice[]): McqFormChoice[] {
	if (choices.length >= MAX_MCQ_CHOICES) {
		return choices;
	}

	return [...choices, { text: "", isCorrect: false }];
}

export function removeChoiceAt(
	choices: McqFormChoice[],
	index: number,
	correctIndex: number,
): { choices: McqFormChoice[]; correctIndex: number } {
	if (choices.length <= MIN_MCQ_CHOICES) {
		return { choices, correctIndex };
	}

	const nextChoices = choices.filter((_, choiceIndex) => choiceIndex !== index);
	let nextCorrectIndex = correctIndex;

	if (correctIndex === index) {
		nextCorrectIndex = 0;
	} else if (correctIndex > index) {
		nextCorrectIndex = correctIndex - 1;
	}

	return { choices: nextChoices, correctIndex: nextCorrectIndex };
}

export function canAddChoice(choiceCount: number): boolean {
	return choiceCount < MAX_MCQ_CHOICES;
}

export function canRemoveChoice(choiceCount: number): boolean {
	return choiceCount > MIN_MCQ_CHOICES;
}

export function getMcqFormTitle(mode: "create" | "edit"): string {
	return mode === "create" ? "Create Multiple Choice Question" : "Edit Multiple Choice Question";
}

export function mapMcqRecordToFormValues(mcq: {
	name: string;
	question: string;
	choices: Array<{ choiceText: string; isCorrect: boolean }>;
}): McqFormValues {
	return {
		name: mcq.name,
		question: mcq.question,
		choices: mcq.choices.map((choice) => ({
			text: choice.choiceText,
			isCorrect: choice.isCorrect,
		})),
	};
}
