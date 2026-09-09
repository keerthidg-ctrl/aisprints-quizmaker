export function truncateText(value: string, maxLength: number): string {
	if (value.length <= maxLength) {
		return value;
	}

	return `${value.slice(0, maxLength).trimEnd()}...`;
}

export function formatMcqListDescription(count: number): string {
	if (count === 0) {
		return "No questions yet.";
	}

	return `${count} question(s) available.`;
}
