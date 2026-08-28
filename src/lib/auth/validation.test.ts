import { describe, expect, it } from "vitest";

import {
	validateConfirmPassword,
	validateEmail,
	validateFullName,
	validatePassword,
	validateSignInForm,
	validateSignUpForm,
} from "./validation";

describe("validateFullName", () => {
	it("returns error when empty", () => {
		expect(validateFullName("")).toBe("Full name is required.");
	});

	it("returns error when whitespace only", () => {
		expect(validateFullName("   ")).toBe("Full name is required.");
	});

	it("returns error when shorter than 2 characters", () => {
		expect(validateFullName("A")).toBe("Full name must be at least 2 characters.");
	});

	it("returns error when longer than 100 characters", () => {
		expect(validateFullName("a".repeat(101))).toBe("Full name must not exceed 100 characters.");
	});

	it("accepts valid names including hyphens and apostrophes", () => {
		expect(validateFullName("Mary-Jane O'Brien")).toBeUndefined();
	});

	it("accepts minimum length name", () => {
		expect(validateFullName("Jo")).toBeUndefined();
	});
});

describe("validateEmail", () => {
	it("returns error when empty", () => {
		expect(validateEmail("")).toBe("Email is required.");
	});

	it("returns error for invalid format", () => {
		expect(validateEmail("not-an-email")).toBe("Please enter a valid email address.");
		expect(validateEmail("missing@domain")).toBe("Please enter a valid email address.");
	});

	it("accepts valid email addresses", () => {
		expect(validateEmail("user@example.com")).toBeUndefined();
	});
});

describe("validatePassword", () => {
	it("returns error when empty", () => {
		expect(validatePassword("")).toBe("Password is required.");
	});

	it("returns error when shorter than 8 characters", () => {
		expect(validatePassword("Ab1!xyz")).toBe("Password must be at least 8 characters.");
	});

	it("returns error when missing uppercase letter", () => {
		expect(validatePassword("password1!")).toBe("Password must contain at least one uppercase letter.");
	});

	it("returns error when missing lowercase letter", () => {
		expect(validatePassword("PASSWORD1!")).toBe("Password must contain at least one lowercase letter.");
	});

	it("returns error when missing number", () => {
		expect(validatePassword("Password!")).toBe("Password must contain at least one number.");
	});

	it("returns error when missing special character", () => {
		expect(validatePassword("Password1")).toBe("Password must contain at least one special character.");
	});

	it("accepts a valid password", () => {
		expect(validatePassword("Password1!")).toBeUndefined();
	});
});

describe("validateConfirmPassword", () => {
	it("returns error when empty", () => {
		expect(validateConfirmPassword("Password1!", "")).toBe("Please confirm your password.");
	});

	it("returns error when passwords do not match", () => {
		expect(validateConfirmPassword("Password1!", "Password2!")).toBe("Passwords do not match.");
	});

	it("accepts matching passwords", () => {
		expect(validateConfirmPassword("Password1!", "Password1!")).toBeUndefined();
	});
});

describe("validateSignUpForm", () => {
	it("returns all field errors for empty submission", () => {
		const errors = validateSignUpForm({
			fullName: "",
			email: "",
			password: "",
			confirmPassword: "",
		});

		expect(errors.fullName).toBe("Full name is required.");
		expect(errors.email).toBe("Email is required.");
		expect(errors.password).toBe("Password is required.");
		expect(errors.confirmPassword).toBe("Please confirm your password.");
	});

	it("returns no errors for valid input", () => {
		const errors = validateSignUpForm({
			fullName: "Jane Doe",
			email: "jane@example.com",
			password: "Password1!",
			confirmPassword: "Password1!",
		});

		expect(errors).toEqual({});
	});
});

describe("validateSignInForm", () => {
	it("returns errors when fields are empty", () => {
		const errors = validateSignInForm({ email: "", password: "" });

		expect(errors.email).toBe("Email is required.");
		expect(errors.password).toBe("Password is required.");
	});

	it("returns email format error for invalid email", () => {
		const errors = validateSignInForm({ email: "bad-email", password: "Password1!" });

		expect(errors.email).toBe("Please enter a valid email address.");
	});

	it("returns no errors for valid input", () => {
		const errors = validateSignInForm({
			email: "user@example.com",
			password: "Password1!",
		});

		expect(errors).toEqual({});
	});
});
