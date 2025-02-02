import { v4 } from 'uuid';

export type ID = string | number;

export type Identifiable = {
  id: ID;
};

export function uuid(): string {
  return v4();
}
