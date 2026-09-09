export const MCQ_MIGRATION_FILE = "0003_init_mcq_tables.sql";

export type SchemaColumnContract = {
	name: string;
	type: string;
	notNull?: boolean;
	primaryKey?: boolean;
};

export type SchemaForeignKeyContract = {
	table: string;
	column: string;
	referencesTable: string;
	referencesColumn: string;
	onDelete?: string;
};

export type SchemaTableContract = {
	name: string;
	columns: SchemaColumnContract[];
	foreignKeys: SchemaForeignKeyContract[];
};

export type SchemaIndexContract = {
	name: string;
	table: string;
	column: string;
};

export const MCQ_SCHEMA_CONTRACT = {
	migrationFile: MCQ_MIGRATION_FILE,
	tables: [
		{
			name: "mcqs",
			columns: [
				{ name: "id", type: "TEXT", notNull: true, primaryKey: true },
				{ name: "user_id", type: "TEXT", notNull: true },
				{ name: "name", type: "TEXT", notNull: true },
				{ name: "question", type: "TEXT", notNull: true },
				{ name: "created_at", type: "INTEGER", notNull: true },
				{ name: "updated_at", type: "INTEGER", notNull: true },
			],
			foreignKeys: [
				{
					table: "mcqs",
					column: "user_id",
					referencesTable: "users",
					referencesColumn: "id",
					onDelete: "CASCADE",
				},
			],
		},
		{
			name: "mcq_choices",
			columns: [
				{ name: "id", type: "TEXT", notNull: true, primaryKey: true },
				{ name: "mcq_id", type: "TEXT", notNull: true },
				{ name: "choice_text", type: "TEXT", notNull: true },
				{ name: "is_correct", type: "INTEGER", notNull: true },
				{ name: "sort_order", type: "INTEGER", notNull: true },
				{ name: "created_at", type: "INTEGER", notNull: true },
			],
			foreignKeys: [
				{
					table: "mcq_choices",
					column: "mcq_id",
					referencesTable: "mcqs",
					referencesColumn: "id",
					onDelete: "CASCADE",
				},
			],
		},
		{
			name: "mcq_attempts",
			columns: [
				{ name: "id", type: "TEXT", notNull: true, primaryKey: true },
				{ name: "mcq_id", type: "TEXT", notNull: true },
				{ name: "user_id", type: "TEXT", notNull: true },
				{ name: "choice_id", type: "TEXT", notNull: true },
				{ name: "is_correct", type: "INTEGER", notNull: true },
				{ name: "created_at", type: "INTEGER", notNull: true },
			],
			foreignKeys: [
				{
					table: "mcq_attempts",
					column: "mcq_id",
					referencesTable: "mcqs",
					referencesColumn: "id",
					onDelete: "CASCADE",
				},
				{
					table: "mcq_attempts",
					column: "user_id",
					referencesTable: "users",
					referencesColumn: "id",
					onDelete: "CASCADE",
				},
				{
					table: "mcq_attempts",
					column: "choice_id",
					referencesTable: "mcq_choices",
					referencesColumn: "id",
				},
			],
		},
	] satisfies SchemaTableContract[],
	indexes: [
		{ name: "idx_mcqs_user_id", table: "mcqs", column: "user_id" },
		{ name: "idx_mcq_choices_mcq_id", table: "mcq_choices", column: "mcq_id" },
		{ name: "idx_mcq_attempts_mcq_id", table: "mcq_attempts", column: "mcq_id" },
		{ name: "idx_mcq_attempts_user_id", table: "mcq_attempts", column: "user_id" },
	] satisfies SchemaIndexContract[],
};
