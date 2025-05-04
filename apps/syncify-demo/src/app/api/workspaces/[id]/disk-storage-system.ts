import {
  Repository,
  StorageService,
  StoredCommitSnapshot,
  StoredLocalBranch,
} from '@syncify/core';
import path from 'node:path';

import { DiskSnapshotRepository } from '@syncify/node';
import envPaths from 'env-paths';

const paths = envPaths('syncify-demo', { suffix: '' });

export class DiskStorageSystem implements StorageService {
  private readonly _workspaceId: string;

  public constructor(workspaceId: string) {
    this._workspaceId = workspaceId;
  }

  public get commits(): Repository<StoredCommitSnapshot> {
    const commitsDir = path.join(
      paths.data,
      'workspaces',
      this._workspaceId,
      'commits'
    );

    return new DiskSnapshotRepository(commitsDir);
  }

  public get localBranches(): Repository<StoredLocalBranch> {
    const branchesDir = path.join(
      paths.data,
      'workspaces',
      this._workspaceId,
      'branches'
    );

    return new DiskSnapshotRepository(branchesDir);
  }
}
