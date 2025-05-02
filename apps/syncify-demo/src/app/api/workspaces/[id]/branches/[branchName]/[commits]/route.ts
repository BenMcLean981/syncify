import { getBranch, upsertBranch } from '@/utils/branches';
import { getCommit, hasCommit, upsertCommits } from '@/utils/commit';
import { CommitSnapshot, makeLocalBranch } from '@syncify/core';
import { NextRequest, NextResponse } from 'next/server';

type Params = {
  id: string;
  branchName: string;
};

type Props = {
  params: Promise<Params>;
};

export async function GET(
  request: NextRequest,
  props: Props
): Promise<NextResponse> {
  const params = await props.params;

  const from = request.nextUrl.searchParams.get('from');

  if (!from) {
    throw new Error(`No from hash specified.`);
  }

  const commits = await getCommits(params.id, params.branchName, from);

  return NextResponse.json({ commits });
}

async function getCommits(
  workspaceId: string,
  branchName: string,
  stopHash: string
): Promise<ReadonlyArray<CommitSnapshot>> {
  if (!(await hasCommit(workspaceId, stopHash))) {
    return [];
  }

  const branch = await getBranch(workspaceId, branchName);

  if (branch === undefined) {
    throw new Error(
      `Branch with name "${branchName}" does not exist in workspace with id "${workspaceId}".`
    );
  }

  return getAllPreviousCommits(workspaceId, branch.head, stopHash);
}

export async function PATCH(
  request: NextRequest,
  props: Props
): Promise<NextResponse> {
  const params = await props.params;

  const body = (await request.json()) as {
    commits: ReadonlyArray<CommitSnapshot>;
    newHead: string;
  };

  const newBranch = makeLocalBranch(params.branchName, body.newHead);

  await validatePush(params.id, params.branchName, body.newHead);
  await upsertBranch(params.id, newBranch);
  await upsertCommits(params.id, body.commits);

  return new NextResponse('Patch successful.');
}

async function validatePush(
  workspaceId: string,
  branchName: string,
  newHead: string
): Promise<void> {
  const toRoot = await getAllPreviousCommits(workspaceId, newHead);
  const branch = await getBranch(workspaceId, branchName);

  if (branch === undefined) {
    return;
  }

  const oldHead = branch.head;

  const isDescendent = toRoot.some((c) => c.hash === oldHead);

  if (!isDescendent) {
    throw new Error('Cannot push, local is missing commits from upstream.');
  }
}

async function getAllPreviousCommits(
  workspaceId: string,
  hash: string,
  stopHash?: string
): Promise<ReadonlyArray<CommitSnapshot>> {
  const visited: Array<CommitSnapshot> = [];
  const toVisit = [hash];

  while (toVisit.length > 0) {
    const nextHash = toVisit.pop() as string;
    const commit = await getCommit(workspaceId, nextHash);

    [...commit.parents]
      .filter(
        (p) => !visited.some((other) => other.hash === p) && p !== stopHash
      )
      .forEach((p) => {
        toVisit.push(p);
      });

    visited.push(commit);
  }

  return visited;
}
