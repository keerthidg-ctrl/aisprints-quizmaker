import { McqForm } from "@/app/dashboard/mcqs/mcq-form";
import { requireAuth } from "@/lib/auth/route-guards";

export default async function NewMcqPage() {
	await requireAuth();

	return (
		<div className="flex min-h-screen items-start justify-center bg-background px-4 py-12">
			<McqForm mode="create" />
		</div>
	);
}
