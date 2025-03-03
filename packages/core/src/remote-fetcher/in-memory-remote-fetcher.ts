import { Branch, makeLocalBranch } from '../branches'
import {
  CommandRestorer,
  type Commit,
  CommitSnapshot,
  StateRestorer,
} from '../commit'
import { restoreCommit } from '../commit/utils'
import { type Memento } from '../memento'
import { InMemoryWorkspace, type Workspace } from '../workspace'
import { getAllPreviousCommitsHashes } from '../workspace/navigation'
import { type RemoteFetcher } from './remote-fetcher'

export class InMemoryRemoteFetcher<TState extends Memento>
  implements RemoteFetcher
{
  private _workspace: Workspace<TState>

  private readonly _commandRestorer: CommandRestorer<TState>

  private readonly _stateRestorer: StateRestorer<TState>

  public constructor(
    workspace: Workspace<TState> = InMemoryWorkspace.makeEmpty(),
    commandRestorer: CommandRestorer<TState>,
    stateRestorer: StateRestorer<TState>
  ) {
    this._workspace = workspace
    this._commandRestorer = commandRestorer
    this._stateRestorer = stateRestorer
  }

  public get workspace(): Workspace<TState> {
    return this._workspace
  }

  public async fetch(
    branchName: string,
    from: string
  ): Promise<ReadonlyArray<CommitSnapshot>> {
    if (!this._workspace.hasCommit(from)) {
      return []
    }

    const local = this._workspace.branches.getLocalBranch(branchName)
    const hashes = getAllPreviousCommitsHashes<TState>(
      this._workspace,
      local.head,
      (c) => c.hash === from
    )

    return [...hashes]
      .map((h) => this._workspace.getCommit(h))
      .map((c) => c.getSnapshot())
  }

  public async push(
    commitSnapshots: ReadonlyArray<CommitSnapshot>,
    branchName: string,
    newHead: string
  ): Promise<void> {
    const commits = commitSnapshots.map((c) =>
      restoreCommit(c, this._commandRestorer, this._stateRestorer)
    )

    this.validatePush(commits, branchName, newHead)

    const newBranches = this._workspace.branches.upsertBranch(
      makeLocalBranch(branchName, newHead)
    )

    this._workspace = this._workspace
      .addCommits(commits)
      .setBranches(newBranches)
  }

  public async getBranch(branchName: string): Promise<Branch | undefined> {
    if (!this._workspace.branches.containsLocalBranch(branchName)) {
      return undefined
    } else {
      return this._workspace.branches.getLocalBranch(branchName)
    }
  }

  private validatePush(
    commits: ReadonlyArray<Commit<TState>>,
    branchName: string,
    newHead: string
  ) {
    const withAddition = this._workspace.addCommits(commits)
    const toRoot = getAllPreviousCommitsHashes(withAddition, newHead)

    const hasBranch = this._workspace.branches.containsLocalBranch(branchName)

    if (!hasBranch) {
      return
    }

    const oldHead = this._workspace.branches.getLocalBranch(branchName).head

    const isDescendent = toRoot.has(oldHead)

    if (!isDescendent) {
      throw new Error('Cannot push, local is missing commits from upstream.')
    }
  }
}
