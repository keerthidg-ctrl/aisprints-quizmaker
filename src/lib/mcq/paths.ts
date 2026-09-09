export function getMcqListPath(): string {
	return "/dashboard/mcqs";
}

export function getMcqCreatePath(): string {
	return "/dashboard/mcqs/new";
}

export function getMcqEditPath(mcqId: string): string {
	return `/dashboard/mcqs/${mcqId}/edit`;
}

export function getMcqPreviewPath(mcqId: string): string {
	return `/dashboard/mcqs/${mcqId}/preview`;
}