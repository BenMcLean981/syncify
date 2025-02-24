import path from "node:path";
import envPaths from "env-paths";

const paths = envPaths("syncify-demo", { suffix: "" });

export function getWorkspaceDirectory(id: string): string {
  return path.join(paths.data, "workspaces", id);
}

export function getBranchesDirectory(id: string): string {
  return path.join(getWorkspaceDirectory(id), "branches");
}

export function getBranchesIndexFile(id: string): string {
  return path.join(getBranchesDirectory(id), "index.json");
}

export function getBranchDirectory(id: string, branchName: string): string {
  return path.join(getBranchesDirectory(id), branchName);
}

export function getCommitsDirectory(id: string): string {
  return path.join(getWorkspaceDirectory(id), "commits");
}

export function getCommitFileName(id: string, commitHash: string): string {
  return path.join(getCommitsDirectory(id), `${commitHash}.json`);
}
