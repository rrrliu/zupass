import {
  BigIntArgument,
  DisplayOptions,
  ObjectArgument,
  PCD,
  PCDArgument,
  PCDPackage,
  SerializedPCD,
} from "@pcd/pcd-types";
import {
  SemaphoreIdentityPCD,
  SemaphoreIdentityPCDPackage,
} from "@pcd/semaphore-identity-pcd";
import {
  FullProof,
  generateProof,
  Proof,
  verifyProof,
} from "@semaphore-protocol/proof";
import JSONBig from "json-bigint";
import { v4 as uuid } from "uuid";
import {
  deserializeSemaphoreGroup,
  SerializedSemaphoreGroup,
} from "./SerializedSemaphoreGroup";

let initArgs: SempahoreGroupPCDInitArgs | undefined = undefined;

export const SemaphoreGroupPCDTypeName = "semaphore-group-signal";

export interface SempahoreGroupPCDInitArgs {
  // TODO: how do we distribute these in-package, so that consumers
  // of the package don't have to copy-paste these artifacts?
  // TODO: how do we account for different versions of the same type
  // of artifact? eg. this one is parameterized by group size. Should
  // we pre-generate a bunch of artifacts per possible group size?
  // Should we do code-gen?
  zkeyFilePath: string;
  wasmFilePath: string;
}

export interface SemaphoreGroupPCDArgs {
  group: ObjectArgument<SerializedSemaphoreGroup>;
  identity: PCDArgument<SemaphoreIdentityPCD>;
  externalNullifier: BigIntArgument;
  signal: BigIntArgument;
}

export interface SemaphoreGroupPCDClaim {
  /**
   * A serialized version of the group to which this PCD is referring.
   */
  group: SerializedSemaphoreGroup;

  /**
   * Stringified `BigInt`.
   */
  signal: string;

  /**
   * Stringified `BigInt`.
   */
  externalNullifier: string;

  /**
   * Stringified `BigInt`.
   */
  nullifierHash: string;
}

export type SemaphoreGroupPCDProof = Proof;

export class SemaphoreGroupPCD
  implements PCD<SemaphoreGroupPCDClaim, SemaphoreGroupPCDProof>
{
  type = SemaphoreGroupPCDTypeName;
  claim: SemaphoreGroupPCDClaim;
  proof: SemaphoreGroupPCDProof;
  id: string;

  public constructor(
    id: string,
    claim: SemaphoreGroupPCDClaim,
    proof: SemaphoreGroupPCDProof
  ) {
    this.id = id;
    this.claim = claim;
    this.proof = proof;
  }
}

export async function init(args: SempahoreGroupPCDInitArgs): Promise<void> {
  initArgs = args;
}

export async function prove(
  args: SemaphoreGroupPCDArgs
): Promise<SemaphoreGroupPCD> {
  if (!initArgs) {
    throw new Error("cannot make group proof: init has not been called yet");
  }

  const serializedIdentityPCD = args.identity.value?.pcd;
  if (!serializedIdentityPCD) {
    throw new Error("cannot make group proof: missing semaphore identity PCD");
  }
  const identityPCD = await SemaphoreIdentityPCDPackage.deserialize(
    serializedIdentityPCD
  );

  const serializedGroup = args.group.value;
  if (!serializedGroup) {
    throw new Error("cannot make group proof: missing semaphore group");
  }

  if (!args.externalNullifier.value) {
    throw new Error("cannot make group proof: missing externalNullifier");
  }

  if (!args.signal.value) {
    throw new Error("cannot make group proof: missing signal");
  }

  const deserializedGroup = deserializeSemaphoreGroup(serializedGroup);

  const fullProof = await generateProof(
    identityPCD.claim.identity,
    deserializedGroup,
    args.externalNullifier.value,
    args.signal.value,
    {
      zkeyFilePath: initArgs.zkeyFilePath,
      wasmFilePath: initArgs.wasmFilePath,
    }
  );

  const claim: SemaphoreGroupPCDClaim = {
    group: serializedGroup,
    externalNullifier: args.externalNullifier.value.toString(),
    nullifierHash: fullProof.nullifierHash.toString(),
    signal: args.signal.value.toString(),
  };

  const proof: SemaphoreGroupPCDProof = fullProof.proof;

  return new SemaphoreGroupPCD(uuid(), claim, proof);
}

export async function verify(pcd: SemaphoreGroupPCD): Promise<boolean> {
  const deserializedGroup = deserializeSemaphoreGroup(pcd.claim.group);

  const fullProof: FullProof = {
    externalNullifier: pcd.claim.externalNullifier,
    merkleTreeRoot: deserializedGroup.root + "",
    nullifierHash: pcd.claim.nullifierHash,
    signal: pcd.claim.signal,
    proof: pcd.proof,
  };

  const valid = await verifyProof(fullProof, pcd.claim.group.depth);

  return valid;
}

export async function serialize(
  pcd: SemaphoreGroupPCD
): Promise<SerializedPCD<SemaphoreGroupPCD>> {
  return {
    type: SemaphoreGroupPCDTypeName,
    pcd: JSONBig().stringify(pcd),
  } as SerializedPCD<SemaphoreGroupPCD>;
}

export async function deserialize(
  serialized: string
): Promise<SemaphoreGroupPCD> {
  return JSONBig().parse(serialized);
}

export function getDisplayOptions(_pcd: SemaphoreGroupPCD): DisplayOptions {
  return {
    backgroundColor: "#ff00ff",
    header: "Semaphore Group Signal",
  };
}

/**
 * PCD-conforming wrapper for the Semaphore zero-knowledge protocol. You can
 * find documentation of Semaphore here: https://semaphore.appliedzkp.org/docs/introduction
 */
export const SemaphoreGroupPCDPackage: PCDPackage<
  SemaphoreGroupPCDClaim,
  SemaphoreGroupPCDProof,
  SemaphoreGroupPCDArgs,
  SempahoreGroupPCDInitArgs
> = {
  name: SemaphoreGroupPCDTypeName,
  getDisplayOptions,
  init,
  prove,
  verify,
  serialize,
  deserialize,
};
