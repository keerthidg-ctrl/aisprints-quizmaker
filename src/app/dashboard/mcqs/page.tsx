import Link from "next/link";

import { McqActionsMenu } from "@/app/dashboard/mcqs/mcq-actions-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatMcqListDescription, truncateText } from "@/lib/mcq/format";
import { getMcqCreatePath } from "@/lib/mcq/paths";
import { requireAuth } from "@/lib/auth/route-guards";
import { getDb } from "@/lib/db";
import { listMcqsByUser } from "@/lib/services/mcq-service";

export default async function McqsPage() {
	const user = await requireAuth();
	const db = await getDb();
	const mcqs = await listMcqsByUser(db, user.id);

	return (
		<div className="min-h-screen bg-background px-4 py-12">
			<div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="text-2xl font-semibold tracking-tight">Multiple Choice Questions</h1>
						<p className="text-sm text-muted-foreground">Create, edit, preview, and delete your multiple choice questions.</p>
					</div>
					<Button render={<Link href={getMcqCreatePath()} />}>Create Question</Button>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Your Questions</CardTitle>
						<CardDescription>{formatMcqListDescription(mcqs.length)}</CardDescription>
					</CardHeader>
					<CardContent>
						{mcqs.length === 0 ? (
							<div className="rounded-lg border border-dashed p-8 text-center">
								<p className="text-sm text-muted-foreground">You have not created any multiple choice questions yet.</p>
								<Button className="mt-4" render={<Link href={getMcqCreatePath()} />}>Create your first question</Button>
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Name</TableHead>
										<TableHead>Question</TableHead>
										<TableHead className="w-[80px] text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{mcqs.map((mcq) => (
										<TableRow key={mcq.id}>
											<TableCell className="font-medium">{mcq.name}</TableCell>
											<TableCell className="max-w-md whitespace-normal text-muted-foreground">
												{truncateText(mcq.question, 120)}
											</TableCell>
											<TableCell className="text-right">
												<McqActionsMenu mcqId={mcq.id} mcqName={mcq.name} />
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>

				<div>
					<Button variant="outline" render={<Link href="/dashboard" />}>Back to Dashboard</Button>
				</div>
			</div>
		</div>
	);
}
