import { toCircomBigIntBytes } from "./binaryFormat";
import { MAX_HEADER_PADDED_BYTES } from "./constants";
import { shaHash } from "./shaHash";
import { Hash } from "./fast-sha256";
import NodeRSA from "node-rsa";

export interface RSACircuitInputs {
  message: string[];
  modulus: string[];
  signature: string[];
  message_padded_bytes: string;
}

function assert(cond: boolean, errorMessage: string) {
  if (!cond) {
    throw new Error(errorMessage);
  }
}

// Works only on 32 bit sha text lengths
function int32toBytes(num: number): Uint8Array {
  let arr = new ArrayBuffer(4); // an Int32 takes 4 bytes
  let view = new DataView(arr);
  view.setUint32(0, num, false); // byteOffset = 0; litteEndian = false
  return new Uint8Array(arr);
}

// Works only on 32 bit sha text lengths
function int8toBytes(num: number): Uint8Array {
  let arr = new ArrayBuffer(1); // an Int8 takes 4 bytes
  let view = new DataView(arr);
  view.setUint8(0, num); // byteOffset = 0; litteEndian = false
  return new Uint8Array(arr);
}

function mergeUInt8Arrays(a1: Uint8Array, a2: Uint8Array): Uint8Array {
  // sum of individual array lengths
  var mergedArray = new Uint8Array(a1.length + a2.length);
  mergedArray.set(a1);
  mergedArray.set(a2, a1.length);
  return mergedArray;
}

// Puts an end selector, a bunch of 0s, then the length, then fill the rest with 0s.
async function sha256Pad(
  prehash_prepad_m: Uint8Array,
  maxShaBytes: number
): Promise<[Uint8Array, number]> {
  let length_bits = prehash_prepad_m.length * 8; // bytes to bits
  let length_in_bytes = int32toBytes(length_bits);
  prehash_prepad_m = mergeUInt8Arrays(prehash_prepad_m, int8toBytes(2 ** 7));
  while (
    (prehash_prepad_m.length * 8 + length_in_bytes.length * 8) % 512 !==
    0
  ) {
    prehash_prepad_m = mergeUInt8Arrays(prehash_prepad_m, int8toBytes(0));
  }
  prehash_prepad_m = mergeUInt8Arrays(prehash_prepad_m, length_in_bytes);
  assert(
    (prehash_prepad_m.length * 8) % 512 === 0,
    "Padding did not complete properly!"
  );
  let messageLen = prehash_prepad_m.length;
  while (prehash_prepad_m.length < maxShaBytes) {
    prehash_prepad_m = mergeUInt8Arrays(prehash_prepad_m, int32toBytes(0));
  }
  assert(
    prehash_prepad_m.length === maxShaBytes,
    "Padding to max length did not complete properly!"
  );

  return [prehash_prepad_m, messageLen];
}

async function Uint8ArrayToCharArray(a: Uint8Array): Promise<string[]> {
  return Array.from(a).map((x) => x.toString());
}

async function Uint8ArrayToString(a: Uint8Array): Promise<string> {
  return Array.from(a)
    .map((x) => x.toString())
    .join(";");
}

async function partialSha(
  msg: Uint8Array,
  msgLen: number
): Promise<Uint8Array> {
  const shaGadget = new Hash();
  return await shaGadget.update(msg, msgLen).cacheState();
}

export async function getCircuitInputs(
  rsa_signature: BigInt,
  rsa_modulus: BigInt,
  msg: Buffer
): Promise<RSACircuitInputs> {
  const modulusBigInt = rsa_modulus;
  const prehash_message_string = msg;
  const signatureBigInt = rsa_signature;

  const prehashBytesUnpadded =
    typeof prehash_message_string == "string"
      ? new TextEncoder().encode(prehash_message_string)
      : Uint8Array.from(prehash_message_string);

  console.log("prehashBytesUnpadded len", prehashBytesUnpadded.length);
  const [messagePadded, messagePaddedLen] = await sha256Pad(
    prehashBytesUnpadded,
    MAX_HEADER_PADDED_BYTES
  );

  console.log("message padded", messagePadded);
  console.log("message padded len", messagePaddedLen);

  // Ensure SHA manual unpadded is running the correct function
  const shaOut = await partialSha(messagePadded, messagePaddedLen);

  console.log("shaout", shaOut);

  const partialShaOutStr = await Uint8ArrayToString(shaOut);
  const hashed = await Uint8ArrayToString(
    Uint8Array.from((await shaHash(prehashBytesUnpadded)) as any)
  );
  console.log(1, partialShaOutStr);
  console.log(2, hashed);

  assert(partialShaOutStr === hashed, "SHA256 calculation did not match!");

  const modulus = toCircomBigIntBytes(modulusBigInt);
  const signature = toCircomBigIntBytes(signatureBigInt);

  const message_padded_bytes = messagePaddedLen.toString();
  const message = await Uint8ArrayToCharArray(messagePadded);

  const circuitInputs = {
    message,
    modulus,
    signature,
    message_padded_bytes,
  };

  return circuitInputs;
}

export async function getRsaCircuitInputs(
  messageBytes: Uint8Array,
  signature: Uint8Array,
  modulus: BigInt
) {
  console.log("message bytes", [...messageBytes]);
  const message = Buffer.from([
    166, 101, 164, 89, 32, 66, 47, 157, 65, 126, 72, 103, 239, 220, 79, 184,
    160, 74, 31, 63, 255, 31, 160, 126, 153, 142, 134, 247, 247, 162, 122, 227,
  ]);
  // const key = new NodeRSA({ b: 2048 });
  // key.setOptions({ signingScheme: "pkcs1-sha512" });
  // const keyComponents = key.exportKey("components-public");
  // const messageSignature = key.sign(message);
  const messageSignatureBigInt = BigInt(
    "0x" + Buffer.from(signature).toString("hex")
  );
  // const keyModulus = keyComponents.n;
  // const keyModulusBigInt = BigInt("0x" + keyModulus.toString("hex"));

  return getCircuitInputs(messageSignatureBigInt, modulus, message);
}

export async function generateRSACircuitInputs(): Promise<RSACircuitInputs> {
  const messageString = "hello world";
  const message = Buffer.from(messageString);

  const key = new NodeRSA({ b: 2048 });
  // key.setOptions({ signingScheme: "pkcs1-sha512" });
  const keyComponents = key.exportKey("components-public");
  const messageSignature = key.sign(message);
  const messageSignatureBigInt = BigInt(
    "0x" + messageSignature.toString("hex")
  );
  const keyModulus = keyComponents.n;
  const keyModulusBigInt = BigInt("0x" + keyModulus.toString("hex"));

  return getCircuitInputs(messageSignatureBigInt, keyModulusBigInt, message);
}
