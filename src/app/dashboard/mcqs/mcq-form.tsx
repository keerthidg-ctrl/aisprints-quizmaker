"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { createMcqAction, updateMcqAction, type McqActionState } from "@/app/dashboard/mcqs/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MAX_MCQ_CHOICES, MIN_MCQ_CHOICES } from "@/lib/mcq/validation";

type McqFormChoice = {
	text: string;
	isCorrect: boolean;
};

type McqFormProps = {
	mode: "create" | "edit";
	mcqId?: string;
	initialValues?: {
		name: string;
		question: string;
		choices: McqFormChoice[];
	};
};

const initialState: McqActionState = {};

function createDefaultChoices(): McqFormChoice[] {
	return [
		{ text: "", isCorrect: true },
		{ text: "", isCorrect: false },
	];
}

export function McqForm({ mode, mcqId, initialValues }: McqFormProps) {
	const action = mode === "create" ? createMcqAction : updateMcqAction.bind(null, mcqId ?? "");
	const [state, formAction, isPending] = useActionState(action, initialState);
	const [choices, setChoices] = useState<McqFormChoice[]>(initialValues?.choices ?? createDefaultChoices());
	const [correctIndex, setCorrectIndex] = useState(
		initialValues?.choices.findIndex((choice) => choice.isCorrect) ?? 0,
	);

	function updateChoiceText(index: number, text: string) {
		setChoices((current) => current.map((choice, choiceIndex) => (choiceIndex === index ? { ...choice, text } : choice)));
	}

	function addChoice() {
		if (choices.length >= MAX_MCQ_CHOICES) {
			return;
		}

		setChoices((current) => [...current, { text: "", isCorrect: false }]);
	}

	function removeChoice(index: number) {
		if (choices.length <= MIN_MCQ_CHOICES) {
			return;
		}

		setChoices((current) => current.filter((_, choiceIndex) => choiceIndex !== index));
		setCorrectIndex((current) => {
			if (current === index) {
				return 0;
			}
			if (current > index) {
				return current - 1;
			}
			return current;
		});
	}

	return (
		<Card className="w-full max-w-3xl">
			<CardHeader>
				<CardTitle>{mode === "create" ? "Create Multiple Choice Question" : "Edit Multiple Choice Question"}</CardTitle>
				<CardDescription>
					Provide a name, question text, and between {MIN_MCQ_CHOICES} and {MAX_MCQ_CHOICES} answer choices. Mark one
					choice as correct.
				</CardDescription>
			</CardHeader>
			<form action={formAction}>
				<CardContent>
					<FieldGroup>
						{state.formError ? (
							<div
								role="alert"
								className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
							>
								{state.formError}
							</div>
						) : null}

						<input type="hidden" name="choiceCount" value={choices.length} />
						<input type="hidden" name="correctChoiceIndex" value={correctIndex} />

						<Field data-invalid={!!state.errors?.name}>
							<FieldLabel htmlFor="name">Name</FieldLabel>
							<Input
								id="name"
								name="name"
								defaultValue={initialValues?.name ?? ""}
								placeholder="e.g. Chapter 1 Review"
								aria-invalid={!!state.errors?.name}
								required
							/>
							<FieldError errors={state.errors?.name ? [{ message: state.errors.name }] : undefined} />
						</Field>

						<Field data-invalid={!!state.errors?.question}>
							<FieldLabel htmlFor="question">Question</FieldLabel>
							<Textarea
								id="question"
								name="question"
								defaultValue={initialValues?.question ?? ""}
								placeholder="Enter the question text"
								aria-invalid={!!state.errors?.question}
								required
							/>
							<FieldError errors={state.errors?.question ? [{ message: state.errors.question }] : undefined} />
						</Field>

						<div className="space-y-3">
							<div>
								<p className="text-sm font-medium">Answer Choices</p>
								<p className="text-sm text-muted-foreground">Select the radio button next to the correct answer.</p>
							</div>

							{choices.map((choice, index) => (
								<div key={index} className="flex items-start gap-3 rounded-lg border p-3">
									<input
										type="radio"
										name="correctChoicePreview"
										checked={correctIndex === index}
										onChange={() => setCorrectIndex(index)}
										aria-label={`Mark choice ${index + 1} as correct`}
										className="mt-2"
									/>
									<Field className="flex-1" data-invalid={!!state.errors?.choices}>
										<FieldLabel htmlFor={`choiceText_${index}`}>Choice {index + 1}</FieldLabel>
										<Input
											id={`choiceText_${index}`}
											name={`choiceText_${index}`}
											value={choice.text}
											onChange={(event) => updateChoiceText(index, event.target.value)}
											placeholder={`Enter choice ${index + 1}`}
											required
										/>
									</Field>
									<Button
										type="button"
										variant="outline"
										onClick={() => removeChoice(index)}
										disabled={choices.length <= MIN_MCQ_CHOICES}
									>
										Remove
									</Button>
								</div>
							))}

							<FieldError errors={state.errors?.choices ? [{ message: state.errors.choices }] : undefined} />

							<Button type="button" variant="outline" onClick={addChoice} disabled={choices.length >= MAX_MCQ_CHOICES}>
								Add Choice
							</Button>
						</div>
					</FieldGroup>
				</CardContent>
				<CardFooter className="flex gap-3">
					<Button type="submit" disabled={isPending}>
						{isPending ? "Saving..." : "Save"}
					</Button>
					<Button type="button" variant="outline" render={<Link href="/dashboard/mcqs" />}>
						Cancel
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}
