import { NextRequest, NextResponse } from "next/server";
import { getBranch, getBranches } from "@/utils/branches";

type GetProps = {
  params: {
    id: string;
    branchName: string;
  };
};

export async function GET(
  request: NextRequest,
  props: GetProps,
): Promise<NextResponse> {
  const branch = getBranch(props.params.id, props.params.branchName);

  return NextResponse.json({ branch });
}
