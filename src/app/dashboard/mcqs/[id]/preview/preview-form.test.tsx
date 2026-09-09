import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { submitAttemptAction } from "@/app/dashboard/mcqs/actions";
import { PreviewForm } from "@/app/dashboard/mcqs/[id]/preview/preview-form";

vi.mock("@/app/dashboard/mcqs/actions", () => ({
	submitAttemptAction: vi.fn(async () => ({})),
}));

vi.mock("next/link", () => ({
	default: ({
		children,
		href,
		...props
	}: {
		children: React.ReactNode;
		href: string;
	}) => (
		<a href={href} {...props}>
			{children}
		</a>
	),
}));

const previewChoices = [
	{ id: "choice-1", choiceText: "Paris" },
	{ id: "choice-2", choiceText: "London" },
];

describe("PreviewForm", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders the question and answer choices", () => {
		render(
			<PreviewForm
				mcqId="mcq-1"
				name="Geography Quiz"
				question="What is the capital of France?"
				choices={previewChoices}
			/>,
		);

		expect(screen.getByText("Geography Quiz")).toBeTruthy();
		expect(screen.getByText("What is the capital of France?")).toBeTruthy();
		expect(screen.getByLabelText("1. Paris")).toBeTruthy();
		expect(screen.getByLabelText("2. London")).toBeTruthy();
	});

	it("links back to the mcq list", () => {
		render(
			<PreviewForm
				mcqId="mcq-1"
				name="Geography Quiz"
				question="What is the capital of France?"
				choices={previewChoices}
			/>,
		);

		expect(screen.getByRole("link", { name: "Back to List" }).getAttribute("href")).toBe("/dashboard/mcqs");
	});

	it("shows correct feedback after a successful correct attempt", async () => {
		const user = userEvent.setup();
		vi.mocked(submitAttemptAction).mockResolvedValue({ isCorrect: true });

		render(
			<PreviewForm
				mcqId="mcq-1"
				name="Geography Quiz"
				question="What is the capital of France?"
				choices={previewChoices}
			/>,
		);

		await user.click(screen.getByLabelText("1. Paris"));
		await user.click(screen.getByRole("button", { name: "Submit Answer" }));

		await waitFor(() => {
			expect(screen.getByRole("status").textContent).toContain("Correct! Your attempt was recorded.");
		});
	});

	it("shows incorrect feedback after a wrong attempt", async () => {
		const user = userEvent.setup();
		vi.mocked(submitAttemptAction).mockResolvedValue({ isCorrect: false });

		render(
			<PreviewForm
				mcqId="mcq-1"
				name="Geography Quiz"
				question="What is the capital of France?"
				choices={previewChoices}
			/>,
		);

		await user.click(screen.getByLabelText("2. London"));
		await user.click(screen.getByRole("button", { name: "Submit Answer" }));

		await waitFor(() => {
			expect(screen.getByRole("status").textContent).toContain("Incorrect. Your attempt was recorded.");
		});
	});
});
