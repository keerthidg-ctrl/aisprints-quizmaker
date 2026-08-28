const PBKDF2_ITERATIONS = 100_000;
const KEY_LENGTH_BITS = 256;

function toBase64(bytes: Uint8Array): string {
	return btoa(String.fromCharCode(...bytes));
}

function fromBase64(value: string): Uint8Array {
	const binary = atob(value);
	return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function derivePasswordHash(password: string, salt: Uint8Array): Promise<Uint8Array> {
	const keyMaterial = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(password),
		"PBKDF2",
		false,
		["deriveBits"],
	);

	const derivedBits = await crypto.subtle.deriveBits(
		{
			name: "PBKDF2",
			salt: new Uint8Array(salt),
			iterations: PBKDF2_ITERATIONS,
			hash: "SHA-256",
		},
		keyMaterial,
		KEY_LENGTH_BITS,
	);

	return new Uint8Array(derivedBits);
}

function timingSafeEqual(left: Uint8Array, right: Uint8Array): boolean {
	if (left.length !== right.length) {
		return false;
	}

	let result = 0;
	for (let index = 0; index < left.length; index += 1) {
		result |= left[index]! ^ right[index]!;
	}

	return result === 0;
}

export async function hashPassword(password: string): Promise<string> {
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const hash = await derivePasswordHash(password, salt);
	return `${toBase64(salt)}:${toBase64(hash)}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
	const [saltPart, hashPart] = storedHash.split(":");
	if (!saltPart || !hashPart) {
		return false;
	}

	const salt = fromBase64(saltPart);
	const expectedHash = fromBase64(hashPart);
	const actualHash = await derivePasswordHash(password, salt);
	return timingSafeEqual(actualHash, expectedHash);
}
