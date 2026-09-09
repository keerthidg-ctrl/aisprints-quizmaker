"use client";

import Link from "next/link";
import { useState } from "react";
import { EllipsisVerticalIcon } from "lucide-react";

import { McqDeleteDialog } from "@/app/dashboard/mcqs/mcq-delete-dialog";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getMcqEditPath, getMcqPreviewPath } from "@/lib/mcq/paths";

type McqActionsMenuProps = {
	mcqId: string;
	mcqName: string;
};

export function McqActionsMenu({ mcqId, mcqName }: McqActionsMenuProps) {
	const [deleteOpen, setDeleteOpen] = useState(false);

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
					<DropdownMenuItem render={<Link href={getMcqEditPath(mcqId)} />}>Edit</DropdownMenuItem>
					<DropdownMenuItem render={<Link href={getMcqPreviewPath(mcqId)} />}>Preview</DropdownMenuItem>
					<DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>Delete</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<McqDeleteDialog mcqId={mcqId} mcqName={mcqName} open={deleteOpen} onOpenChange={setDeleteOpen} />
		</>
	);
}
