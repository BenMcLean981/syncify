import { type Workspace } from './workspace.js';
import {
  CommandCommit,
  type Commit,
  InitialCommit,
  MergeCommit,
  RevertCommit,
} from '../commit/index.js';
import { getHeadHash } from './workspace-imp.js';
import { MAIN_BRANCH, makeLocalBranch } from '../branches/index.js';
import { type Command } from '../command/index.js';
import { type Memento } from '../memento/index.js';
import { getAllPrimaryPreviousCommits } from './navigation.js';
import { isOdd } from '../utils/index.js';

// TODO: Stop iterating commits iterable for performance.

export class WorkspaceManipulator<TState extends Memento> {
  private readonly _workspace: Workspace<TState>;

  public constructor(workspace: Workspace<TState>) {
    this._workspace = workspace;
  }

  public get workspace(): Workspace<TState> {
    return this._workspace;
  }

  public apply(
    command: Command<TState>,
    branchName = MAIN_BRANCH
  ): WorkspaceManipulator<TState> {
    const head = getHeadHash(this._workspace, branchName);

    return this.commit(new CommandCommit(head, command), branchName);
  }

  /**
   * Creates a merge with the target as the result.
   */

  public mergeTarget(
    target: string,
    branchName = MAIN_BRANCH
  ): WorkspaceManipulator<TState> {
    const head = getHeadHash(this._workspace, branchName);

    const commit = new MergeCommit<TState>(target, head, target);

    return this.commit(commit, branchName);
  }

  /**
   * Creates a merge with the current head as the result.
   */
  public mergeSource(
    target: string,
    branchName = MAIN_BRANCH
  ): WorkspaceManipulator<TState> {
    const head = getHeadHash(this._workspace, branchName);

    const commit = new MergeCommit<TState>(target, head, head);

    return this.commit(commit, branchName);
  }

  public commit(
    commit: Commit<TState>,
    branchName = MAIN_BRANCH
  ): WorkspaceManipulator<TState> {
    const newBranch = makeLocalBranch(branchName, commit.hash);
    const newBranches = this._workspace.branches.updateBranch(newBranch);
    const ws = this._workspace.addCommit(commit).setBranches(newBranches);

    return new WorkspaceManipulator<TState>(ws);
  }

  public canUndo(branchName = MAIN_BRANCH): boolean {
    return this.tryFindingCommitToUndo(branchName) !== undefined;
  }

  public undo(branchName = MAIN_BRANCH): WorkspaceManipulator<TState> {
    const head = getHeadHash(this._workspace, branchName);

    const commitToUndo = this.findCommitToUndo(branchName);
    const revert = new RevertCommit<TState>(head, commitToUndo.hash);

    return this.commit(revert);
  }

  public canRedo(branchName = MAIN_BRANCH): boolean {
    return this.tryFindingCommitToRedo(branchName) !== undefined;
  }

  public redo(branchName = MAIN_BRANCH): WorkspaceManipulator<TState> {
    const commitToRedo = this.findCommitToRedo(branchName);

    const head = getHeadHash(this._workspace, branchName);
    const revert = new RevertCommit<TState>(head, commitToRedo.hash);

    return this.commit(revert);
  }

  private findCommitToUndo(branchName: string): Commit<TState> {
    const commitToUndo = this.tryFindingCommitToUndo(branchName);
    if (commitToUndo === undefined) {
      throw new Error('No commits to undo.');
    }

    return commitToUndo;
  }

  private tryFindingCommitToUndo(
    branchName: string
  ): Commit<TState> | undefined {
    const chain = getAllPrimaryPreviousCommits(
      this._workspace,
      getHeadHash(this._workspace, branchName)
    );

    return [...chain].find((c) => this.isUndoable(c, chain));
  }

  private isUndoable(
    c: Commit<TState>,
    chain: Iterable<Commit<TState>>
  ): boolean {
    if (c instanceof InitialCommit) {
      return false;
    } else {
      return !this.isUndo(c, chain);
    }
  }

  private findCommitToRedo(branchName: string): Commit<TState> {
    const commitToRedo = this.tryFindingCommitToRedo(branchName);

    if (commitToRedo === undefined) {
      throw new Error('No commits to redo.');
    }

    return commitToRedo;
  }

  private tryFindingCommitToRedo(
    branchName: string
  ): Commit<TState> | undefined {
    const chain = getAllPrimaryPreviousCommits(
      this._workspace,
      getHeadHash(this._workspace, branchName),
      (c) => !(c instanceof RevertCommit)
    );

    return [...chain].find(
      (c) => c instanceof RevertCommit && this.isUndo(c, chain)
    );
  }

  private isUndo(commit: Commit<TState>, chain: Iterable<Commit<TState>>) {
    const target = this.getTarget(commit);

    return this.isUndone(target, chain);
  }

  private getTarget(commit: Commit<TState>): Commit<TState> {
    if (commit instanceof RevertCommit) {
      const target = this._workspace.getCommit(commit.target);

      return this.getTarget(target);
    } else {
      return commit;
    }
  }

  private isUndone(
    target: Commit<TState>,
    commits: Iterable<Commit<TState>>
  ): boolean {
    const times = this.getTimesUndone(target, commits);

    return isOdd(times);
  }

  private getTimesUndone(
    target: Commit<TState>,
    commits: Iterable<Commit<TState>>,
    times = 0
  ): number {
    const revert = this.findRevert(target, commits);

    if (revert === undefined) {
      return times;
    } else {
      return this.getTimesUndone(revert, commits, times + 1);
    }
  }

  private findRevert(
    target: Commit<TState>,
    commits: Iterable<Commit<TState>>
  ): Commit<TState> | undefined {
    return [...commits].find((c) => this.undoes(c, target));
  }

  /**
   * Returns whether @param commit undoes @param target
   */
  private undoes(commit: Commit<TState>, target: Commit<TState>): boolean {
    if (commit instanceof RevertCommit) {
      return commit.target === target.hash;
    } else {
      return false;
    }
  }
}
