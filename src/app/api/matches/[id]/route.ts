import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { homeGoals, awayGoals } = body;

        if (homeGoals === undefined || awayGoals === undefined) {
            return NextResponse.json({ error: 'homeGoals and awayGoals are required' }, { status: 400 });
        }

        const match = await prisma.match.update({
            where: { id },
            data: {
                homeGoals: parseInt(homeGoals.toString()),
                awayGoals: parseInt(awayGoals.toString()),
                status: 'FINISHED'
            }
        });

        return NextResponse.json(match);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update match result' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const match = await prisma.match.update({
            where: { id },
            data: { homeGoals: null, awayGoals: null, status: 'PENDING' }
        });
        return NextResponse.json(match);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to reset match result' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.match.delete({ where: { id } });
        return NextResponse.json({ message: 'Match deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete match' }, { status: 500 });
    }
}
