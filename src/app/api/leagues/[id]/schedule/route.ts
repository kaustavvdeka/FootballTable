export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leagueId } = await context.params;

    const body = await request.json().catch(() => ({}));
    const stage = body.stage || "League Stage";

    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      include: { teams: true, matches: true },
    });

    if (!league) {
      return NextResponse.json(
        { error: "League not found" },
        { status: 404 }
      );
    }

    if (league.teams.length < 2) {
      return NextResponse.json(
        { error: "Not enough teams to schedule matches" },
        { status: 400 }
      );
    }

    if (league.matches.length > 0) {
      return NextResponse.json(
        { error: "Schedule already generated" },
        { status: 400 }
      );
    }

    const groups: { [key: string]: typeof league.teams } = {};
    league.teams.forEach((team) => {
      const groupName = team.group || "Default";
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(team);
    });

    const matchesToCreate = [];

    for (const groupName in groups) {
      const groupTeams = groups[groupName];
      for (let i = 0; i < groupTeams.length; i++) {
        for (let j = i + 1; j < groupTeams.length; j++) {
          matchesToCreate.push({
            leagueId,
            homeTeamId: groupTeams[i].id,
            awayTeamId: groupTeams[j].id,
            stage,
            status: "PENDING",
            homeGoals: null,
            awayGoals: null,
          });
        }
      }
    }

    if (matchesToCreate.length > 0) {
      await prisma.match.createMany({
        data: matchesToCreate,
      });
    }

    return NextResponse.json({ message: "Schedule generated successfully", matchCount: matchesToCreate.length });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate schedule" },
      { status: 500 }
    );
  }
}