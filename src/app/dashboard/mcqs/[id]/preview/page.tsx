import { notFound } from "next/navigation";

import { PreviewForm } from "@/app/dashboard/mcqs/[id]/preview/preview-form";
import { mapMcqToPreviewChoices } from "@/lib/mcq/preview";
import { requireAuth } from "@/lib/auth/route-guards";
import { getDb } from "@/lib/db";
import { findMcqById } from "@/lib/services/mcq-service";

type PreviewMcqPageProps = {
	params: Promise<{ id: string }>;
};

export default async function PreviewMcqPage({ params }: PreviewMcqPageProps) {
	const user = await requireAuth();
	const { id } = await params;
	const db = await getDb();
	const mcq = await findMcqById(db, user.id, id);

	if (!mcq) {
		notFound();
	}

	return (
		<div className="flex min-h-screen items-start justify-center bg-background px-4 py-12">
			<PreviewForm
				mcqId={mcq.id}
				name={mcq.name}
				question={mcq.question}
				choices={mapMcqToPreviewChoices(mcq.choices)}
			/>
		</div>
	);
}
