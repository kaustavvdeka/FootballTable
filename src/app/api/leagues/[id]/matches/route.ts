import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: leagueId } = await params;
        const body = await request.json();
        const { homeTeamId, awayTeamId, stage } = body;

        if (!homeTeamId || !awayTeamId) {
            return NextResponse.json({ error: 'homeTeamId and awayTeamId are required' }, { status: 400 });
        }

        const match = await prisma.match.create({
            data: {
                leagueId,
                homeTeamId,
                awayTeamId,
                stage: stage || 'League Stage',
                status: 'PENDING'
            } as any
        });

        return NextResponse.json(match, { status: 201 });
    } catch (_) {
        return NextResponse.json({ error: 'Failed to create match' }, { status: 500 });
    }
}
