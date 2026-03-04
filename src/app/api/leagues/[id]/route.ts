import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const league = await prisma.league.findUnique({
            where: { id },
            include: {
                teams: true,
                matches: {
                    include: { homeTeam: true, awayTeam: true },
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!league) {
            return NextResponse.json({ error: 'League not found' }, { status: 404 });
        }

        return NextResponse.json(league);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch league details' }, { status: 500 });
    }
}
