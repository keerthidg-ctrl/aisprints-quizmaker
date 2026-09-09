"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteMcqAction } from "@/app/dashboard/mcqs/actions";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

type McqDeleteDialogProps = {
	mcqId: string;
	mcqName: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function McqDeleteDialog({ mcqId, mcqName, open, onOpenChange }: McqDeleteDialogProps) {
	const router = useRouter();
	const [deleteError, setDeleteError] = useState<string | undefined>();
	const [isPending, startTransition] = useTransition();

	function handleDelete() {
		startTransition(async () => {
			const result = await deleteMcqAction(mcqId);
			if (!result.success) {
				setDeleteError(result.error ?? "Something went wrong while deleting the question.");
				return;
			}

			setDeleteError(undefined);
			onOpenChange(false);
			router.refresh();
		});
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				if (!nextOpen) {
					setDeleteError(undefined);
				}
				onOpenChange(nextOpen);
			}}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete question?</DialogTitle>
					<DialogDescription>
						This will permanently delete <span className="font-medium text-foreground">{mcqName}</span> and all of its
						choices and attempts.
					</DialogDescription>
				</DialogHeader>
				{deleteError ? (
					<div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
						{deleteError}
					</div>
				) : null}
				<DialogFooter>
					<DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
					<Button variant="destructive" onClick={handleDelete} disabled={isPending}>
						{isPending ? "Deleting..." : "Delete"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
