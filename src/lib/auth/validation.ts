export type FieldErrors = Partial<Record<string, string>>;

export interface SignUpInput {
	fullName: string;
	email: string;
	password: string;
	confirmPassword: string;
}

export interface SignInInput {
	email: string;
	password: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SPECIAL_CHARACTER_PATTERN = /[!@#$%^&*()\-_=+[\]{};:'",.<>?/\\|~`\\]/;

export function validateFullName(value: string): string | undefined {
	const trimmed = value.trim();
	if (!trimmed) {
		return "Full name is required.";
	}
	if (trimmed.length < 2) {
		return "Full name must be at least 2 characters.";
	}
	if (trimmed.length > 100) {
		return "Full name must not exceed 100 characters.";
	}
	return undefined;
}

export function validateEmail(value: string): string | undefined {
	const trimmed = value.trim();
	if (!trimmed) {
		return "Email is required.";
	}
	if (!EMAIL_PATTERN.test(trimmed)) {
		return "Please enter a valid email address.";
	}
	return undefined;
}

export function validatePassword(value: string): string | undefined {
	if (!value) {
		return "Password is required.";
	}
	if (value.length < 8) {
		return "Password must be at least 8 characters.";
	}
	if (!/[A-Z]/.test(value)) {
		return "Password must contain at least one uppercase letter.";
	}
	if (!/[a-z]/.test(value)) {
		return "Password must contain at least one lowercase letter.";
	}
	if (!/[0-9]/.test(value)) {
		return "Password must contain at least one number.";
	}
	if (!SPECIAL_CHARACTER_PATTERN.test(value)) {
		return "Password must contain at least one special character.";
	}
	return undefined;
}

export function validateConfirmPassword(password: string, confirmPassword: string): string | undefined {
	if (!confirmPassword) {
		return "Please confirm your password.";
	}
	if (password !== confirmPassword) {
		return "Passwords do not match.";
	}
	return undefined;
}

function collectErrors(entries: Array<[string, string | undefined]>): FieldErrors {
	return Object.fromEntries(entries.filter((entry): entry is [string, string] => entry[1] !== undefined));
}

export function validateSignUpForm(input: SignUpInput): FieldErrors {
	return collectErrors([
		["fullName", validateFullName(input.fullName)],
		["email", validateEmail(input.email)],
		["password", validatePassword(input.password)],
		["confirmPassword", validateConfirmPassword(input.password, input.confirmPassword)],
	]);
}

export function validateSignInForm(input: SignInInput): FieldErrors {
	return collectErrors([
		["email", validateEmail(input.email)],
		["password", input.password ? undefined : "Password is required."],
	]);
}

export const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password. Please try again.";
