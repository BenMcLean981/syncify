import { NextRequest, NextResponse } from 'next/server';
import { DiskStorageSystem } from '../../disk-storage-system';

type Params = {
  id: string;
  commitId: string;
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

  const commit = storageSystem.commits.get(params.commitId);

  return NextResponse.json({ commit });
}

export async function DELETE(
  request: NextRequest,
  props: Props
): Promise<NextResponse> {
  const params = await props.params;

  const storageSystem = new DiskStorageSystem(params.id);

  await storageSystem.commits.delete(params.commitId);

  return NextResponse.json({ success: true });
}
