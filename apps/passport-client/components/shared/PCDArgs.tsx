import { PCDCollection } from "@pcd/pcd-collection";
import {
  ArgsOf,
  Argument,
  BigIntArgument,
  BooleanArgument,
  isBigIntArgument,
  isBooleanArgument,
  isNumberArgument,
  isObjectArgument,
  isPCDArgument,
  isStringArgument,
  NumberArgument,
  ObjectArgument,
  PCD,
  PCDArgument,
  PCDPackage,
  StringArgument,
} from "@pcd/pcd-types";
import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";

/**
 * Given an {@link Argument}, renders a UI that displays its value.
 * If the user must supply this value, allows the user to input it.
 * If the value is loaded from the internet, loads it. Contains
 * implementations for each type of argument, as outlined by
 * {@link ArgumentTypeName}
 */
export function PCDArgs<T extends PCDPackage>({
  args,
  setArgs,
  pcdCollection,
}: {
  args: ArgsOf<T>;
  setArgs: (args: ArgsOf<T>) => void;
  pcdCollection: PCDCollection;
}) {
  const entries = Object.entries(args);

  return (
    <ArgsContainer>
      {entries.map(([key, value], i) => (
        <ArgInput
          pcdCollection={pcdCollection}
          key={i}
          argName={key}
          arg={value as any}
          args={args}
          setArgs={setArgs}
        />
      ))}
    </ArgsContainer>
  );
}

export function ArgInput<T extends PCDPackage>({
  arg,
  argName,
  args,
  setArgs,
  pcdCollection,
}: {
  arg: Argument<any, any>;
  argName: string;
  args: ArgsOf<T>;
  setArgs: (args: ArgsOf<T>) => void;
  pcdCollection: PCDCollection;
}) {
  if (isStringArgument(arg)) {
    return (
      <StringArgInput
        args={args}
        arg={arg}
        argName={argName}
        setArgs={setArgs}
      />
    );
  } else if (isNumberArgument(arg)) {
    return (
      <NumberArgInput
        args={args}
        arg={arg}
        argName={argName}
        setArgs={setArgs}
      />
    );
  } else if (isBigIntArgument(arg)) {
    return (
      <BigIntArgInput
        args={args}
        arg={arg}
        argName={argName}
        setArgs={setArgs}
      />
    );
  } else if (isBooleanArgument(arg)) {
    return (
      <BooleanArgInput
        args={args}
        arg={arg}
        argName={argName}
        setArgs={setArgs}
      />
    );
  } else if (isObjectArgument(arg)) {
    return (
      <ObjectArgInput
        args={args}
        arg={arg}
        argName={argName}
        setArgs={setArgs}
      />
    );
  } else if (isPCDArgument(arg)) {
    return (
      <PCDArgInput
        args={args}
        arg={arg}
        argName={argName}
        setArgs={setArgs}
        pcdCollection={pcdCollection}
      />
    );
  }
}

export function StringArgInput<T extends PCDPackage>({
  arg,
  argName,
  args,
  setArgs,
}: {
  arg: StringArgument;
  argName: string;
  args: ArgsOf<T>;
  setArgs: (args: ArgsOf<T>) => void;
}) {
  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      args[argName].value = e.target.value;
      setArgs(JSON.parse(JSON.stringify(args)));
    },
    [args, setArgs, argName]
  );

  return (
    <ArgContainer>
      <Row>
        <ArgName>{argName}</ArgName>
      </Row>
      <Row>
        <InputContainer>
          <input
            value={arg.value}
            onChange={onChange}
            disabled={!arg.userProvided}
          />
        </InputContainer>
      </Row>
    </ArgContainer>
  );
}

export function NumberArgInput<T extends PCDPackage>({
  arg,
  argName,
  args,
  setArgs,
}: {
  arg: NumberArgument;
  argName: string;
  args: ArgsOf<T>;
  setArgs: (args: ArgsOf<T>) => void;
}) {
  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      args[argName].value = e.target.value;
      setArgs(JSON.parse(JSON.stringify(args)));
    },
    [args, setArgs, argName]
  );

  return (
    <ArgContainer>
      <Row>
        <ArgName>{argName}</ArgName>
      </Row>
      <Row>
        <InputContainer>
          <input
            value={arg.value}
            onChange={onChange}
            disabled={!arg.userProvided}
          />
        </InputContainer>
      </Row>
    </ArgContainer>
  );
}

export function BigIntArgInput<T extends PCDPackage>({
  arg,
  argName,
  args,
  setArgs,
}: {
  arg: BigIntArgument;
  argName: string;
  args: ArgsOf<T>;
  setArgs: (args: ArgsOf<T>) => void;
}) {
  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      args[argName].value = e.target.value;
      setArgs(JSON.parse(JSON.stringify(args)));
    },
    [args, setArgs, argName]
  );

  return (
    <ArgContainer>
      <Row>
        <ArgName>{argName}</ArgName>
      </Row>
      <Row>
        <InputContainer>
          <input
            value={arg.value}
            onChange={onChange}
            disabled={!arg.userProvided}
          />
        </InputContainer>
      </Row>
    </ArgContainer>
  );
}

export function BooleanArgInput<T extends PCDPackage>({
  arg,
  argName,
  args,
  setArgs,
}: {
  arg: BooleanArgument;
  argName: string;
  args: ArgsOf<T>;
  setArgs: (args: ArgsOf<T>) => void;
}) {
  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      args[argName].value = e.target.value;
      setArgs(JSON.parse(JSON.stringify(args)));
    },
    [args, setArgs, argName]
  );

  return (
    <ArgContainer>
      <Row>
        <ArgName>{argName}</ArgName>
      </Row>
      <Row>
        <InputContainer>
          <input
            value={arg.value}
            onChange={onChange}
            disabled={!arg.userProvided}
          />
        </InputContainer>
      </Row>
    </ArgContainer>
  );
}

export function ObjectArgInput<T extends PCDPackage>({
  arg,
  argName,
  args,
  setArgs,
}: {
  arg: ObjectArgument<any>;
  argName: string;
  args: ArgsOf<T>;
  setArgs: (args: ArgsOf<T>) => void;
}) {
  const [_loading, setLoading] = useState(arg.remoteUrl !== undefined);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    console.log(`loading ${arg.remoteUrl}`);
    const res = await fetch(arg.remoteUrl);
    const result = await res.json();
    console.log(`loaded ${arg.remoteUrl}:`, result);
    return result;
  }, [arg.remoteUrl]);

  useEffect(() => {
    if (arg.remoteUrl && !loaded) {
      setLoading(true);
      load()
        .then((obj) => {
          setLoading(false);
          setLoaded(true);
          args[argName].value = obj;
          setArgs(JSON.parse(JSON.stringify(args)));
        })
        .catch((_e) => {
          setLoading(false);
          setLoaded(true);
          console.log(`failed to load ${arg.remoteUrl}`);
        });
    }
  }, [arg.remoteUrl, argName, args, load, setArgs, loaded]);

  const onChange = useCallback((_e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // TODO: parse JSON object, validate it
  }, []);

  return (
    <ArgContainer>
      <Row>
        <ArgName>{argName}</ArgName>
      </Row>
      <Row>
        <InputContainer>
          <textarea
            value={JSON.stringify(arg.value)}
            onChange={onChange}
            disabled={!arg.userProvided}
          />
        </InputContainer>
      </Row>
    </ArgContainer>
  );
}

export function PCDArgInput<T extends PCDPackage>({
  arg,
  argName,
  args,
  setArgs,
  pcdCollection,
}: {
  arg: PCDArgument;
  argName: string;
  args: ArgsOf<T>;
  setArgs: (args: ArgsOf<T>) => void;
  pcdCollection: PCDCollection;
}) {
  const [value, setValue] = useState<PCD | undefined>(undefined);

  const onChange = useCallback(
    async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const id = e.target.value;
      const pcd = pcdCollection.getById(id);

      if (pcd) {
        const serialized = await pcdCollection.serialize(pcd);
        args[argName].value = serialized;
        setArgs(JSON.parse(JSON.stringify(args)));
      }
    },
    [argName, args, setArgs, pcdCollection]
  );

  useEffect(() => {
    async function deserialize() {
      if (arg.value !== undefined) {
        const parsed = await pcdCollection.deserialize(arg.value);
        setValue(parsed);
      }
    }

    deserialize();
  }, [arg.value, pcdCollection]);

  return (
    <ArgContainer>
      <Row>
        <ArgName>{argName}</ArgName>
      </Row>
      <Row>
        <Description>{arg.description}</Description>
      </Row>
      <Row>
        <InputContainer>
          <select value={value?.id} onChange={onChange}>
            <option key="none" value={"none"}>
              select
            </option>
            {pcdCollection.getAll().map((pcd) => {
              return (
                <option key={pcd.id} value={pcd.id}>
                  {pcd.type}
                </option>
              );
            })}
          </select>
        </InputContainer>
      </Row>
    </ArgContainer>
  );
}

const Row = styled.div`
  width: 100%;
`;

const Description = styled.span``;

const InputContainer = styled.div`
  padding: 10px;
`;

const ArgName = styled.div`
  padding: 2px 4px;
  font-weight: bold;
  width: 100%;
  background-color: var(--primary-dark);
  color: var(--accent-lite);
  font-weight: 300;
  padding: 10px;
  font-family: monospace;
`;

const ArgContainer = styled.div`
  background-color: white;
  border: 1px solid grey;
  border-radius: 8px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: stretch;
  flex-direction: column;
  border: 1px solid var(--accent-lite);
  overflow: hidden;
`;

const ArgsContainer = styled.div`
  margin: 8px;
  border-radius: 16px;
  color: black;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 16px;
  color: var(--primary-dark);
`;
