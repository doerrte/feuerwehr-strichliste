import crypto from "crypto";

function getSecret() {
  const secret = process.env.QR_SECRET;

  if (!secret) {
    throw new Error("QR_SECRET fehlt in Environment Variables");
  }

  return secret;
}

export function createSignature(drinkId: number) {
  return crypto
    .createHmac("sha256", getSecret())
    .update(String(drinkId))
    .digest("hex");
}

export function verifySignature(
  drinkId: number,
  signature: string
) {
  const expected = createSignature(drinkId);
  return expected === signature;
}