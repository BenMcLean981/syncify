import { getBranch } from '@/utils/branches';
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

  const branch = getBranch(params.id, params.branchName);

  return NextResponse.json({ branch });
}
