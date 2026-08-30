import crypto from "node:crypto";

function generateKey(): string {
  const bytes = crypto.randomBytes(16);

  const hex = bytes.toString("hex").toUpperCase();

  return [
    hex.slice(0, 4),
    hex.slice(4, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 24),
    hex.slice(24, 28),
    hex.slice(28, 32),
  ].join("-");
}

const key = generateKey();

console.log("School Creation Key:");
console.log(key);
