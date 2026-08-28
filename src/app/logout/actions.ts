"use server";

import { redirect } from "next/navigation";

import { invalidateCurrentSession } from "@/lib/auth/session";

export async function logoutAction(): Promise<void> {
	await invalidateCurrentSession();
	redirect("/sign-in");
}
