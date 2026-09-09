import { describe, expect, it } from "vitest";

import {
	getAttemptFeedbackMessage,
	getAttemptFeedbackTone,
	mapMcqToPreviewChoices,
} from "@/lib/mcq/preview";

describe("mcq preview helpers", () => {
	it("maps mcq choices into preview choices", () => {
		expect(
			mapMcqToPreviewChoices([
				{ id: "choice-1", choiceText: "Paris" },
				{ id: "choice-2", choiceText: "London" },
			]),
		).toEqual([
			{ id: "choice-1", choiceText: "Paris" },
			{ id: "choice-2", choiceText: "London" },
		]);
	});

	it("returns the correct feedback message for a correct attempt", () => {
		expect(getAttemptFeedbackMessage(true)).toBe("Correct! Your attempt was recorded.");
		expect(getAttemptFeedbackTone(true)).toBe("success");
	});

	it("returns the incorrect feedback message for a wrong attempt", () => {
		expect(getAttemptFeedbackMessage(false)).toBe("Incorrect. Your attempt was recorded.");
		expect(getAttemptFeedbackTone(false)).toBe("error");
	});
});
