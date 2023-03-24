import assert from "assert";
import { decodeQRPayload, encodeQRPayload } from "../src/qr";

function makeTestPayload(length: number): string {
  let result = "";

  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10);
  }

  return result;
}

describe("Zuzalu QR Code", async function () {
  it("should encode and decode properly", async function () {
    const testPayload = makeTestPayload(1000);
    const encodedPayload = encodeQRPayload(testPayload);
    const decodedPayload = decodeQRPayload(encodedPayload);

    assert.equal(decodedPayload, testPayload);
  });
});
