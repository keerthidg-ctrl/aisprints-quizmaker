"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { EllipsisVerticalIcon } from "lucide-react";

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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type McqActionsMenuProps = {
	mcqId: string;
	mcqName: string;
};

export function McqActionsMenu({ mcqId, mcqName }: McqActionsMenuProps) {
	const router = useRouter();
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [deleteError, setDeleteError] = useState<string | undefined>();
	const [isPending, startTransition] = useTransition();

	function handleDelete() {
		startTransition(async () => {
			const result = await deleteMcqAction(mcqId);
			if (!result.success) {
				setDeleteError(result.error ?? "Something went wrong while deleting the question.");
				return;
			}

			setDeleteOpen(false);
			router.refresh();
		});
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger
					render={
						<Button variant="ghost" size="icon" aria-label={`Actions for ${mcqName}`}>
							<EllipsisVerticalIcon />
						</Button>
					}
				/>
				<DropdownMenuContent align="end">
					<DropdownMenuItem render={<Link href={`/dashboard/mcqs/${mcqId}/edit`} />}>Edit</DropdownMenuItem>
					<DropdownMenuItem render={<Link href={`/dashboard/mcqs/${mcqId}/preview`} />}>Preview</DropdownMenuItem>
					<DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>Delete</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
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
		</>
	);
}
