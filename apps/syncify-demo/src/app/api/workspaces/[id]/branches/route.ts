import { StoredLocalBranch } from '@syncify/core';
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

  const branches = storageSystem.localBranches.getAll();

  return NextResponse.json({ branches });
}

// ADD
export async function POST(
  request: NextRequest,
  props: Props
): Promise<NextResponse> {
  const params = await props.params;

  const storedLocalBranch = (await request.json()) as StoredLocalBranch;

  const storageSystem = new DiskStorageSystem(params.id);

  await storageSystem.localBranches.add(storedLocalBranch);

  return NextResponse.json({ success: true });
}

// UPDATE
export async function PATCH(
  request: NextRequest,
  props: Props
): Promise<NextResponse> {
  const params = await props.params;

  const storedLocalBranch = (await request.json()) as StoredLocalBranch;

  const storageSystem = new DiskStorageSystem(params.id);

  await storageSystem.localBranches.update(storedLocalBranch);

  return NextResponse.json({ success: true });
}
