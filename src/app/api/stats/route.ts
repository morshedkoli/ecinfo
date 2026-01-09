import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        // Get total voters (excluding deleted)
        const totalVoters = await prisma.voter.count({
            where: { status: { not: 'Deleted' } },
        });

        const deletedVoters = await prisma.voter.count({
            where: { status: 'Deleted' },
        });

        // Get total voter areas
        const totalAreas = await prisma.voterArea.count();

        // Get occupation distribution using groupBy
        const occupationStats = await prisma.voter.groupBy({
            by: ['occupation'],
            where: { status: { not: 'Deleted' } },
            _count: { occupation: true },
            orderBy: { _count: { occupation: 'desc' } },
            take: 10,
        });

        // Get voters by area using groupBy
        const areaStats = await prisma.voter.groupBy({
            by: ['voter_area_code'],
            where: { status: { not: 'Deleted' } },
            _count: { voter_area_code: true },
            orderBy: { _count: { voter_area_code: 'desc' } },
            take: 10,
        });

        // Get age distribution - using raw query for MongoDB aggregation
        const currentYear = new Date().getFullYear();

        // Get voters with DOB to calculate age distribution
        const votersWithDob = await prisma.voter.findMany({
            where: {
                status: { not: 'Deleted' },
                dob: { not: null },
            },
            select: { dob: true },
        });

        // Calculate age buckets manually
        const ageBuckets: { [key: string]: number } = {
            '18-29': 0,
            '30-39': 0,
            '40-49': 0,
            '50-59': 0,
            '60-69': 0,
            '70-79': 0,
            '80+': 0,
        };

        votersWithDob.forEach((voter) => {
            if (voter.dob) {
                const age = currentYear - voter.dob.getFullYear();
                if (age >= 18 && age < 30) ageBuckets['18-29']++;
                else if (age >= 30 && age < 40) ageBuckets['30-39']++;
                else if (age >= 40 && age < 50) ageBuckets['40-49']++;
                else if (age >= 50 && age < 60) ageBuckets['50-59']++;
                else if (age >= 60 && age < 70) ageBuckets['60-69']++;
                else if (age >= 70 && age < 80) ageBuckets['70-79']++;
                else if (age >= 80) ageBuckets['80+']++;
            }
        });

        const ageStats = Object.entries(ageBuckets).map(([ageGroup, count]) => ({
            ageGroup,
            count,
        }));

        // Get recent voters added
        const recentVoters = await prisma.voter.findMany({
            where: { status: { not: 'Deleted' } },
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
                id: true,
                name: true,
                voter_id: true,
                occupation: true,
                createdAt: true,
            },
        });

        return NextResponse.json({
            success: true,
            data: {
                totalVoters,
                deletedVoters,
                totalAreas,
                occupationStats: occupationStats.map((item) => ({
                    occupation: item.occupation || 'N/A',
                    count: item._count.occupation,
                })),
                areaStats: areaStats.map((item) => ({
                    area_code: item.voter_area_code,
                    count: item._count.voter_area_code,
                })),
                ageStats,
                recentVoters,
            },
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch statistics' },
            { status: 500 }
        );
    }
}
