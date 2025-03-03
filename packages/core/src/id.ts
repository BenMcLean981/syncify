import * as uuid from 'uuid';

export type ID = string | number;

export type Identifiable = {
  id: ID;
};

export function generateUUID(): string {
  return uuid.v4();
}

export function hashAsUUID(s: string): ID {
  return uuid.v5(s, uuid.NIL);
}
