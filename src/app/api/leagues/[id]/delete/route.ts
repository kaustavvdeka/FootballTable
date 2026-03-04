import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = "force-dynamic";

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        await prisma.league.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'League deleted' });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to delete league' },
            { status: 500 }
        );
    }
}