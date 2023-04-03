import {
  requestSignedZuzaluUUIDUrl,
  useFetchParticipant,
  usePassportOutput,
  useSemaphoreSignatureProof,
} from "@pcd/passport-interface";
import { useEffect, useState } from "react";
import { CollapsableCode, HomeLink } from "../../components/Core";
import { ExampleContainer } from "../../components/ExamplePage";
import { PendingPCDLoader } from "../../components/PendingPCDLoader";
import { PASSPORT_SERVER_URL, PASSPORT_URL } from "../../src/constants";
import { requestProofFromPassport } from "../../src/util";

/**
 * Example page which shows how to use a Zuzalu-specific prove screen to
 * request a Semaphore Signature PCD containing the user's uuid as a third
 * party developer.
 */
export default function Page() {
  const [pcdStr, pendingPCDStr] = usePassportOutput();
  const [serverProving, setServerProving] = useState(false);

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
      <p>
        This proof type is almost the same as <code>SempahoreSignaturePCD</code>
        , except one key feature: the message that is 'signed' within this PCD
        is the user's unique identifier according the the Zuzalu application.
        This uuid can be used to download information about the user from the
        Passport Server, including their name, email, and role.
      </p>
      <ExampleContainer>
        <button onClick={() => requestSignedZuID(serverProving)}>
          Request UUID
        </button>
        <label>
          <input
            type="checkbox"
            checked={serverProving}
            onChange={() => {
              setServerProving((checked: boolean) => !checked);
            }}
          />
          server-side proof
        </label>
        {pendingPCDStr != "" && (
          <>
            <PendingPCDLoader pendingPCDStr={pendingPCDStr} />
          </>
        )}
        {signatureProof != null && (
          <>
            <h3>Got Semaphore Signature Proof from Passport</h3>
            <p>{`Message signed: ${signatureProof.claim.signedMessage}`}</p>
            {signatureProofValid === undefined && <p>❓ Proof verifying</p>}
            {signatureProofValid === false && <p>❌ Proof is invalid</p>}
            {signatureProofValid === true && <p>✅ Proof is valid</p>}
            <CollapsableCode
              label="PCD Response"
              code={JSON.stringify(signatureProof, null, 2)}
            />
          </>
        )}
        {participant && (
          <>
            {participant.commitment ===
            signatureProof?.claim.identityCommitment ? (
              <p>✅ Commitment matches</p>
            ) : (
              <p>❌ Commitment does not match</p>
            )}
            <CollapsableCode
              label="Participant Response"
              code={JSON.stringify(participant, null, 2)}
            />
          </>
        )}
      </ExampleContainer>
    </>
  );
}

// Show the Passport popup. Ask for the user's Zuzalu ID.
function requestSignedZuID(serverProving: boolean) {
  const proofUrl = requestSignedZuzaluUUIDUrl(
    PASSPORT_URL,
    window.location.origin + "/popup",
    serverProving
  );
  requestProofFromPassport(proofUrl);
}
