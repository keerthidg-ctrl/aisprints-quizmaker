import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { MCQ_MIGRATION_FILE, MCQ_SCHEMA_CONTRACT } from "@/lib/db/schema/mcq-schema-contract";
import { validateMcqMigrationSql } from "@/lib/db/schema/validate-mcq-migration";

function readMigrationFile(): string {
	const migrationPath = path.join(process.cwd(), "migrations", MCQ_MIGRATION_FILE);
	return readFileSync(migrationPath, "utf8");
}

describe("mcq schema contract", () => {
	it("defines the expected MCQ migration filename", () => {
		expect(MCQ_SCHEMA_CONTRACT.migrationFile).toBe("0003_init_mcq_tables.sql");
	});

	it("requires the MCQ migration file to exist", () => {
		expect(() => readMigrationFile()).not.toThrow();
	});

	it("matches the MCQ schema contract", () => {
		const result = validateMcqMigrationSql(readMigrationFile());

		expect(result).toEqual({ success: true });
	});

	it("rejects migration SQL that is missing required tables", () => {
		const result = validateMcqMigrationSql("SELECT 1;");

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errors).toContain("Missing table: mcqs");
			expect(result.errors).toContain("Missing table: mcq_choices");
			expect(result.errors).toContain("Missing table: mcq_attempts");
		}
	});
});
