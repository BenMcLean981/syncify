import type { ID, Identifiable } from '../id.ts';
import type { Subject } from '../observer';
import { SubjectImp } from '../observer';
import { type ObservableRepository } from './observable-repository';

export class InMemoryRepository<T extends Identifiable>
  implements ObservableRepository<T>
{
  private readonly _items: Record<ID, T> = {};

  private readonly _onAdd = new SubjectImp<T>();

  private readonly _onUpdate = new SubjectImp<T>();

  private readonly _onDelete = new SubjectImp<T>();

  public constructor(items: Iterable<T>) {
    for (const item of items) {
      if (item.id in this._items) {
        throw new Error(`Multiple items with id "${item.id}."`);
      }

      this._items[item.id] = item;
    }
  }

  public get onAdd(): Subject<T> {
    return this._onAdd;
  }

  public get onUpdate(): Subject<T> {
    return this._onUpdate;
  }

  public get onDelete(): Subject<T> {
    return this._onDelete;
  }

  public async contains(id: ID): Promise<boolean> {
    return id in this._items;
  }

  public async get(id: ID): Promise<T> {
    if (!(await this.contains(id))) {
      throw new Error(`No item with id "${id}" in repository.`);
    }

    return this._items[id];
  }

  public async add(item: T): Promise<void> {
    if (await this.contains(item.id)) {
      throw new Error(`Repository already contains item with id "${item.id}".`);
    }

    this._items[item.id] = item;

    await this.onAdd.update(item);
  }

  public async update(item: T): Promise<void> {
    if (!(await this.contains(item.id))) {
      throw new Error(`No item with id "${item.id}" in repository.`);
    }

    this._items[item.id] = item;

    await this.onUpdate.update(item);
  }

  public async delete(id: ID): Promise<void> {
    if (!(await this.contains(id))) {
      throw new Error(`No item with id "${id}" in repository.`);
    }

    const item = this._items[id];
    delete this._items[id];

    await this.onDelete.update(item);
  }
}
