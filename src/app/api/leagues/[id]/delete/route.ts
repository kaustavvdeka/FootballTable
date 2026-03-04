import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export const dynamic = "force-dynamic";
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.league.delete({ where: { id } });
        return NextResponse.json({ message: 'League deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete league' }, { status: 500 });
    }
}
