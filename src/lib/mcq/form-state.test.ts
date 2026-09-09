import { describe, expect, it } from "vitest";

import {
	addChoiceRow,
	canAddChoice,
	canRemoveChoice,
	createDefaultChoices,
	getInitialCorrectIndex,
	getMcqFormTitle,
	mapMcqRecordToFormValues,
	removeChoiceAt,
	updateChoiceAt,
} from "@/lib/mcq/form-state";

describe("mcq form state", () => {
	it("creates two default empty choices", () => {
		expect(createDefaultChoices()).toEqual([
			{ text: "", isCorrect: true },
			{ text: "", isCorrect: false },
		]);
	});

	it("finds the initial correct choice index", () => {
		expect(
			getInitialCorrectIndex([
				{ text: "A", isCorrect: false },
				{ text: "B", isCorrect: true },
			]),
		).toBe(1);
	});

	it("updates a single choice row", () => {
		const choices = createDefaultChoices();
		expect(updateChoiceAt(choices, 1, "Updated")).toEqual([
			{ text: "", isCorrect: true },
			{ text: "Updated", isCorrect: false },
		]);
	});

	it("adds a choice up to the maximum", () => {
		let choices = createDefaultChoices();
		for (let index = choices.length; index < 6; index++) {
			choices = addChoiceRow(choices);
		}

		expect(choices).toHaveLength(6);
		expect(addChoiceRow(choices)).toHaveLength(6);
	});

	it("removes a choice and shifts the correct index when needed", () => {
		const result = removeChoiceAt(
			[
				{ text: "A", isCorrect: true },
				{ text: "B", isCorrect: false },
				{ text: "C", isCorrect: false },
			],
			0,
			0,
		);

		expect(result.choices).toHaveLength(2);
		expect(result.correctIndex).toBe(0);
	});

	it("does not remove below the minimum choice count", () => {
		const choices = createDefaultChoices();
		expect(removeChoiceAt(choices, 0, 0)).toEqual({ choices, correctIndex: 0 });
	});

	it("reports when choices can be added or removed", () => {
		expect(canAddChoice(2)).toBe(true);
		expect(canAddChoice(6)).toBe(false);
		expect(canRemoveChoice(2)).toBe(false);
		expect(canRemoveChoice(3)).toBe(true);
	});

	it("maps an mcq record into form values", () => {
		expect(
			mapMcqRecordToFormValues({
				name: "Quiz 1",
				question: "2 + 2?",
				choices: [
					{ choiceText: "3", isCorrect: false },
					{ choiceText: "4", isCorrect: true },
				],
			}),
		).toEqual({
			name: "Quiz 1",
			question: "2 + 2?",
			choices: [
				{ text: "3", isCorrect: false },
				{ text: "4", isCorrect: true },
			],
		});
	});

	it("returns the form title for create and edit modes", () => {
		expect(getMcqFormTitle("create")).toBe("Create Multiple Choice Question");
		expect(getMcqFormTitle("edit")).toBe("Edit Multiple Choice Question");
	});
});
