import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, leagueId, group } = body;

        if (!name || !leagueId) {
            return NextResponse.json({ error: 'Name and leagueId are required' }, { status: 400 });
        }

        console.log('Creating team with data:', { name, leagueId, group });
        const team = await prisma.team.create({
            data: { name, leagueId, group } as any,
        });

        return NextResponse.json(team, { status: 201 });
    } catch (error: any) {
        console.error('Error creating team:', error);
        return NextResponse.json({
            error: 'Failed to create team',
            details: error.message || String(error)
        }, { status: 500 });
    }
}
