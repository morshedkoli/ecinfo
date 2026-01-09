import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type Params = Promise<{ id: string }>;

export async function GET(request: NextRequest, { params }: { params: Params }) {
    try {
        const { id } = await params;

        const voter = await prisma.voter.findUnique({
            where: { id },
        });

        if (!voter) {
            return NextResponse.json(
                { success: false, error: 'Voter not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: voter });
    } catch (error) {
        console.error('Error fetching voter:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch voter' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest, { params }: { params: Params }) {
    try {
        const { id } = await params;
        const body = await request.json();

        const voter = await prisma.voter.update({
            where: { id },
            data: {
                ...(body.sl_no && { sl_no: body.sl_no }),
                ...(body.name && { name: body.name }),
                ...(body.voter_id && { voter_id: body.voter_id }),
                ...(body.father && { father: body.father }),
                ...(body.mother && { mother: body.mother }),
                ...(body.occupation && { occupation: body.occupation }),
                ...(body.dob && { dob: new Date(body.dob) }),
                ...(body.address && { address: body.address }),
                ...(body.voter_area_code && { voter_area_code: body.voter_area_code }),
                ...(body.status && { status: body.status }),
            },
        });

        return NextResponse.json({ success: true, data: voter });
    } catch (error: any) {
        console.error('Error updating voter:', error);

        if (error.code === 'P2025') {
            return NextResponse.json(
                { success: false, error: 'Voter not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Failed to update voter' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Params }) {
    try {
        const { id } = await params;

        // Soft delete - set status to "Deleted"
        const voter = await prisma.voter.update({
            where: { id },
            data: { status: 'Deleted' },
        });

        return NextResponse.json({ success: true, message: 'Voter deleted' });
    } catch (error: any) {
        console.error('Error deleting voter:', error);

        if (error.code === 'P2025') {
            return NextResponse.json(
                { success: false, error: 'Voter not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Failed to delete voter' },
            { status: 500 }
        );
    }
}
