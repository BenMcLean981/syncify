import { getHeadHash, WorkspaceImp } from "../workspace-imp.js";
import {
  CommandCommit,
  type Commit,
  InitialCommit,
  MergeCommit,
} from "../../commit/index.js";
import {
  type LocalBranch,
  MAIN_BRANCH,
  makeLocalBranch,
} from "../../branches/branches.js";
import { SetCommand, TestState } from "../../test-state/index.js";
import { beforeEach, describe, expect, it } from "vitest";
import { type Workspace } from "../workspace.js";

describe("WorkspaceImp", () => {
  it("Initializes to an empty state with a name.", () => {
    const w = WorkspaceImp.makeNew<TestState>(new TestState(5));

    const state = w.getState(getHeadHash(w));

    expect(state.value).toBe(5);
  });

  it("Allows the state to have commands applied.", () => {
    let w = WorkspaceImp.makeNew(new TestState(5));
    const commit = new CommandCommit(getHeadHash(w), new SetCommand(6));

    w = w
      .addCommit(commit)
      .setBranches(
        w.branches.updateBranch(makeLocalBranch(MAIN_BRANCH, commit.hash))
      );

    const state = w.getState(getHeadHash(w));

    expect(state.value).toBe(6);
  });

  describe("addCommit", () => {
    it("Throws an error for duplicate commit.", () => {
      const w = WorkspaceImp.makeNew(new TestState(5));
      const commit = new CommandCommit(getHeadHash(w), new SetCommand(6));

      expect(() => w.addCommit(commit).addCommit(commit)).toThrowError();
    });

    it("Throws an error for missing parent commit.", () => {
      const workspace = WorkspaceImp.makeNew(new TestState(5));
      const commit = new CommandCommit("123", new SetCommand(6));

      expect(() => workspace.addCommit(commit)).toThrowError();
    });

    it("Throws an error for duplicate initial commit.", () => {
      const workspace = WorkspaceImp.makeNew(new TestState(5));
      const commit = new InitialCommit(new TestState(6));

      expect(() => workspace.addCommit(commit)).toThrowError();
    });
  });

  describe("setBranches", () => {
    it("Throws an error for commit missing.", () => {
      const workspace = WorkspaceImp.makeNew(new TestState(5));

      expect(() =>
        workspace.setBranches(
          workspace.branches.updateBranch(makeLocalBranch(MAIN_BRANCH, "123"))
        )
      ).toThrowError();
    });
  });

  it("Handles merge commits correctly.", () => {
    const w = WorkspaceImp.makeNew(new TestState(5));

    const c1 = new CommandCommit(getHeadHash(w), new SetCommand(6));
    const c2 = new CommandCommit(getHeadHash(w), new SetCommand(7));

    const m1 = new MergeCommit<TestState>(c1.hash, c2.hash, c1.hash);
    const m2 = new MergeCommit<TestState>(c1.hash, c2.hash, c2.hash);

    const w1 = w
      .addCommit(c1)
      .addCommit(c2)
      .addCommit(m1)
      .setBranches(
        w.branches.updateBranch(makeLocalBranch(MAIN_BRANCH, m1.hash))
      );
    const w2 = w
      .addCommit(c1)
      .addCommit(c2)
      .addCommit(m2)
      .setBranches(
        w.branches.updateBranch(makeLocalBranch(MAIN_BRANCH, m2.hash))
      );

    expect(w1.getState(getHeadHash(w1)).value).toBe(6);
    expect(w2.getState(getHeadHash(w2)).value).toBe(7);
  });

  describe("equals", () => {
    let initialLocal: LocalBranch;

    let empty: Workspace<TestState>;
    let ws: Workspace<TestState>;
    let commit: Commit<TestState>;

    beforeEach(() => {
      empty = WorkspaceImp.makeNew(new TestState(5));

      initialLocal = empty.branches.getLocalBranch(MAIN_BRANCH);

      commit = new CommandCommit(initialLocal.head, new SetCommand(6));

      ws = empty
        .addCommit(commit)
        .setBranches(
          empty.branches.updateBranch(makeLocalBranch(MAIN_BRANCH, commit.hash))
        );
    });

    it("Returns true for equal.", () => {
      const other = empty
        .addCommit(commit)
        .setBranches(
          empty.branches.updateBranch(makeLocalBranch(MAIN_BRANCH, commit.hash))
        );

      expect(ws.equals(other)).toBe(true);
    });

    it("Returns false for different commits but same branches.", () => {
      const ws1 = empty.addCommit(commit);

      const ws2 = empty.addCommit(
        new CommandCommit(initialLocal.head, new SetCommand(7))
      );

      expect(ws1.equals(ws2)).toBe(false);
    });

    it("Returns false for different branches but same commits.", () => {
      const other = ws.setBranches(ws.branches.updateBranch(initialLocal));

      expect(ws.equals(other)).toBe(false);
    });

    it("Returns false for different types.", () => {
      expect(ws.equals({})).toBe(false);
    });
  });
});
