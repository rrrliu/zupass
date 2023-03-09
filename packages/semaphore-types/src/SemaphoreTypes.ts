import { Group } from "@semaphore-protocol/group";

export interface SemaphoreGroup {
  id: string;
  name: string;
  members: string[];
  depth: number;
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
