import { describe, expect, it } from "vitest";

import {
	MAX_MCQ_CHOICES,
	MIN_MCQ_CHOICES,
	parseMcqFormData,
	validateMcqChoices,
	validateMcqForm,
	validateMcqName,
	validateMcqQuestion,
} from "@/lib/mcq/validation";

describe("mcq validation", () => {
	it("requires a name", () => {
		expect(validateMcqName("")).toBe("Name is required.");
	});

	it("accepts a valid name", () => {
		expect(validateMcqName("Chapter 1 Quiz")).toBeUndefined();
	});

	it("requires a question", () => {
		expect(validateMcqQuestion("")).toBe("Question is required.");
	});

	it("requires at least two choices", () => {
		expect(validateMcqChoices([{ text: "Only one", isCorrect: true }])).toBe(
			`At least ${MIN_MCQ_CHOICES} choices are required.`,
		);
	});

	it("rejects more than six choices", () => {
		const choices = Array.from({ length: MAX_MCQ_CHOICES + 1 }, (_, index) => ({
			text: `Choice ${index + 1}`,
			isCorrect: index === 0,
		}));

		expect(validateMcqChoices(choices)).toBe(`No more than ${MAX_MCQ_CHOICES} choices are allowed.`);
	});

	it("requires exactly one correct choice", () => {
		expect(
			validateMcqChoices([
				{ text: "A", isCorrect: false },
				{ text: "B", isCorrect: false },
			]),
		).toBe("Exactly one choice must be marked as correct.");
	});

	it("validates the full form", () => {
		const errors = validateMcqForm({
			name: "",
			question: "",
			choices: [{ text: "", isCorrect: false }],
		});

		expect(errors.name).toBe("Name is required.");
		expect(errors.question).toBe("Question is required.");
		expect(errors.choices).toBe(`At least ${MIN_MCQ_CHOICES} choices are required.`);
	});

	it("parses form data into mcq input", () => {
		const formData = new FormData();
		formData.set("name", "Sample MCQ");
		formData.set("question", "What is 2 + 2?");
		formData.set("choiceCount", "2");
		formData.set("correctChoiceIndex", "1");
		formData.set("choiceText_0", "3");
		formData.set("choiceText_1", "4");

		expect(parseMcqFormData(formData)).toEqual({
			name: "Sample MCQ",
			question: "What is 2 + 2?",
			choices: [
				{ text: "3", isCorrect: false },
				{ text: "4", isCorrect: true },
			],
		});
	});
});
