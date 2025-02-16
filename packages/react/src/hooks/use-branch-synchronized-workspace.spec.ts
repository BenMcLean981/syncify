import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, RenderHookResult } from "@testing-library/react";
import {
  useBranchSynchronizedWorkspace,
  WorkspaceState,
} from "./use-branch-synchronized-workspace";
import {
  BranchSynchronizer,
  CommandCommit,
  getHeadHash,
  getHeadState,
  MAIN_BRANCH,
  makeLocalBranch,
  makeRemoteBranch,
  SetCommand,
  SynchronizationState,
  TestState,
  Workspace,
  WorkspaceImp,
  WorkspaceManipulator,
} from "@syncify/core";

const FREQUENCY = 20_000;

describe("useBranchSynchronizedWorkspace", () => {
  let error: () => void;

  beforeEach(() => {
    vi.useFakeTimers();

    error = console.error;

    console.error = () => {};
  });

  afterEach(() => {
    console.error = error;
  });

  it("Starts off loading if no workspace is given.", () => {
    const hook = renderHook(() =>
      useBranchSynchronizedWorkspace(new FailingSynchronizer()),
    );

    expect(hook.result.current.status).toBe("Loading");
  });

  it("Starts off with initial workspace.", () => {
    const initial = WorkspaceImp.makeEmpty();

    const hook = renderHook(() =>
      useBranchSynchronizedWorkspace(new FailingSynchronizer(), initial),
    );

    if (hook.result.current.status !== "Initial") {
      expect.fail("Not in expected state.");
    }

    expect(hook.result.current.workspace.equals(initial)).toBe(true);
  });

  it("Goes into Never-Connected state if there is a failure.", async () => {
    const hook = renderHook(() =>
      useBranchSynchronizedWorkspace(
        new FailingSynchronizer(),
        undefined,
        FREQUENCY,
      ),
    );

    await wait(FREQUENCY);

    expect(hook.result.current.status).toBe("Never-Connected");
  });

  it("Goes into synchronized state.", async () => {
    const remote = WorkspaceImp.makeNew(new TestState(4));

    const delay = 100;

    const synchronizer = TestWorkspaceSynchronizer.makeSynced(remote, delay);

    const hook = renderHook(() =>
      useBranchSynchronizedWorkspace(synchronizer, undefined, FREQUENCY),
    );

    await wait(FREQUENCY);

    expect(hook.result.current.fetching).toBe(true);

    await wait(delay);

    expect(hook.result.current.fetching).toBe(false);

    if (hook.result.current.status !== "Synced") {
      expect.fail("Not synced.");
    }

    expect(hook.result.current.workspace.equals(remote)).toBe(true);
  });

  it("Doesn't fetch until frequency is up.", async () => {
    const remote = WorkspaceImp.makeNew(new TestState(4));

    const delay = 100;

    const synchronizer = TestWorkspaceSynchronizer.makeSynced(remote, delay);

    const hook = renderHook(() =>
      useBranchSynchronizedWorkspace(synchronizer, undefined, FREQUENCY),
    );

    await wait(FREQUENCY - 1);

    expect(hook.result.current.fetching).toBe(false);
  });

  it("Doesn't fetch a second time until frequency is up.", async () => {
    const remote = WorkspaceImp.makeNew(new TestState(4));

    const delay = 100;

    const synchronizer = TestWorkspaceSynchronizer.makeSynced(remote, delay);

    renderHook(() =>
      useBranchSynchronizedWorkspace(synchronizer, undefined, FREQUENCY),
    );

    await wait(FREQUENCY);
    expect(synchronizer.numSyncs).toBe(1);

    await wait(delay);
    expect(synchronizer.numSyncs).toBe(1);

    await wait(FREQUENCY - 1);
    expect(synchronizer.numSyncs).toBe(1);

    await wait(1);
    expect(synchronizer.numSyncs).toBe(2);
  });

  it("Goes into disconnected synced state.", async () => {
    const local = WorkspaceImp.makeNew(new TestState(4));

    const hook = renderHook(() =>
      useBranchSynchronizedWorkspace(
        new FailingSynchronizer(),
        local,
        FREQUENCY,
      ),
    );

    await wait(FREQUENCY);

    expect(hook.result.current.fetching).toBe(false);

    if (hook.result.current.status !== "Disconnected-Synced") {
      expect.fail("Not disconnected.");
    }

    expect(hook.result.current.workspace.equals(local)).toBe(true);
  });

  describe("Conflicting", () => {
    let synchronizer: TestWorkspaceSynchronizer;
    let hook: RenderHookResult<WorkspaceState<TestState>, unknown>;

    beforeEach(async () => {
      const base = WorkspaceImp.makeNew(new TestState(4));
      const headHash = getHeadHash(base);

      const localCommit = new CommandCommit(headHash, new SetCommand(5));
      const remoteCommit = new CommandCommit(headHash, new SetCommand(6));

      const withCommits = new WorkspaceManipulator(base)
        .commit(localCommit)
        .commit(remoteCommit).workspace;

      const conflicting = withCommits.setBranches(
        withCommits.branches
          .updateBranch(makeLocalBranch(MAIN_BRANCH, localCommit.hash))
          .upsertBranch(makeRemoteBranch(MAIN_BRANCH, remoteCommit.hash)),
      );

      synchronizer = TestWorkspaceSynchronizer.makeConflict(conflicting, 0);

      hook = renderHook(() =>
        useBranchSynchronizedWorkspace(synchronizer, undefined, FREQUENCY),
      );

      await wait(FREQUENCY);
    });

    it("Allows states to be gotten.", () => {
      if (hook.result.current.status !== "Conflict") {
        expect.fail("Not in conflict.");
      }

      expect(hook.result.current.local.equals(new TestState(5))).toBe(true);
      expect(hook.result.current.remote.equals(new TestState(6))).toBe(true);
    });

    it("Allows local to be taken.", async () => {
      await act(async () => {
        if (hook.result.current.status !== "Conflict") {
          expect.fail("Not in conflict.");
        }

        hook.result.current.takeLocal();
      });

      if (hook.result.current.status !== "Synced") {
        expect.fail("Not synced.");
      }

      const actual = getHeadState(hook.result.current.workspace);
      const expectedState = new TestState(5);

      expect(actual.equals(expectedState)).toBe(true);
    });

    it("Allows remote to be taken.", async () => {
      await act(async () => {
        if (hook.result.current.status !== "Conflict") {
          expect.fail("Not in conflict.");
        }

        hook.result.current.takeRemote();
      });

      if (hook.result.current.status !== "Synced") {
        expect.fail("Not synced.");
      }

      const actual = getHeadState(hook.result.current.workspace);
      const expectedState = new TestState(6);

      expect(actual.equals(expectedState)).toBe(true);
    });

    it("Goes into disconnected-conflict state.", async () => {
      synchronizer.disable();

      await wait(FREQUENCY);

      expect(hook.result.current.status !== "Disconnected-Conflict");
    });
  });

  async function wait(time: number) {
    await act(async () => vi.advanceTimersByTime(time));
  }
});

class FailingSynchronizer implements BranchSynchronizer<TestState> {
  public async synchronize(): Promise<SynchronizationState<TestState>> {
    throw new Error("Method not implemented.");
  }
}

class TestWorkspaceSynchronizer implements BranchSynchronizer<TestState> {
  private readonly _result: SynchronizationState<TestState>;

  private readonly _delay: number;

  private _disabled: boolean = false;

  private _numSyncs: number = 0;

  private constructor(
    result: SynchronizationState<TestState>,
    delay: number = 100,
  ) {
    this._result = result;
    this._delay = delay;
  }

  public get numSyncs(): number {
    return this._numSyncs;
  }

  public static makeSynced(
    workspace: Workspace<TestState>,
    delay?: number,
  ): TestWorkspaceSynchronizer {
    const state: SynchronizationState<TestState> = {
      status: "Synced",
      workspace,
    };

    return new TestWorkspaceSynchronizer(state, delay);
  }

  public static makeConflict(
    workspace: Workspace<TestState>,
    delay?: number,
  ): TestWorkspaceSynchronizer {
    const state: SynchronizationState<TestState> = {
      status: "Conflict",
      workspace,
    };

    return new TestWorkspaceSynchronizer(state, delay);
  }

  public disable() {
    this._disabled = true;
  }

  public async synchronize(): Promise<SynchronizationState<TestState>> {
    if (this._disabled) {
      throw new Error("Not connected.");
    }

    this._numSyncs += 1;

    if (this._delay === 0) {
      return this._result;
    } else {
      return new Promise((resolve) =>
        setTimeout(() => resolve(this._result), this._delay),
      );
    }
  }
}
