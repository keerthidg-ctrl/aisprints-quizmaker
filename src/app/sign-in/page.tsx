import { SignInForm } from "@/app/sign-in/sign-in-form";

type SignInPageProps = {
	searchParams: Promise<{ registered?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
	const params = await searchParams;
	const successMessage =
		params.registered === "1" ? "Account created successfully. Please sign in." : undefined;

	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
			<SignInForm successMessage={successMessage} />
		</div>
	);
}
