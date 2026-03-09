export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const leagues = await prisma.league.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(leagues);
  } catch (error) {
    console.error("GET /api/leagues error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leagues" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const league = await prisma.league.create({
      data: { name },
    });

    return NextResponse.json(league, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create league" },
      { status: 500 }
    );
  }
}