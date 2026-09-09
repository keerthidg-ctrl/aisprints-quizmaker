import { describe, expect, it } from "vitest";

import { formatMcqListDescription, truncateText } from "@/lib/mcq/format";

describe("mcq format helpers", () => {
	it("returns short text unchanged", () => {
		expect(truncateText("Short question", 120)).toBe("Short question");
	});

	it("truncates long text with an ellipsis", () => {
		const longText = "a".repeat(130);
		expect(truncateText(longText, 120)).toBe(`${"a".repeat(120)}...`);
	});

	it("describes an empty mcq list", () => {
		expect(formatMcqListDescription(0)).toBe("No questions yet.");
	});

	it("describes a non-empty mcq list", () => {
		expect(formatMcqListDescription(3)).toBe("3 question(s) available.");
	});
});
