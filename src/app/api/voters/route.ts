import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAuth, checkAdmin } from '@/lib/auth-checks';

export async function GET(request: NextRequest) {
    if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';
        const occupation = searchParams.get('occupation') || '';
        const areaCode = searchParams.get('area_code') || '';
        const status = searchParams.get('status') || '';
        const minAge = searchParams.get('minAge') || '';
        const maxAge = searchParams.get('maxAge') || '';

        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { voter_id: { contains: search, mode: 'insensitive' } },
                { address: { contains: search, mode: 'insensitive' } },
                { father: { contains: search, mode: 'insensitive' } },
                { mother: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (occupation) {
            where.occupation = { contains: occupation, mode: 'insensitive' };
        }

        if (areaCode) {
            where.voter_area_code = areaCode;
        }

        if (status) {
            where.status = status;
        } else {
            // By default, exclude deleted voters
            where.status = { not: 'Deleted' };
        }

        // Age range filtering
        if (minAge || maxAge) {
            const now = new Date();
            const dobConditions: any = {};

            if (maxAge) {
                // Maximum age means minimum date of birth
                const minDob = new Date(now.getFullYear() - parseInt(maxAge), now.getMonth(), now.getDate());
                dobConditions.gte = minDob;
            }

            if (minAge) {
                // Minimum age means maximum date of birth
                const maxDob = new Date(now.getFullYear() - parseInt(minAge), now.getMonth(), now.getDate());
                dobConditions.lte = maxDob;
            }

            where.dob = dobConditions;
        }

        const [voters, total] = await Promise.all([
            prisma.voter.findMany({
                where,
                skip,
                take: limit,
                orderBy: { sl_no: 'asc' },
            }),
            prisma.voter.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            data: voters,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching voters:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch voters' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const body = await request.json();
        const voter = await prisma.voter.create({
            data: {
                sl_no: body.sl_no,
                name: body.name,
                voter_id: body.voter_id,
                father: body.father,
                mother: body.mother,
                occupation: body.occupation || 'N/A',
                dob: body.dob ? new Date(body.dob) : null,
                address: body.address,
                voter_area_code: body.voter_area_code,
                status: body.status || 'Active',
            },
        });

        return NextResponse.json({ success: true, data: voter }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating voter:', error);

        if (error.code === 'P2002') {
            return NextResponse.json(
                { success: false, error: 'Voter ID already exists' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Failed to create voter' },
            { status: 500 }
        );
    }
}
