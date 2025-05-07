import { ID, Repository, StoredCommitSnapshot } from '@syncify/core';
import { throwResponseError } from './utils';

export class RestCommitSnapshotRepository
  implements Repository<StoredCommitSnapshot>
{
  private readonly _workspaceId: string;

  public constructor(workspaceId: string) {
    this._workspaceId = workspaceId;
  }

  public async contains(id: ID): Promise<boolean> {
    const response = await fetch(
      `/api/workspaces/${this._workspaceId}/commits/${id}`
    );

    if (response.status === 200) {
      return true;
    } else if (response.status === 404) {
      return false;
    } else {
      throwResponseError(response);
    }
  }

  public async getAll(): Promise<ReadonlyArray<StoredCommitSnapshot>> {
    const response = await fetch(
      `/api/workspaces/${this._workspaceId}/commits`
    );

    if (!response.ok) {
      throwResponseError(response);
    }

    const data = (await response.json()) as {
      commits: ReadonlyArray<StoredCommitSnapshot>;
    };

    return data.commits;
  }

  public async get(id: ID): Promise<StoredCommitSnapshot> {
    const response = await fetch(
      `/api/workspaces/${this._workspaceId}/branch/${id}`
    );

    if (!response.ok) {
      throwResponseError(response);
    }

    const data = (await response.json()) as { branch: StoredCommitSnapshot };

    return data.branch;
  }

  public async add(item: StoredCommitSnapshot): Promise<void> {
    const response = await fetch(
      `/api/workspaces/${this._workspaceId}/branch`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(item),
      }
    );

    if (!response.ok) {
      throwResponseError(response);
    }
  }

  public async update(item: StoredCommitSnapshot): Promise<void> {
    const response = await fetch(
      `/api/workspaces/${this._workspaceId}/branch`,
      {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(item),
      }
    );

    if (!response.ok) {
      throwResponseError(response);
    }
  }

  public async delete(id: ID): Promise<void> {
    const response = await fetch(
      `/api/workspaces/${this._workspaceId}/branch/${id}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      throwResponseError(response);
    }
  }
}
