import { SignUpForm } from "@/app/sign-up/sign-up-form";
import { redirectIfAuthenticated } from "@/lib/auth/route-guards";

export default async function SignUpPage() {
	await redirectIfAuthenticated();

	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
			<SignUpForm />
		</div>
	);
}
