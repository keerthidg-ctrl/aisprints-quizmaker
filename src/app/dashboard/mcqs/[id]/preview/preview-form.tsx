"use client";

import Link from "next/link";
import { useActionState } from "react";

import { submitAttemptAction, type AttemptActionState } from "@/app/dashboard/mcqs/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { getMcqListPath } from "@/lib/mcq/paths";
import {
	getAttemptFeedbackMessage,
	getAttemptFeedbackTone,
	type PreviewChoice,
} from "@/lib/mcq/preview";

type PreviewFormProps = {
	mcqId: string;
	name: string;
	question: string;
	choices: PreviewChoice[];
};

const initialState: AttemptActionState = {};

export function PreviewForm({ mcqId, name, question, choices }: PreviewFormProps) {
	const [state, formAction, isPending] = useActionState(submitAttemptAction.bind(null, mcqId), initialState);
	const feedbackTone = state.isCorrect === undefined ? null : getAttemptFeedbackTone(state.isCorrect);

	return (
		<Card className="w-full max-w-3xl">
			<CardHeader>
				<CardTitle>{name}</CardTitle>
				<CardDescription>Preview mode — submit an answer to record an attempt.</CardDescription>
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

						{state.isCorrect !== undefined ? (
							<div
								role="status"
								className={`rounded-lg border px-3 py-2 text-sm ${
									feedbackTone === "success"
										? "border-primary/30 bg-primary/10 text-primary"
										: "border-destructive/30 bg-destructive/10 text-destructive"
								}`}
							>
								{getAttemptFeedbackMessage(state.isCorrect)}
							</div>
						) : null}

						<p className="text-base font-medium">{question}</p>

						<div className="space-y-3">
							{choices.map((choice, index) => (
								<Field key={choice.id}>
									<div className="flex items-center gap-3 rounded-lg border p-3">
										<input
											type="radio"
											id={`choice_${choice.id}`}
											name="choiceId"
											value={choice.id}
											required
										/>
										<FieldLabel htmlFor={`choice_${choice.id}`} className="font-normal">
											{index + 1}. {choice.choiceText}
										</FieldLabel>
									</div>
								</Field>
							))}
						</div>
					</FieldGroup>
				</CardContent>
				<CardFooter className="flex gap-3">
					<Button type="submit" disabled={isPending}>
						{isPending ? "Submitting..." : "Submit Answer"}
					</Button>
					<Button type="button" variant="outline" render={<Link href={getMcqListPath()} />}>
						Back to List
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}
