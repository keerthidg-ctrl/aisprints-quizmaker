import { describe, expect, it } from "vitest";

import { getMcqCreatePath, getMcqEditPath, getMcqListPath, getMcqPreviewPath } from "@/lib/mcq/paths";

describe("mcq paths", () => {
	it("builds the list path", () => {
		expect(getMcqListPath()).toBe("/dashboard/mcqs");
	});

	it("builds the create path", () => {
		expect(getMcqCreatePath()).toBe("/dashboard/mcqs/new");
	});

	it("builds the edit path for an mcq", () => {
		expect(getMcqEditPath("mcq-1")).toBe("/dashboard/mcqs/mcq-1/edit");
	});

	it("builds the preview path for an mcq", () => {
		expect(getMcqPreviewPath("mcq-1")).toBe("/dashboard/mcqs/mcq-1/preview");
	});
});
