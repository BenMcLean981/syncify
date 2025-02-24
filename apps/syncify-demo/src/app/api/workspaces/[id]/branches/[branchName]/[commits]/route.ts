import { NextRequest, NextResponse } from "next/server";
import { CommitSnapshot, makeLocalBranch } from "@syncify/core";
import { getBranch, upsertBranch } from "@/utils/branches";
import { getCommit, hasCommit, upsertCommits } from "@/utils/commit";

type Props = {
  params: {
    id: string;
    branchName: string;
  };
};

export async function GET(
  request: NextRequest,
  props: Props,
): Promise<NextResponse> {
  const from = request.nextUrl.searchParams.get("from");

  if (!from) {
    throw new Error(`No from hash specified.`);
  }

  const commits = await getCommits(
    props.params.id,
    props.params.branchName,
    from,
  );

  return NextResponse.json({ commits });
}

async function getCommits(
  workspaceId: string,
  branchName: string,
  stopHash: string,
): Promise<ReadonlyArray<CommitSnapshot>> {
  if (!(await hasCommit(workspaceId, stopHash))) {
    return [];
  }

  const branch = await getBranch(workspaceId, branchName);

  if (branch === undefined) {
    throw new Error(
      `Branch with name "${branchName}" does not exist in workspace with id "${workspaceId}".`,
    );
  }

  return getAllPreviousCommits(workspaceId, branch.head, stopHash);
}

export async function PATCH(
  request: NextRequest,
  props: Props,
): Promise<NextResponse> {
  const body = (await request.json()) as {
    commits: ReadonlyArray<CommitSnapshot>;
    newHead: string;
  };

  const newBranch = makeLocalBranch(props.params.branchName, body.newHead);

  await validatePush(props.params.id, props.params.branchName, body.newHead);
  await upsertBranch(props.params.id, newBranch);
  await upsertCommits(props.params.id, body.commits);

  return new NextResponse("Patch successful.");
}

async function validatePush(
  workspaceId: string,
  branchName: string,
  newHead: string,
): Promise<void> {
  const toRoot = await getAllPreviousCommits(workspaceId, newHead);
  const branch = await getBranch(workspaceId, branchName);

  if (branch === undefined) {
    return;
  }

  const oldHead = branch.head;

  const isDescendent = toRoot.some((c) => c.hash === oldHead);

  if (!isDescendent) {
    throw new Error("Cannot push, local is missing commits from upstream.");
  }
}

async function getAllPreviousCommits(
  workspaceId: string,
  hash: string,
  stopHash?: string,
): Promise<ReadonlyArray<CommitSnapshot>> {
  const visited: Array<CommitSnapshot> = [];
  const toVisit = [hash];

  while (toVisit.length > 0) {
    const nextHash = toVisit.pop() as string;
    const commit = await getCommit(workspaceId, nextHash);

    [...commit.parents]
      .filter(
        (p) => !visited.some((other) => other.hash === p) && p !== stopHash,
      )
      .forEach((p) => {
        toVisit.push(p);
      });

    visited.push(commit);
  }

  return visited;
}
