import { beforeEach, describe, expect, it } from "vitest";
import {
  getHeadState,
  type Workspace,
  WorkspaceImp,
} from "../../workspace/index.js";
import { SetCommand, TestState } from "../../test-state/index.js";
import { WorkspaceBasedRemoteFetcher } from "../../remote-fetcher/workspace-based-remote-fetcher.js";
import { WorkspaceManipulator } from "../../workspace/workspace-manipulator.js";
import {
  fetchAndSynchronizeBranch,
  isConflict,
  isSynced,
  SynchronizationState,
} from "../branch-synchronizer.js";

describe("fetchAndSynchronizeBranch", () => {
  let base: Workspace<TestState>;

  let ahead1: Workspace<TestState>;
  let ahead2: Workspace<TestState>;

  beforeEach(() => {
    base = WorkspaceImp.makeNew(new TestState(5));

    ahead1 = new WorkspaceManipulator(base).apply(new SetCommand(6)).workspace;
    ahead2 = new WorkspaceManipulator(base).apply(new SetCommand(7)).workspace;
  });

  it("Throws an error for local branch missing.", () => {
    const fetcher = new WorkspaceBasedRemoteFetcher(base);

    expect(() =>
      fetchAndSynchronizeBranch(base, fetcher, "foo")
    ).rejects.toThrowError();
  });

  it("Creates a branch on the remote when missing.", async () => {
    const fetcher = new WorkspaceBasedRemoteFetcher<TestState>();

    const result = await fetchAndSynchronizeBranch(base, fetcher);

    expectSynced(result, fetcher.workspace, getHeadState(base));
  });

  it("Does nothing when there is no difference.", async () => {
    const fetcher = new WorkspaceBasedRemoteFetcher(ahead1);

    const result = await fetchAndSynchronizeBranch(ahead1, fetcher);

    expectSynced(result, fetcher.workspace, getHeadState(ahead1));
  });

  it("Pushes missing commits when local ahead.", async () => {
    const fetcher = new WorkspaceBasedRemoteFetcher(base);

    const result = await fetchAndSynchronizeBranch(ahead1, fetcher);

    expectSynced(result, fetcher.workspace, getHeadState(ahead1));
  });

  it("Pulls missing commits when remote ahead.", async () => {
    const fetcher = new WorkspaceBasedRemoteFetcher(ahead1);

    const result = await fetchAndSynchronizeBranch(base, fetcher);

    expectSynced(result, fetcher.workspace, getHeadState(ahead1));
  });

  it("Returns a merge conflict.", async () => {
    const fetcher = new WorkspaceBasedRemoteFetcher(ahead1);

    const result = await fetchAndSynchronizeBranch(ahead2, fetcher);

    expectConflict(result, ahead1);
  });

  function expectSynced(
    result: SynchronizationState<TestState>,
    remote: Workspace<TestState>,
    expectedState: TestState
  ): void {
    if (!isSynced(result)) {
      expect.fail("Not synced.");
    }

    expect(getHeadState(result.workspace).equals(expectedState)).toBe(true);
    expect(getHeadState(remote).equals(expectedState)).toBe(true);
  }

  function expectConflict(
    result: SynchronizationState<TestState>,
    expectedWorkspace: Workspace<TestState>
  ): void {
    if (!isConflict(result)) {
      expect.fail("Not in conflict.");
    }

    expect(result.workspace.equals(expectedWorkspace)).toBe(true);
  }
});
