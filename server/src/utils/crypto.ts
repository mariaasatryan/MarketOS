import sodium from 'libsodium-wrappers';

let key: Uint8Array;
export async function initCrypto(base64: string) {
  await sodium.ready;
  key = sodium.from_base64(base64, sodium.base64_variants.ORIGINAL);
  if (key.length !== 32) throw new Error('ENCRYPTION_KEY must be 32 bytes');
}

export async function encrypt(plain: string) {
  await sodium.ready;
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  const cipher = sodium.crypto_secretbox_easy(
    sodium.from_string(plain), nonce, key
  );
  return Buffer.concat([Buffer.from(nonce), Buffer.from(cipher)]);
}

export async function decrypt(buf: Buffer) {
  await sodium.ready;
  const nonce = buf.subarray(0, 24);
  const cipher = buf.subarray(24);
  const plain = sodium.crypto_secretbox_open_easy(cipher, nonce, key);
  return sodium.to_string(plain);
}