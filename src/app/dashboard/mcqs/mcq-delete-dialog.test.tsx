import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { deleteMcqAction } from "@/app/dashboard/mcqs/actions";
import { McqDeleteDialog } from "@/app/dashboard/mcqs/mcq-delete-dialog";

const refresh = vi.fn();

vi.mock("@/app/dashboard/mcqs/actions", () => ({
	deleteMcqAction: vi.fn(),
}));

vi.mock("next/navigation", () => ({
	useRouter: vi.fn(() => ({ refresh })),
}));

describe("McqDeleteDialog", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("shows the mcq name in the confirmation copy", () => {
		render(<McqDeleteDialog mcqId="mcq-1" mcqName="Chapter 1" open onOpenChange={vi.fn()} />);

		expect(screen.getByRole("dialog")).toBeTruthy();
		expect(screen.getByText(/permanently delete/i).textContent).toContain("Chapter 1");
	});

	it("deletes the mcq and refreshes the page on success", async () => {
		const user = userEvent.setup();
		const onOpenChange = vi.fn();
		vi.mocked(deleteMcqAction).mockResolvedValue({ success: true });

		render(<McqDeleteDialog mcqId="mcq-1" mcqName="Chapter 1" open onOpenChange={onOpenChange} />);

		await user.click(screen.getByRole("button", { name: "Delete" }));

		await waitFor(() => {
			expect(deleteMcqAction).toHaveBeenCalledWith("mcq-1");
			expect(onOpenChange).toHaveBeenCalledWith(false);
			expect(refresh).toHaveBeenCalled();
		});
	});

	it("shows an error when deletion fails", async () => {
		const user = userEvent.setup();
		vi.mocked(deleteMcqAction).mockResolvedValue({
			success: false,
			error: "This question could not be found.",
		});

		render(<McqDeleteDialog mcqId="mcq-1" mcqName="Chapter 1" open onOpenChange={vi.fn()} />);

		await user.click(screen.getByRole("button", { name: "Delete" }));

		expect((await screen.findByRole("alert")).textContent).toContain("This question could not be found.");
		expect(refresh).not.toHaveBeenCalled();
	});
});
