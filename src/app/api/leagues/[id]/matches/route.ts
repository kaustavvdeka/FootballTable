export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leagueId } = await context.params;

    const league = await prisma.league.findUnique({
      where: { id: leagueId },
    });

    if (!league) {
      return NextResponse.json({ error: "League not found" }, { status: 404 });
    }

    await prisma.match.deleteMany({
      where: { leagueId },
    });

    return NextResponse.json({ message: "All matches cleared" });
  } catch {
    return NextResponse.json(
      { error: "Failed to clear schedule" },
      { status: 500 }
    );
  }
}