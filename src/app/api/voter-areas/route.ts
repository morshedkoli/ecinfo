import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAuth } from '@/lib/auth-checks';

export async function GET(request: NextRequest) {
    if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';

        const skip = (page - 1) * limit;

        const where = search
            ? {
                OR: [
                    { district: { contains: search, mode: 'insensitive' as const } },
                    { upazila_thana: { contains: search, mode: 'insensitive' as const } },
                    { voter_area_name: { contains: search, mode: 'insensitive' as const } },
                    { voter_area_code: { contains: search, mode: 'insensitive' as const } },
                ],
            }
            : {};

        const [areas, total] = await Promise.all([
            prisma.voterArea.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.voterArea.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            data: areas,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching voter areas:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch voter areas' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const body = await request.json();
        const area = await prisma.voterArea.create({
            data: {
                district: body.district,
                upazila_thana: body.upazila_thana,
                union_paurashava: body.union_paurashava,
                ward_number: body.ward_number,
                voter_area_name: body.voter_area_name,
                voter_area_code: body.voter_area_code,
                post_office: body.post_office,
                post_code: body.post_code,
                total_voters: body.total_voters || 0,
                total_male_voters: body.total_male_voters || 0,
                publication_date: body.publication_date ? new Date(body.publication_date) : null,
            },
        });

        return NextResponse.json({ success: true, data: area }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating voter area:', error);

        if (error.code === 'P2002') {
            return NextResponse.json(
                { success: false, error: 'Voter area code already exists' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Failed to create voter area' },
            { status: 500 }
        );
    }
}
