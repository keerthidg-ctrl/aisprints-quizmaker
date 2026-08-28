"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signInAction, type SignInActionState } from "@/app/sign-in/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const initialState: SignInActionState = {};

type SignInFormProps = {
	successMessage?: string;
};

export function SignInForm({ successMessage }: SignInFormProps) {
	const [state, formAction, isPending] = useActionState(signInAction, initialState);

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle>Sign in to your account</CardTitle>
				<CardDescription>Enter your email and password to continue.</CardDescription>
			</CardHeader>
			<form action={formAction}>
				<CardContent>
					<FieldGroup>
						{successMessage ? (
							<div
								role="status"
								className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-foreground"
							>
								{successMessage}
							</div>
						) : null}

						{state.formError ? (
							<div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
								{state.formError}
							</div>
						) : null}

						<Field data-invalid={!!state.errors?.email}>
							<FieldLabel htmlFor="email">Email</FieldLabel>
							<Input
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								placeholder="Enter your email"
								aria-invalid={!!state.errors?.email}
								required
							/>
							<FieldError errors={state.errors?.email ? [{ message: state.errors.email }] : undefined} />
						</Field>

						<Field data-invalid={!!state.errors?.password}>
							<FieldLabel htmlFor="password">Password</FieldLabel>
							<Input
								id="password"
								name="password"
								type="password"
								autoComplete="current-password"
								placeholder="Enter your password"
								aria-invalid={!!state.errors?.password}
								required
							/>
							<FieldError errors={state.errors?.password ? [{ message: state.errors.password }] : undefined} />
						</Field>

					</FieldGroup>
				</CardContent>
				<CardFooter className="flex flex-col gap-4 border-t-0 bg-transparent">
					<Button type="submit" className="w-full" disabled={isPending}>
						{isPending ? "Signing in..." : "Sign In"}
					</Button>
					<p className="text-center text-sm text-muted-foreground">
						Don&apos;t have an account?{" "}
						<Link href="/sign-up" className="text-primary underline-offset-4 hover:underline">
							Sign Up
						</Link>
					</p>
				</CardFooter>
			</form>
		</Card>
	);
}
