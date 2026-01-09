import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type Params = Promise<{ code: string }>;

export async function GET(request: NextRequest, { params }: { params: Params }) {
    try {
        const { code } = await params;

        const area = await prisma.voterArea.findUnique({
            where: { voter_area_code: code },
        });

        if (!area) {
            return NextResponse.json(
                { success: false, error: 'Voter area not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: area });
    } catch (error) {
        console.error('Error fetching voter area:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch voter area' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest, { params }: { params: Params }) {
    try {
        const { code } = await params;
        const body = await request.json();

        const area = await prisma.voterArea.update({
            where: { voter_area_code: code },
            data: {
                ...(body.district && { district: body.district }),
                ...(body.upazila_thana && { upazila_thana: body.upazila_thana }),
                ...(body.union_paurashava && { union_paurashava: body.union_paurashava }),
                ...(body.ward_number && { ward_number: body.ward_number }),
                ...(body.voter_area_name && { voter_area_name: body.voter_area_name }),
                ...(body.post_office && { post_office: body.post_office }),
                ...(body.post_code && { post_code: body.post_code }),
                ...(body.total_voters !== undefined && { total_voters: body.total_voters }),
                ...(body.total_male_voters !== undefined && { total_male_voters: body.total_male_voters }),
                ...(body.publication_date && { publication_date: new Date(body.publication_date) }),
            },
        });

        return NextResponse.json({ success: true, data: area });
    } catch (error: any) {
        console.error('Error updating voter area:', error);

        if (error.code === 'P2025') {
            return NextResponse.json(
                { success: false, error: 'Voter area not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Failed to update voter area' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Params }) {
    try {
        const { code } = await params;

        await prisma.voterArea.delete({
            where: { voter_area_code: code },
        });

        return NextResponse.json({ success: true, message: 'Voter area deleted' });
    } catch (error: any) {
        console.error('Error deleting voter area:', error);

        if (error.code === 'P2025') {
            return NextResponse.json(
                { success: false, error: 'Voter area not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Failed to delete voter area' },
            { status: 500 }
        );
    }
}
