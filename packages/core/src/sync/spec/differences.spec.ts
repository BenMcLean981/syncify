import { beforeEach, describe, expect, it } from 'vitest';
import { MAIN_BRANCH } from '../../branches';
import { SetCommand, TestState } from '../../test-state';
import { haveSameItems } from '../../utils';
import { type Workspace, InMemoryWorkspace } from '../../workspace';
import { getAllPreviousCommitsHashes } from '../../workspace/navigation';
import { WorkspaceManipulator } from '../../workspace/workspace-manipulator';

describe('getAllPreviousCommits', () => {
  let initial: Workspace<TestState>;

  let ws: Workspace<TestState>;

  beforeEach(() => {
    initial = InMemoryWorkspace.makeNew(new TestState(5));

    ws = new WorkspaceManipulator(initial)
      .apply(new SetCommand(4))
      .apply(new SetCommand(8)).workspace;
  });

  it('Goes to root.', () => {
    const hash = ws.branches.getLocalBranch(MAIN_BRANCH).head;
    const head = ws.getCommit(hash);
    const c1 = ws.getCommit([...head.parents][0]);
    const c2 = ws.getCommit([...c1.parents][0]);

    const actual = getAllPreviousCommitsHashes(ws, hash);
    const expected = new Set([head.hash, c1.hash, c2.hash]);

    expect(haveSameItems(actual, expected)).toBe(true);
  });

  it('Stops to before commit.', () => {
    const hash = ws.branches.getLocalBranch(MAIN_BRANCH).head;
    const head = ws.getCommit(hash);
    const c1 = ws.getCommit([...head.parents][0]);
    const c2 = ws.getCommit([...c1.parents][0]);

    const actual = getAllPreviousCommitsHashes(
      ws,
      hash,
      (c) => c.hash === c2.hash
    );
    const expected = new Set([head.hash, c1.hash]);

    expect(haveSameItems(actual, expected)).toBe(true);
  });

  it('Excludes stop commit if its head.', () => {
    const hash = ws.branches.getLocalBranch(MAIN_BRANCH).head;
    const head = ws.getCommit(hash);

    const actual = getAllPreviousCommitsHashes(
      ws,
      hash,
      (c) => c.hash === head.hash
    );
    const expected = new Set([]);

    expect(haveSameItems(actual, expected)).toBe(true);
  });
});
