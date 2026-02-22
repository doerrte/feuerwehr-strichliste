import crypto from "crypto";

const SECRET = process.env.QR_SECRET!;

export function createSignature(drinkId: number) {
  return crypto
    .createHmac("sha256", SECRET)
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