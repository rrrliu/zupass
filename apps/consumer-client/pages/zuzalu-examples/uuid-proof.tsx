import {
  requestSignedZuzaluUUIDUrl,
  useFetchParticipant,
  useListenToPCDMessage,
  useSemaphoreSignatureProof,
} from "@pcd/passport-interface";
import { useEffect, useState } from "react";
import { HomeLink } from "../../components/Core";
import { PASSPORT_SERVER_URL, PASSPORT_URL } from "../../src/constants";
import { requestProofFromPassport } from "../../src/util";

export default function Page() {
  const pcdStr = useListenToPCDMessage();
  const { signatureProof, signatureProofValid } =
    useSemaphoreSignatureProof(pcdStr);

  // Extract UUID, the signed message of the returned PCD
  const [uuid, setUuid] = useState<string | undefined>();
  useEffect(() => {
    if (signatureProofValid && signatureProof) {
      const userUuid = signatureProof.claim.signedMessage;
      setUuid(userUuid);
    }
  }, [signatureProofValid, signatureProof]);

  // Finally, once we have the UUID, fetch the participant data from Passport.
  const { participant } = useFetchParticipant(PASSPORT_SERVER_URL, uuid);

  return (
    <>
      <HomeLink />
      <h2>Zuzalu UUID-revealing proof </h2>
      <button onClick={requestSignedZuID}>Request UUID</button>
      {signatureProof != null && (
        <>
          <h3>Got Semaphore Signature Proof from Passport</h3>
          <pre>{JSON.stringify(signatureProof, null, 2)}</pre>
          <p>{`Message signed: ${signatureProof.claim.signedMessage}`}</p>
          {signatureProofValid === undefined && <p>❓ Proof verifying</p>}
          {signatureProofValid === false && <p>❌ Proof is invalid</p>}
          {signatureProofValid === true && <p>✅ Proof is valid</p>}
        </>
      )}
      {participant && (
        <>
          <pre>{JSON.stringify(participant, null, 2)}</pre>
          {participant.commitment ===
          signatureProof?.claim.identityCommitment ? (
            <p>✅ Commitment matches</p>
          ) : (
            <p>❌ Commitment does not match</p>
          )}
        </>
      )}
    </>
  );
}

// Show the Passport popup. Ask for the user's Zuzalu ID.
function requestSignedZuID() {
  const proofUrl = requestSignedZuzaluUUIDUrl(
    PASSPORT_URL,
    window.location.origin + "/popup"
  );
  requestProofFromPassport(proofUrl);
}
