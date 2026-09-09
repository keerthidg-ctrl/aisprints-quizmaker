export type ParsedColumn = {
	name: string;
	type: string;
	notNull: boolean;
	primaryKey: boolean;
};

export type ParsedForeignKey = {
	column: string;
	referencesTable: string;
	referencesColumn: string;
	onDelete?: string;
};

export type ParsedTable = {
	name: string;
	columns: ParsedColumn[];
	foreignKeys: ParsedForeignKey[];
};

export type ParsedIndex = {
	name: string;
	table: string;
	column: string;
};

function splitTableBody(body: string): string[] {
	const parts: string[] = [];
	let current = "";
	let depth = 0;

	for (const char of body) {
		if (char === "(") {
			depth += 1;
		}
		if (char === ")") {
			depth -= 1;
		}

		if (char === "," && depth === 0) {
			parts.push(current.trim());
			current = "";
			continue;
		}

		current += char;
	}

	if (current.trim()) {
		parts.push(current.trim());
	}

	return parts;
}

function parseColumnDefinition(definition: string): ParsedColumn | null {
	const match = definition.match(/^(\w+)\s+([A-Z]+)(.*)$/i);
	if (!match) {
		return null;
	}

	const [, name, type, constraints] = match;
	const upperConstraints = constraints.toUpperCase();

	return {
		name,
		type: type.toUpperCase(),
		notNull: upperConstraints.includes("NOT NULL"),
		primaryKey: upperConstraints.includes("PRIMARY KEY"),
	};
}

function parseForeignKeyDefinition(definition: string): ParsedForeignKey | null {
	const match = definition.match(
		/^FOREIGN KEY\s*\((\w+)\)\s*REFERENCES\s+(\w+)\s*\((\w+)\)(?:\s+ON DELETE\s+(\w+))?/i,
	);
	if (!match) {
		return null;
	}

	const [, column, referencesTable, referencesColumn, onDelete] = match;
	return {
		column,
		referencesTable,
		referencesColumn,
		onDelete,
	};
}

export function parseCreateTableStatements(sql: string): ParsedTable[] {
	const tables: ParsedTable[] = [];
	const statementRegex = /CREATE TABLE\s+(\w+)\s*\(([\s\S]*?)\);/gi;

	for (const match of sql.matchAll(statementRegex)) {
		const [, name, body] = match;
		const columns: ParsedColumn[] = [];
		const foreignKeys: ParsedForeignKey[] = [];

		for (const part of splitTableBody(body)) {
			if (part.startsWith("FOREIGN KEY")) {
				const foreignKey = parseForeignKeyDefinition(part);
				if (foreignKey) {
					foreignKeys.push(foreignKey);
				}
				continue;
			}

			const column = parseColumnDefinition(part);
			if (column) {
				columns.push(column);
			}
		}

		tables.push({ name, columns, foreignKeys });
	}

	return tables;
}

export function parseCreateIndexStatements(sql: string): ParsedIndex[] {
	const indexes: ParsedIndex[] = [];
	const statementRegex = /CREATE INDEX\s+(\w+)\s+ON\s+(\w+)\s*\((\w+)\)/gi;

	for (const match of sql.matchAll(statementRegex)) {
		const [, name, table, column] = match;
		indexes.push({ name, table, column });
	}

	return indexes;
}
