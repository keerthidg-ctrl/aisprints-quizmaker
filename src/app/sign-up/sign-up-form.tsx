"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signUpAction, type SignUpActionState } from "@/app/sign-up/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const initialState: SignUpActionState = {};

export function SignUpForm() {
	const [state, formAction, isPending] = useActionState(signUpAction, initialState);

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle>Create your account</CardTitle>
				<CardDescription>Register to start using aisprint-quizmaker.</CardDescription>
			</CardHeader>
			<form action={formAction}>
				<CardContent>
					<FieldGroup>
						{state.formError ? (
							<div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
								{state.formError}
							</div>
						) : null}

						<Field data-invalid={!!state.errors?.fullName}>
							<FieldLabel htmlFor="fullName">Full Name</FieldLabel>
							<Input
								id="fullName"
								name="fullName"
								type="text"
								autoComplete="name"
								placeholder="Enter your full name"
								aria-invalid={!!state.errors?.fullName}
								required
							/>
							<FieldError errors={state.errors?.fullName ? [{ message: state.errors.fullName }] : undefined} />
						</Field>

						<Field data-invalid={!!state.errors?.email}>
							<FieldLabel htmlFor="email">Email Address</FieldLabel>
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
								autoComplete="new-password"
								placeholder="Create a password"
								aria-invalid={!!state.errors?.password}
								required
							/>
							<FieldError errors={state.errors?.password ? [{ message: state.errors.password }] : undefined} />
						</Field>

						<Field data-invalid={!!state.errors?.confirmPassword}>
							<FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
							<Input
								id="confirmPassword"
								name="confirmPassword"
								type="password"
								autoComplete="new-password"
								placeholder="Confirm your password"
								aria-invalid={!!state.errors?.confirmPassword}
								required
							/>
							<FieldError
								errors={state.errors?.confirmPassword ? [{ message: state.errors.confirmPassword }] : undefined}
							/>
						</Field>
					</FieldGroup>
				</CardContent>
				<CardFooter className="flex flex-col gap-4 border-t-0 bg-transparent">
					<Button type="submit" className="w-full" disabled={isPending}>
						{isPending ? "Creating account..." : "Sign Up"}
					</Button>
					<p className="text-center text-sm text-muted-foreground">
						Already have an account?{" "}
						<Link href="/sign-in" className="text-primary underline-offset-4 hover:underline">
							Sign In
						</Link>
					</p>
				</CardFooter>
			</form>
		</Card>
	);
}
