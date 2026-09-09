import { MCQ_SCHEMA_CONTRACT } from "@/lib/db/schema/mcq-schema-contract";
import { parseCreateIndexStatements, parseCreateTableStatements } from "@/lib/db/schema/parse-migration-sql";

export type MigrationValidationResult =
	| { success: true }
	| { success: false; errors: string[] };

export function validateMcqMigrationSql(sql: string): MigrationValidationResult {
	const errors: string[] = [];
	const tables = parseCreateTableStatements(sql);
	const indexes = parseCreateIndexStatements(sql);

	for (const tableContract of MCQ_SCHEMA_CONTRACT.tables) {
		const parsedTable = tables.find((table) => table.name === tableContract.name);
		if (!parsedTable) {
			errors.push(`Missing table: ${tableContract.name}`);
			continue;
		}

		for (const columnContract of tableContract.columns) {
			const parsedColumn = parsedTable.columns.find((column) => column.name === columnContract.name);
			if (!parsedColumn) {
				errors.push(`Missing column ${tableContract.name}.${columnContract.name}`);
				continue;
			}

			if (parsedColumn.type !== columnContract.type) {
				errors.push(
					`Column ${tableContract.name}.${columnContract.name} has type ${parsedColumn.type}, expected ${columnContract.type}`,
				);
			}

			if (columnContract.notNull && !parsedColumn.notNull) {
				errors.push(`Column ${tableContract.name}.${columnContract.name} must be NOT NULL`);
			}

			if (columnContract.primaryKey && !parsedColumn.primaryKey) {
				errors.push(`Column ${tableContract.name}.${columnContract.name} must be PRIMARY KEY`);
			}
		}

		for (const foreignKeyContract of tableContract.foreignKeys) {
			const parsedForeignKey = parsedTable.foreignKeys.find((foreignKey) => foreignKey.column === foreignKeyContract.column);
			if (!parsedForeignKey) {
				errors.push(`Missing foreign key on ${tableContract.name}.${foreignKeyContract.column}`);
				continue;
			}

			if (parsedForeignKey.referencesTable !== foreignKeyContract.referencesTable) {
				errors.push(
					`Foreign key ${tableContract.name}.${foreignKeyContract.column} references ${parsedForeignKey.referencesTable}, expected ${foreignKeyContract.referencesTable}`,
				);
			}

			if (parsedForeignKey.referencesColumn !== foreignKeyContract.referencesColumn) {
				errors.push(
					`Foreign key ${tableContract.name}.${foreignKeyContract.column} references ${parsedForeignKey.referencesTable}(${parsedForeignKey.referencesColumn}), expected ${foreignKeyContract.referencesColumn}`,
				);
			}

			if (foreignKeyContract.onDelete && parsedForeignKey.onDelete?.toUpperCase() !== foreignKeyContract.onDelete) {
				errors.push(
					`Foreign key ${tableContract.name}.${foreignKeyContract.column} should ON DELETE ${foreignKeyContract.onDelete}`,
				);
			}
		}
	}

	for (const indexContract of MCQ_SCHEMA_CONTRACT.indexes) {
		const parsedIndex = indexes.find((index) => index.name === indexContract.name);
		if (!parsedIndex) {
			errors.push(`Missing index: ${indexContract.name}`);
			continue;
		}

		if (parsedIndex.table !== indexContract.table || parsedIndex.column !== indexContract.column) {
			errors.push(
				`Index ${indexContract.name} is on ${parsedIndex.table}(${parsedIndex.column}), expected ${indexContract.table}(${indexContract.column})`,
			);
		}
	}

	if (errors.length > 0) {
		return { success: false, errors };
	}

	return { success: true };
}
