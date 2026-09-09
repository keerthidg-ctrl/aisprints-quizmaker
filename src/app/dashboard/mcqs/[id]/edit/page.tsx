import { notFound } from "next/navigation";

import { McqForm } from "@/app/dashboard/mcqs/mcq-form";
import { mapMcqRecordToFormValues } from "@/lib/mcq/form-state";
import { requireAuth } from "@/lib/auth/route-guards";
import { getDb } from "@/lib/db";
import { findMcqById } from "@/lib/services/mcq-service";

type EditMcqPageProps = {
	params: Promise<{ id: string }>;
};

export default async function EditMcqPage({ params }: EditMcqPageProps) {
	const user = await requireAuth();
	const { id } = await params;
	const db = await getDb();
	const mcq = await findMcqById(db, user.id, id);

	if (!mcq) {
		notFound();
	}

	return (
		<div className="flex min-h-screen items-start justify-center bg-background px-4 py-12">
			<McqForm mode="edit" mcqId={mcq.id} initialValues={mapMcqRecordToFormValues(mcq)} />
		</div>
	);
}
