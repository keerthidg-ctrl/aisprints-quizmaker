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
				<CardContent>
					<p className="text-sm text-muted-foreground">
						Quiz features are coming in a future sprint. You are signed in and ready to go.
					</p>
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
