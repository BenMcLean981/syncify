import type { ID, Identifiable } from '../id.js';

export interface Repository<T extends Identifiable> {
  contains(id: ID): Promise<boolean>;

  get(id: ID): Promise<T>;

  add(item: T): Promise<void>;

  update(item: T): Promise<void>;

  delete(id: ID): Promise<void>;
}
