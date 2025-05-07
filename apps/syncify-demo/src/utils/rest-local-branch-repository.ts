import { ID, Repository, StoredLocalBranch } from '@syncify/core';
import { throwResponseError } from './utils';

export class RestLocalBranchRepository
  implements Repository<StoredLocalBranch>
{
  private readonly _workspaceId: string;

  public constructor(workspaceId: string) {
    this._workspaceId = workspaceId;
  }

  public async contains(id: ID): Promise<boolean> {
    const response = await fetch(
      `/api/workspaces/${this._workspaceId}/branches/${id}`
    );

    if (response.status === 200) {
      return true;
    } else if (response.status === 404) {
      return false;
    } else {
      throwResponseError(response);
    }
  }

  public async getAll(): Promise<ReadonlyArray<StoredLocalBranch>> {
    const response = await fetch(
      `/api/workspaces/${this._workspaceId}/branches`
    );

    if (!response.ok) {
      throwResponseError(response);
    }

    const data = (await response.json()) as {
      branches: ReadonlyArray<StoredLocalBranch>;
    };

    return data.branches;
  }

  public async get(id: ID): Promise<StoredLocalBranch> {
    const response = await fetch(
      `/api/workspaces/${this._workspaceId}/branch/${id}`
    );

    if (!response.ok) {
      throwResponseError(response);
    }

    const data = (await response.json()) as { branch: StoredLocalBranch };

    return data.branch;
  }

  public async add(item: StoredLocalBranch): Promise<void> {
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

  public async update(item: StoredLocalBranch): Promise<void> {
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
