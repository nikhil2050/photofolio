import { createHash, randomBytes, scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";

const passwordKeyLength = 64;
const scryptOptions = { N: 16_384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

function derivePasswordKey(password: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) => {
    (nodeScrypt as unknown as (
      password: string,
      salt: Buffer,
      keyLength: number,
      options: typeof scryptOptions,
      callback: (error: Error | null, derivedKey: Buffer) => void,
    ) => void)(password, salt, passwordKeyLength, scryptOptions, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });
}

/** Generates an opaque 256-bit bearer secret; only its SHA-256 hash is stored. */
export function createShareToken() {
  return randomBytes(32).toString("base64url");
}

export function hashShareToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/** Uses scrypt with a unique random salt so a database leak cannot reveal passwords cheaply. */
export async function hashGalleryPassword(password: string) {
  const salt = randomBytes(16);
  const derived = await derivePasswordKey(password, salt);
  return ["scrypt", salt.toString("base64url"), derived.toString("base64url")].join("$");
}

export async function verifyGalleryPassword(password: string, storedHash: string) {
  const [algorithm, encodedSalt, encodedHash] = storedHash.split("$");
  if (algorithm !== "scrypt" || !encodedSalt || !encodedHash) return false;
  try {
    const expected = Buffer.from(encodedHash, "base64url");
    const actual = await derivePasswordKey(password, Buffer.from(encodedSalt, "base64url"));
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}
