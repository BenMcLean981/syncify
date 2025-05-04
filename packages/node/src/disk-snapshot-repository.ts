import { ID, Identifiable, Repository, Snapshot } from '@syncify/core';
import fs from 'node:fs';
import path from 'node:path';

export class DiskSnapshotRepository<TSnapshot extends Snapshot & Identifiable>
  implements Repository<TSnapshot>
{
  private readonly _rootPath: string;

  public constructor(rootPath: string) {
    this._rootPath = rootPath;
  }

  public async contains(id: ID): Promise<boolean> {
    try {
      await fs.promises.access(this.getPathName(id));
      return true;
    } catch {
      return false;
    }
  }

  public async getAll(): Promise<ReadonlyArray<TSnapshot>> {
    const ids = await fs.promises.readdir(this._rootPath, {
      withFileTypes: false,
    });

    return Promise.all(ids.map((id) => this.get(id)));
  }

  public async get(id: ID): Promise<TSnapshot> {
    if (!(await this.contains(id))) {
      throw new Error(`No entry with id "${id}".`);
    }

    const contents = await fs.promises.readFile(this.getPathName(id), 'utf8');

    return JSON.parse(contents);
  }

  public async add(item: TSnapshot): Promise<void> {
    if (await this.contains(item.id)) {
      throw new Error(`No entry with id "${item.id}".`);
    }

    await fs.promises.writeFile(
      this.getPathName(item.id),
      JSON.stringify(item),
      'utf8'
    );
  }

  public async update(item: TSnapshot): Promise<void> {
    if (!(await this.contains(item.id))) {
      throw new Error(`No entry with id "${item.id}".`);
    }

    await fs.promises.writeFile(
      this.getPathName(item.id),
      JSON.stringify(item),
      'utf8'
    );
  }

  public async delete(id: ID): Promise<void> {
    await fs.promises.rm(this.getPathName(id));
  }

  private getPathName(id: ID): string {
    return path.join(this._rootPath, `${id}.json`);
  }
}
