import { LocalBranch } from '../branches';
import { CommitSnapshot } from '../commit';
import { hashAsUUID, ID, Identifiable } from '../id';
import { Repository } from '../repository';

export interface StorageService {
  readonly commits: Repository<StoredCommitSnapshot>;

  readonly localBranches: Repository<StoredLocalBranch>;
}

export type StoredCommitSnapshot = CommitSnapshot & Identifiable;

export type StoredLocalBranch = LocalBranch & Identifiable;

export function makeStoredCommitSnapshot(
  commit: CommitSnapshot
): StoredCommitSnapshot {
  return {
    id: getCommitId(commit),
    ...commit,
  };
}

export function getCommitId(c: CommitSnapshot): ID {
  return hashAsUUID(c.hash);
}

export function makeStoredLocalBranch(branch: LocalBranch): StoredLocalBranch {
  return {
    id: getLocalBranchId(branch),
    ...branch,
  };
}

export function getLocalBranchId(branch: LocalBranch): ID {
  return hashAsUUID(branch.name);
}
