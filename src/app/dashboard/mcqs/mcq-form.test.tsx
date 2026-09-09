import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { McqForm } from "@/app/dashboard/mcqs/mcq-form";

vi.mock("@/app/dashboard/mcqs/actions", () => ({
	createMcqAction: vi.fn(async () => ({})),
	updateMcqAction: vi.fn(async () => ({})),
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

function getHiddenInputValue(name: string): string {
	const input = document.querySelector(`input[name="${name}"]`) as HTMLInputElement | null;
	return input?.value ?? "";
}

describe("McqForm", () => {
	it("renders the create form with two default choices", () => {
		render(<McqForm mode="create" />);

		expect(screen.getByText("Create Multiple Choice Question")).toBeTruthy();
		expect(screen.getByLabelText("Name")).toBeTruthy();
		expect(screen.getByLabelText("Question")).toBeTruthy();
		expect(screen.getByLabelText("Choice 1")).toBeTruthy();
		expect(screen.getByLabelText("Choice 2")).toBeTruthy();
		expect(getHiddenInputValue("choiceCount")).toBe("2");
	});

	it("prefills edit values and shows the edit title", () => {
		render(
			<McqForm
				mode="edit"
				mcqId="mcq-1"
				initialValues={{
					name: "Chapter 1",
					question: "What is 2 + 2?",
					choices: [
						{ text: "3", isCorrect: false },
						{ text: "4", isCorrect: true },
					],
				}}
			/>,
		);

		expect(screen.getByText("Edit Multiple Choice Question")).toBeTruthy();
		expect(screen.getByDisplayValue("Chapter 1")).toBeTruthy();
		expect(screen.getByDisplayValue("What is 2 + 2?")).toBeTruthy();
		expect(screen.getByDisplayValue("3")).toBeTruthy();
		expect(screen.getByDisplayValue("4")).toBeTruthy();
	});

	it("adds and removes choice rows within the allowed range", async () => {
		const user = userEvent.setup();
		render(<McqForm mode="create" />);

		await user.click(screen.getByRole("button", { name: "Add Choice" }));
		expect(screen.getByLabelText("Choice 3")).toBeTruthy();
		expect(getHiddenInputValue("choiceCount")).toBe("3");

		await user.click(screen.getAllByRole("button", { name: "Remove" })[2]);
		expect(screen.queryByLabelText("Choice 3")).toBeNull();
		expect(getHiddenInputValue("choiceCount")).toBe("2");
	});

	it("disables add and remove buttons at the choice limits", async () => {
		const user = userEvent.setup();
		render(<McqForm mode="create" />);

		for (let index = 0; index < 4; index++) {
			await user.click(screen.getByRole("button", { name: "Add Choice" }));
		}

		expect(getHiddenInputValue("choiceCount")).toBe("6");
		expect(screen.getByRole("button", { name: "Add Choice" }).hasAttribute("disabled")).toBe(true);
		expect(screen.getAllByRole("button", { name: "Remove" }).every((button) => button.hasAttribute("disabled"))).toBe(
			false,
		);

		for (let index = 0; index < 4; index++) {
			await user.click(screen.getAllByRole("button", { name: "Remove" })[0]);
		}

		expect(getHiddenInputValue("choiceCount")).toBe("2");
		expect(screen.getAllByRole("button", { name: "Remove" }).every((button) => button.hasAttribute("disabled"))).toBe(
			true,
		);
	});

	it("updates the hidden correct choice index when a radio button is selected", async () => {
		const user = userEvent.setup();
		render(<McqForm mode="create" />);

		await user.click(screen.getByRole("radio", { name: "Mark choice 2 as correct" }));
		expect(getHiddenInputValue("correctChoiceIndex")).toBe("1");
	});

	it("links cancel back to the mcq list", () => {
		render(<McqForm mode="create" />);

		expect(screen.getByRole("link", { name: "Cancel" }).getAttribute("href")).toBe("/dashboard/mcqs");
	});
});
