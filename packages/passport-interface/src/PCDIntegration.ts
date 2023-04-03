import { PCDOf, PCDPackage } from "@pcd/pcd-types";
import { useEffect, useState } from "react";
import { PCDResponse } from "./PassportInterface";

export function useProof<T extends PCDPackage>(
  proofPackage: T,
  proofEnc: string
) {
  const [proof, setProof] = useState<PCDOf<T>>();

  useEffect(() => {
    if (proofEnc) {
      const parsedPCD = JSON.parse(decodeURIComponent(proofEnc));
      if (parsedPCD.type !== proofPackage.name) {
        return;
      }
      proofPackage.deserialize(parsedPCD.pcd).then((pcd) => {
        setProof(pcd as any);
      });
    }
  }, [proofPackage, proofEnc, setProof]);

  return proof;
}

/**
 * React hook that listens for PCDs returned by the passport to the application.
 */
export function usePassportPCD() {
  const [pcdStr, setPcdStr] = useState("");

  // Listen for PCDs coming back from the Passport popup
  useEffect(() => {
    function receiveMessage(ev: MessageEvent<any>) {
      // This next line is important. Extensions including Metamask apparently
      // send messages to every page. Ignore those.
      if (!ev.data.encodedPcd) return;
      console.log("Received message", ev.data);
      setPcdStr(ev.data.encodedPcd);
    }
    window.addEventListener("message", receiveMessage, false);
    return () => window.removeEventListener("message", receiveMessage);
  }, []);

  return pcdStr;
}

/**
 * React hook that listens for PCDs returned by the passport to the application.
 */
export function usePassportResponse() {
  const [response, setResponse] = useState<PCDResponse | undefined>();
  const [error, setError] = useState<Error | undefined>();

  // Listen for PCDs coming back from the Passport popup
  useEffect(() => {
    function receiveMessage(ev: MessageEvent<any>) {
      // This next line is important. Extensions including Metamask apparently
      // send messages to every page. Ignore those.
      if (!ev.data.pcdResponse) return;

      console.log("Received message", ev.data);

      try {
        setResponse(JSON.parse(ev.data.pcdResponse));
      } catch (e: any) {
        setError(e);
      }
    }

    window.addEventListener("message", receiveMessage, false);
    return () => window.removeEventListener("message", receiveMessage);
  }, []);

  return { response, error };
}
