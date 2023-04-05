import { ProveOptions } from "@pcd/passport-interface";
import { ArgsOf, PCDOf, PCDPackage, SerializedPCD } from "@pcd/pcd-types";
import { default as React, useCallback, useContext, useState } from "react";
import styled from "styled-components";
import { DispatchContext } from "../../../src/dispatch";
import { Button, H1, Spacer } from "../../core";
import { PCDArgs } from "../../shared/PCDArgs";

export function GenericProveSection<T extends PCDPackage = PCDPackage>({
  pcdType,
  initialArgs,
  options,
  onProve,
}: {
  pcdType: string;
  initialArgs: ArgsOf<T>;
  options?: ProveOptions;
  onProve: (pcd: PCDOf<T>, serializedPCD: SerializedPCD<PCDOf<T>>) => void;
}) {
  const [state] = useContext(DispatchContext);
  const [args, setArgs] = useState(JSON.parse(JSON.stringify(initialArgs)));
  const [error, setError] = useState<Error | undefined>();
  const pcdPackage = state.pcds.getPackage<T>(pcdType);

  const onProveClick = useCallback(async () => {
    try {
      const pcd = await pcdPackage.prove(args);
      const serialized = await pcdPackage.serialize(pcd);
      onProve(pcd as any, serialized);
    } catch (e) {
      setError(e);
    }
  }, [args, pcdPackage, onProve]);

  const pageTitle = options?.title ?? "Prove " + pcdType;

  return (
    <>
      <H1>🔑 &nbsp; {pageTitle}</H1>
      {options?.description && (
        <>
          <Spacer h={16} />
          <p>{options.description}</p>
        </>
      )}

      <Spacer h={24} />
      {options?.debug && <pre>{JSON.stringify(args, null, 2)}</pre>}
      <PCDArgs args={args} setArgs={setArgs} pcdCollection={state.pcds} />
      <Spacer h={16} />
      {error && (
        <>
          <ErrorContainer>{error.message}</ErrorContainer>
          <Spacer h={16} />
        </>
      )}
      <Button onClick={onProveClick}>PROVE</Button>
    </>
  );
}

const ErrorContainer = styled.div`
  padding: 16px;
  background-color: white;
  color: var(--danger);
  border-radius: 16px;
  border: 1px solid var(--danger);
`;
