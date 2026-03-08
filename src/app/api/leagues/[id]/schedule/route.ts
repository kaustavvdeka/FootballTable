export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: leagueId } = await params;
        const body = await request.json().catch(() => ({}));
        const stage = body.stage || 'League Stage';
        console.log(`Generating schedule for league: ${leagueId}, stage: ${stage}`);

        const league = await prisma.league.findUnique({
            where: { id: leagueId },
            include: { teams: true, matches: true }
        });

        if (!league) {
            return NextResponse.json({ error: 'League not found' }, { status: 404 });
        }

        if (league.teams.length < 2) {
            return NextResponse.json({ error: 'Not enough teams to schedule matches' }, { status: 400 });
        }

        if (league.matches.length > 0) {
            return NextResponse.json({ error: 'Schedule already generated' }, { status: 400 });
        }

        const teams: any[] = league.teams;
        const matchesToCreate = [];

        if (stage === 'Group Stage') {
            // Group teams by their pre-assigned groups (e.g. A, B, C)
            const groups: Record<string, typeof teams> = {};
            teams.forEach(t => {
                if (t.group) {
                    const groupName = `Group ${t.group}`;
                    if (!groups[groupName]) groups[groupName] = [];
                    groups[groupName].push(t);
                }
            });

            // Double round-robin within each group
            for (const groupName in groups) {
                const groupTeams = groups[groupName];
                for (let i = 0; i < groupTeams.length; i++) {
                    for (let j = i + 1; j < groupTeams.length; j++) {
                        matchesToCreate.push({ leagueId, homeTeamId: groupTeams[i].id, awayTeamId: groupTeams[j].id, status: 'PENDING', stage: 'Group Stage' });
                        matchesToCreate.push({ leagueId, homeTeamId: groupTeams[j].id, awayTeamId: groupTeams[i].id, status: 'PENDING', stage: 'Group Stage' });
                    }
                }
            }
        } else {
            // League Stage - Double round-robin for all teams
            for (let i = 0; i < teams.length; i++) {
                for (let j = i + 1; j < teams.length; j++) {
                    matchesToCreate.push({ leagueId, homeTeamId: teams[i].id, awayTeamId: teams[j].id, status: 'PENDING', stage });
                    matchesToCreate.push({ leagueId, homeTeamId: teams[j].id, awayTeamId: teams[i].id, status: 'PENDING', stage });
                }
            }
        }

        console.log(`Creating ${matchesToCreate.length} matches`);
        if (matchesToCreate.length === 0) {
            return NextResponse.json({ error: 'No matches to create. Ensure teams are assigned to groups for Group Stage.' }, { status: 400 });
        }

        await prisma.match.createMany({
            data: matchesToCreate
        });

        return NextResponse.json({ message: 'Schedule generated successfully' });
    } catch (error) {
        console.error('Error generating schedule:', error);
        return NextResponse.json({ error: 'Failed to generate schedule' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: leagueId } = await params;
        const league = await prisma.league.findUnique({ where: { id: leagueId } });
        if (!league) {
            return NextResponse.json({ error: 'League not found' }, { status: 404 });
        }
        await prisma.match.deleteMany({ where: { leagueId } });
        return NextResponse.json({ message: 'All matches cleared' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to clear schedule' }, { status: 500 });
    }
}
