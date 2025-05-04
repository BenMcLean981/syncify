import { NextRequest, NextResponse } from 'next/server';
import { DiskStorageSystem } from '../../disk-storage-system';

type Params = {
  id: string;
  branchId: string;
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

  const branch = storageSystem.localBranches.get(params.branchId);

  return NextResponse.json({ branch });
}

export async function DELETE(
  request: NextRequest,
  props: Props
): Promise<NextResponse> {
  const params = await props.params;

  const storageSystem = new DiskStorageSystem(params.id);

  await storageSystem.localBranches.delete(params.branchId);

  return NextResponse.json({ success: true });
}
