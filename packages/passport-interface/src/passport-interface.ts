import { Group } from "@semaphore-protocol/group";
import { PCD } from "pcd-types";

enum PCDRequestType {
  Get = "Get",
  Add = "Add",
}

export interface PCDRequest {
  returnUrl: string;
  type: PCDRequestType;
}

export interface PCDGetRequest extends PCDRequest {
  type: PCDRequestType.Get;
  pcdType: string;
  params: any;
}

export interface PCDAddRequest extends PCDRequest {
  type: PCDRequestType.Add;
  pcd: PCD;
}

export function constructPassportPcdGetRequestUrl(
  passportOrigin: string,
  returnUrl: string,
  pcdType: string,
  parameters: any
) {
  const req: PCDGetRequest = {
    type: PCDRequestType.Get,
    returnUrl: returnUrl,
    params: parameters,
    pcdType,
  };
  return `${passportOrigin}?request=${encodeURIComponent(JSON.stringify(req))}`;
}

export function constructPassportPcdAddRequestUrl(
  passportOrigin: string,
  returnUrl: string,
  pcd: PCD
) {
  const req: PCDAddRequest = {
    type: PCDRequestType.Add,
    returnUrl: returnUrl,
    pcd,
  };
  return `${passportOrigin}?request=${JSON.stringify(req)}`;
}

export function passportReceiveRequest(
  url: string
): PCDGetRequest | PCDAddRequest {
  const URL = new URLSearchParams(url);

  const request = JSON.parse(URL.get("request") || "");

  console.log(request);

  return {} as any;
}

export function isPassportGetRequest(req: any): req is PCDGetRequest {
  return req.type === PCDRequestType.Get;
}

export function isPassportAddRequest(req: any): req is PCDAddRequest {
  return req.type === PCDRequestType.Add;
}

export function serializeSemaphoreGroup(
  group: Group,
  name: string
): SemaphoreGroup {
  return {
    id: group.id.toString(),
    name,
    members: group.members.map((m) => m.toString()),
    depth: group.depth,
  };
}

export function deserializeSemaphoreGroup(serializedGroup: SemaphoreGroup) {
  const group = new Group(BigInt(serializedGroup.id), serializedGroup.depth);
  group.addMembers(serializedGroup.members.map((m) => BigInt(m)));
  return group;
}

export interface SemaphoreGroup {
  id: string;
  name: string;
  members: string[];
  depth: number;
}
