import type { ID, Identifiable } from '../id';

export interface Repository<T extends Identifiable> {
  contains(id: ID): Promise<boolean>;

  getAll(): Promise<ReadonlyArray<T>>;

  get(id: ID): Promise<T>;

  add(item: T): Promise<void>;

  update(item: T): Promise<void>;

  delete(id: ID): Promise<void>;
}
