import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.team.delete({ where: { id } });
        return NextResponse.json({ message: 'Team deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete team' }, { status: 500 });
    }
}
