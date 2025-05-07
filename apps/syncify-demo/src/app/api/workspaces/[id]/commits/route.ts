import { StoredCommitSnapshot } from '@syncify/core';
import { NextRequest, NextResponse } from 'next/server';
import { DiskStorageSystem } from '../disk-storage-system';

type Params = {
  id: string;
};

type Props = {
  params: Promise<Params>;
};

export async function GET(
  request: NextRequest,
  props: Props
): Promise<NextResponse> {
  const params = await props.params;

  const storageSystem = new DiskStorageSystem(params.id);

  const branches = storageSystem.commits.getAll();

  return NextResponse.json({ branches });
}

// ADD
export async function POST(
  request: NextRequest,
  props: Props
): Promise<NextResponse> {
  const params = await props.params;

  const data = (await request.json()) as { commit: StoredCommitSnapshot };

  const storageSystem = new DiskStorageSystem(params.id);

  await storageSystem.commits.add(data.commit);

  return NextResponse.json({ success: true });
}

// UPDATE
export async function PATCH(
  request: NextRequest,
  props: Props
): Promise<NextResponse> {
  const params = await props.params;

  const data = (await request.json()) as { commit: StoredCommitSnapshot };

  const storageSystem = new DiskStorageSystem(params.id);

  await storageSystem.commits.update(data.commit);

  return NextResponse.json({ success: true });
}
