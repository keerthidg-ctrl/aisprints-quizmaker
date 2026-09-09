export type PreviewChoice = {
	id: string;
	choiceText: string;
};

export function mapMcqToPreviewChoices(
	choices: Array<{ id: string; choiceText: string }>,
): PreviewChoice[] {
	return choices.map((choice) => ({
		id: choice.id,
		choiceText: choice.choiceText,
	}));
}

export function getAttemptFeedbackMessage(isCorrect: boolean): string {
	return isCorrect ? "Correct! Your attempt was recorded." : "Incorrect. Your attempt was recorded.";
}

export function getAttemptFeedbackTone(isCorrect: boolean): "success" | "error" {
	return isCorrect ? "success" : "error";
}
