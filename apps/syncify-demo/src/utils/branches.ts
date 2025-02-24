import { LocalBranch } from "@syncify/core";
import fs from "node:fs";
import { getBranchesIndexFile } from "./directories";

export async function getBranch(
  workspaceId: string,
  branchName: string,
): Promise<LocalBranch | undefined> {
  const branches = await getBranches(workspaceId);

  return branches.find((b) => b.name === branchName);
}

export async function getBranches(
  id: string,
): Promise<ReadonlyArray<LocalBranch>> {
  const json = getCurrentIndexContents(id);

  return json.branches;
}

export async function upsertBranch(
  workspaceId: string,
  branch: LocalBranch,
): Promise<void> {
  const contents = getCurrentIndexContents(workspaceId);

  const otherBranches = contents.branches.filter((b) => b.name !== branch.name);
  contents.branches = [...otherBranches, branch];

  writeNewIndexFile(workspaceId, contents);
}

function getCurrentIndexContents(workspaceId: string) {
  const fileContents = fs.readFileSync(
    getBranchesIndexFile(workspaceId),
    "utf-8",
  );

  return JSON.parse(fileContents) as IndexFileContents;
}

function writeNewIndexFile(workspaceId: string, index: IndexFileContents) {
  fs.writeFileSync(
    getBranchesIndexFile(workspaceId),
    JSON.stringify(index, null, 2),
  );
}

type IndexFileContents = {
  branches: ReadonlyArray<LocalBranch>;
};
