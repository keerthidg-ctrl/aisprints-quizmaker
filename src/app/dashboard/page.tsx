import Link from "next/link";

import { logoutAction } from "@/app/logout/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAuth } from "@/lib/auth/route-guards";

export default async function DashboardPage() {
	const user = await requireAuth();

	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
			<Card className="w-full max-w-lg">
				<CardHeader>
					<CardTitle>Dashboard</CardTitle>
					<CardDescription>Welcome back, {user.fullName}.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-sm text-muted-foreground">
						Manage your multiple choice questions or sign out when you are done.
					</p>
					<Button className="w-full" render={<Link href="/dashboard/mcqs" />}>
						Manage Multiple Choice Questions
					</Button>
				</CardContent>
				<CardFooter>
					<form action={logoutAction}>
						<Button type="submit" variant="outline">
							Log Out
						</Button>
					</form>
				</CardFooter>
			</Card>
		</div>
	);
}
