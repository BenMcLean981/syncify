import { getCommitFileName } from "./directories";
import fs from "node:fs";
import { CommitSnapshot } from "@syncify/core";

export async function hasCommit(
  workspaceId: string,
  hash: string,
): Promise<boolean> {
  const fileName = getCommitFileName(workspaceId, hash);

  return fs.existsSync(fileName);
}

export async function getCommit(
  workspaceId: string,
  hash: string,
): Promise<CommitSnapshot> {
  const fileName = getCommitFileName(workspaceId, hash);
  const contents = fs.readFileSync(fileName, "utf8");

  return JSON.parse(contents) as CommitSnapshot;
}

export async function upsertCommits(
  workspaceId: string,
  commits: Iterable<CommitSnapshot>,
): Promise<void> {
  const promises = [...commits].map((c) => upsertCommit(workspaceId, c));

  await Promise.all(promises);
}

export async function upsertCommit(
  workspaceId: string,
  commit: CommitSnapshot,
): Promise<void> {
  const fileName = getCommitFileName(workspaceId, commit.hash);
  const newContents = JSON.stringify(commit);

  fs.writeFileSync(fileName, newContents);
}
