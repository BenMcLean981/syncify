import {
  Repository,
  StorageService,
  StoredCommitSnapshot,
  StoredLocalBranch,
} from '@syncify/core';
import { RestCommitSnapshotRepository } from './rest-commit-snapshot-repository';
import { RestLocalBranchRepository } from './rest-local-branch-repository';

export class RestStorageService implements StorageService {
  private readonly _workspaceId: string;

  public constructor(workspaceId: string) {
    this._workspaceId = workspaceId;
  }

  public get commits(): Repository<StoredCommitSnapshot> {
    return new RestCommitSnapshotRepository(this._workspaceId);
  }

  public get localBranches(): Repository<StoredLocalBranch> {
    return new RestLocalBranchRepository(this._workspaceId);
  }
}
