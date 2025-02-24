import type { Workspace } from "./workspace";
import { MAIN_BRANCH } from "../branches";
import type { Commit } from "../commit";

export function getHead<TState>(
  workspace: Workspace<TState>,
  branchName = MAIN_BRANCH
): Commit<TState> {
  return workspace.getCommit(getHeadHash(workspace, branchName));
}

export function getHeadHash(
  workspace: Workspace<unknown>,
  branchName = MAIN_BRANCH
) {
  return workspace.branches.getLocalBranch(branchName).head;
}

export function getHeadState<TState>(
  workspace: Workspace<TState>,
  branchName = MAIN_BRANCH
): TState {
  const headHash = getHeadHash(workspace, branchName);

  return workspace.getState(headHash);
}