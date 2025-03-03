import { beforeEach, describe, expect, it } from 'vitest';
import { MAIN_BRANCH, makeRemoteBranch } from '../../branches';
import { CommandCommit, Commit } from '../../commit';
import { InMemoryRemoteFetcher } from '../../remote-fetcher/in-memory-remote-fetcher';
import {
  restoreTestCommand,
  restoreTestState,
  SetCommand,
  TestState,
} from '../../test-state';
import {
  getHeadHash,
  getHeadState,
  InMemoryWorkspace,
  WorkspaceManipulator,
  type Workspace,
} from '../../workspace';
import {
  isConflict,
  isSynced,
  SynchronizationState,
} from '../branch-synchronizer';
import { BranchSynchronizerImp } from '../branch-synchronizer-imp';

describe('BranchSynchronized', () => {
  let base: Workspace<TestState>;

  let c1: Commit<TestState>;
  let c2: Commit<TestState>;

  let ahead1: Workspace<TestState>;
  let ahead2: Workspace<TestState>;

  beforeEach(() => {
    base = InMemoryWorkspace.makeNew(new TestState(5));

    c1 = new CommandCommit(getHeadHash(base), new SetCommand(6));
    c2 = new CommandCommit(getHeadHash(base), new SetCommand(7));

    ahead1 = new WorkspaceManipulator(base).commit(c1).workspace;
    ahead2 = new WorkspaceManipulator(base).commit(c2).workspace;
  });

  it('Throws an error for local branch missing.', async () => {
    const fetcher = new InMemoryRemoteFetcher(
      base,
      restoreTestCommand,
      restoreTestState
    );
    const synchronizer = new BranchSynchronizerImp(
      fetcher,
      restoreTestCommand,
      restoreTestState
    );

    await expect(() =>
      synchronizer.synchronize(base, 'foo')
    ).rejects.toThrowError();
  });

  it('Creates a branch on the remote when missing.', async () => {
    const fetcher = new InMemoryRemoteFetcher<TestState>(
      undefined,
      restoreTestCommand,
      restoreTestState
    );
    const synchronizer = new BranchSynchronizerImp(
      fetcher,
      restoreTestCommand,
      restoreTestState
    );

    const result = await synchronizer.synchronize(base);

    expectSynced(result, fetcher.workspace, getHeadState(base));
  });

  it('Does nothing when there is no difference.', async () => {
    const fetcher = new InMemoryRemoteFetcher(
      ahead1,
      restoreTestCommand,
      restoreTestState
    );
    const synchronizer = new BranchSynchronizerImp(
      fetcher,
      restoreTestCommand,
      restoreTestState
    );

    const result = await synchronizer.synchronize(ahead1);

    expectSynced(result, fetcher.workspace, getHeadState(ahead1));
  });

  it('Pushes missing commits when local ahead.', async () => {
    const fetcher = new InMemoryRemoteFetcher(
      base,
      restoreTestCommand,
      restoreTestState
    );
    const synchronizer = new BranchSynchronizerImp(
      fetcher,
      restoreTestCommand,
      restoreTestState
    );

    const result = await synchronizer.synchronize(ahead1);

    expectSynced(result, fetcher.workspace, getHeadState(ahead1));
  });

  it('Pulls missing commits when remote ahead.', async () => {
    const fetcher = new InMemoryRemoteFetcher(
      ahead1,
      restoreTestCommand,
      restoreTestState
    );
    const synchronizer = new BranchSynchronizerImp(
      fetcher,
      restoreTestCommand,
      restoreTestState
    );

    const result = await synchronizer.synchronize(base);

    expectSynced(result, fetcher.workspace, getHeadState(ahead1));
  });

  it('Returns a merge conflict.', async () => {
    const fetcher = new InMemoryRemoteFetcher(
      ahead1,
      restoreTestCommand,
      restoreTestState
    );
    const synchronizer = new BranchSynchronizerImp(
      fetcher,
      restoreTestCommand,
      restoreTestState
    );

    const result = await synchronizer.synchronize(ahead2);

    const withBoth = ahead2
      .addCommit(c1)
      .setBranches(
        ahead2.branches.upsertBranch(makeRemoteBranch(MAIN_BRANCH, c1.hash))
      );

    expectConflict(result, withBoth);
  });

  function expectSynced(
    result: SynchronizationState<TestState>,
    remote: Workspace<TestState>,
    expectedState: TestState
  ): void {
    if (!isSynced(result)) {
      expect.fail('Not synced.');
    }

    expect(getHeadState(result.workspace).equals(expectedState)).toBe(true);
    expect(getHeadState(remote).equals(expectedState)).toBe(true);
  }

  function expectConflict(
    result: SynchronizationState<TestState>,
    expectedWorkspace: Workspace<TestState>
  ): void {
    if (!isConflict(result)) {
      expect.fail('Not in conflict.');
    }

    expect(result.workspace.equals(expectedWorkspace)).toBe(true);
  }
});
