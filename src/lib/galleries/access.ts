import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const SHARE_TOKEN_BYTES = 32;
const PASSWORD_KEY_LENGTH = 64;
const PASSWORD_SCRYPT_COST = 16_384;
const PASSWORD_SCRYPT_BLOCK_SIZE = 8;
const PASSWORD_SCRYPT_PARALLELIZATION = 1;
const PASSWORD_SCRYPT_MAX_MEMORY = 64 * 1024 * 1024;

type ParsedPasswordHash = {
  salt: Buffer;
  derivedKey: Buffer;
};

/**
 * Creates a bearer token for a gallery link and the only value that may be
 * stored in Postgres. Keeping the raw token out of the database limits the
 * impact of a database read because it cannot be turned back into a link.
 */
export function createGalleryShareToken() {
  const token = randomBytes(SHARE_TOKEN_BYTES).toString("base64url");
  return { token, tokenHash: hashGalleryShareToken(token) };
}

export function hashGalleryShareToken(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

/** Compares fixed-length SHA-256 hashes without leaking matching prefixes. */
export function verifyGalleryShareToken(token: string, tokenHash: string) {
  if (!/^[a-f0-9]{64}$/.test(tokenHash)) return false;

  return timingSafeEqual(
    Buffer.from(hashGalleryShareToken(token), "hex"),
    Buffer.from(tokenHash, "hex"),
  );
}

/**
 * Hashes a gallery password with a random salt. This server-only helper stores
 * the algorithm parameters with the value so a later, deliberate migration can
 * upgrade the work factor without accepting attacker-controlled parameters.
 */
export async function hashGalleryPassword(password: string) {
  const salt = randomBytes(16);
  const derivedKey = await derivePasswordKey(password, salt);

  return [
    "scrypt",
    PASSWORD_SCRYPT_COST,
    PASSWORD_SCRYPT_BLOCK_SIZE,
    PASSWORD_SCRYPT_PARALLELIZATION,
    salt.toString("hex"),
    derivedKey.toString("hex"),
  ].join("$");
}

export async function verifyGalleryPassword(
  password: string,
  storedHash: string,
) {
  const parsed = parsePasswordHash(storedHash);
  if (!parsed) return false;

  const derivedKey = await derivePasswordKey(password, parsed.salt);
  return timingSafeEqual(derivedKey, parsed.derivedKey);
}

function derivePasswordKey(password: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(
      password,
      salt,
      PASSWORD_KEY_LENGTH,
      {
        N: PASSWORD_SCRYPT_COST,
        r: PASSWORD_SCRYPT_BLOCK_SIZE,
        p: PASSWORD_SCRYPT_PARALLELIZATION,
        maxmem: PASSWORD_SCRYPT_MAX_MEMORY,
      },
      (error, derivedKey) => {
        if (error) reject(error);
        else resolve(derivedKey);
      },
    );
  });
}

function parsePasswordHash(storedHash: string): ParsedPasswordHash | null {
  const [algorithm, cost, blockSize, parallelization, salt, derivedKey] =
    storedHash.split("$");

  if (
    algorithm !== "scrypt" ||
    cost !== String(PASSWORD_SCRYPT_COST) ||
    blockSize !== String(PASSWORD_SCRYPT_BLOCK_SIZE) ||
    parallelization !== String(PASSWORD_SCRYPT_PARALLELIZATION) ||
    !/^[a-f0-9]{32}$/.test(salt ?? "") ||
    !/^[a-f0-9]{128}$/.test(derivedKey ?? "")
  ) {
    return null;
  }

  return {
    salt: Buffer.from(salt, "hex"),
    derivedKey: Buffer.from(derivedKey, "hex"),
  };
}
