import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAdmin } from '@/lib/auth-checks';

// Convert Bengali numerals to English numerals
function bengaliToEnglish(str: string): string {
    const bengaliNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    let result = str;
    bengaliNumerals.forEach((bn, index) => {
        result = result.replace(new RegExp(bn, 'g'), String(index));
    });
    return result;
}

function parseDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    // Convert Bengali numerals to English
    const englishDate = bengaliToEnglish(dateStr);
    const parts = englishDate.split('/');
    if (parts.length === 3) {
        const [day, month, year] = parts;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    return null;
}

export async function POST(request: NextRequest) {
    if (!await checkAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const body = await request.json();

        // Check if it's the new flat array format or legacy format
        const isNewFormat = Array.isArray(body);

        if (!isNewFormat) {
            // Legacy format with administrative_metadata and voter_records
            const { administrative_metadata, voter_records } = body;

            if (!administrative_metadata || !voter_records) {
                return NextResponse.json(
                    { success: false, error: 'Invalid JSON format. Expected array of voters or {administrative_metadata, voter_records}.' },
                    { status: 400 }
                );
            }

            // Handle legacy format (existing code)
            let areaCreated = false;
            let votersCreated = 0;
            let votersSkipped = 0;

            const existingArea = await prisma.voterArea.findUnique({
                where: { voter_area_code: administrative_metadata.voter_area_code },
            });

            if (!existingArea) {
                await prisma.voterArea.create({
                    data: {
                        district: administrative_metadata.district,
                        upazila_thana: administrative_metadata.upazila_thana,
                        union_paurashava: administrative_metadata.union_paurashava,
                        ward_number: administrative_metadata.ward_number,
                        voter_area_name: administrative_metadata.voter_area_name,
                        voter_area_code: administrative_metadata.voter_area_code,
                        post_office: administrative_metadata.post_office || '',
                        post_code: administrative_metadata.post_code || '',
                        total_voters: administrative_metadata.total_voters || 0,
                        total_male_voters: administrative_metadata.total_male_voters || 0,
                        publication_date: administrative_metadata.publication_date
                            ? parseDate(administrative_metadata.publication_date)
                            : null,
                    },
                });
                areaCreated = true;
            }

            for (const record of voter_records) {
                if (record.status === 'Deleted' || !record.name) {
                    votersSkipped++;
                    continue;
                }

                try {
                    const existingVoter = await prisma.voter.findFirst({
                        where: { voter_id: record.voter_id },
                    });

                    let isDuplicate = false;
                    if (existingVoter) {
                        const nameMatch = existingVoter.name.trim().toLowerCase() === record.name.trim().toLowerCase();
                        const fatherMatch = existingVoter.father.trim().toLowerCase() === (record.father || 'N/A').trim().toLowerCase();

                        if (nameMatch && fatherMatch) {
                            isDuplicate = true;
                        }
                    }

                    if (!isDuplicate) {
                        await prisma.voter.create({
                            data: {
                                sl_no: record.sl_no,
                                name: record.name,
                                voter_id: record.voter_id,
                                father: record.father || 'N/A',
                                mother: record.mother || 'N/A',
                                occupation: record.occupation || 'N/A',
                                dob: record.dob ? parseDate(record.dob) : null,
                                address: record.address || 'N/A',
                                voter_area_code: administrative_metadata.voter_area_code,
                                status: record.status || 'Active',
                            },
                        });
                        votersCreated++;
                    } else {
                        votersSkipped++;
                    }
                } catch (err) {
                    votersSkipped++;
                }
            }

            return NextResponse.json({
                success: true,
                message: 'Import completed',
                data: {
                    areaCreated,
                    votersCreated,
                    votersSkipped,
                    totalProcessed: voter_records.length,
                },
            });
        }

        // New flat array format
        const voters = body as Array<{
            serial_no: string;
            name: string;
            voter_id: string;
            father_name: string;
            mother_name: string;
            occupation: string;
            date_of_birth: string;
            address: string;
            district: string;
            upazila: string;
            union: string;
            ward_number: string;
            voter_area: string;
            voter_area_code: string;
        }>;

        if (voters.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Empty voter array provided.' },
                { status: 400 }
            );
        }

        let areasCreated = 0;
        let votersCreated = 0;
        let votersSkipped = 0;
        const processedAreas = new Set<string>();
        const skippedRecords: any[] = [];

        for (const voter of voters) {
            // Convert Bengali voter_area_code to English
            const areaCode = bengaliToEnglish(voter.voter_area_code);
            const voterId = bengaliToEnglish(voter.voter_id);
            const serialNo = bengaliToEnglish(voter.serial_no);
            const wardNumber = bengaliToEnglish(voter.ward_number);

            // Create voter area if not exists and not already processed
            if (!processedAreas.has(areaCode)) {
                const existingArea = await prisma.voterArea.findUnique({
                    where: { voter_area_code: areaCode },
                });

                if (!existingArea) {
                    await prisma.voterArea.create({
                        data: {
                            district: voter.district,
                            upazila_thana: voter.upazila,
                            union_paurashava: voter.union,
                            ward_number: wardNumber,
                            voter_area_name: voter.voter_area,
                            voter_area_code: areaCode,
                            post_office: voter.union,
                            post_code: '0000',
                            total_voters: 0,
                            total_male_voters: 0,
                        },
                    });
                    areasCreated++;
                }
                processedAreas.add(areaCode);
            }

            // Create voter if not exists
            try {
                // Since voter_id is no longer unique in schema, use findFirst
                // We check if there's any record with this ID that matches CRITICAL details
                const existingVoter = await prisma.voter.findFirst({
                    where: {
                        voter_id: voterId,
                    }
                });

                let isDuplicate = false;
                if (existingVoter) {
                    // Strict check: ID matched. Now check Name and Father Name.
                    // If everything matches, it's a true duplicate -> SKIP
                    // If names differ, we ALLOW it (treat as new entry or correction)
                    const nameMatch = existingVoter.name.trim().toLowerCase() === voter.name.trim().toLowerCase();
                    const fatherMatch = existingVoter.father.trim().toLowerCase() === (voter.father_name || 'N/A').trim().toLowerCase();

                    if (nameMatch && fatherMatch) {
                        isDuplicate = true;
                    }
                }

                if (!isDuplicate) {
                    await prisma.voter.create({
                        data: {
                            sl_no: serialNo,
                            name: voter.name,
                            voter_id: voterId,
                            father: voter.father_name || 'N/A',
                            mother: voter.mother_name || 'N/A',
                            occupation: voter.occupation || 'N/A',
                            dob: parseDate(voter.date_of_birth),
                            address: voter.address || 'N/A',
                            voter_area_code: areaCode,
                            status: 'Active',
                        },
                    });
                    votersCreated++;
                } else {
                    votersSkipped++;
                    skippedRecords.push({ ...voter, reason: 'Duplicate Record (ID+Name+Father)' });
                }
            } catch (err: any) {
                console.error('Record creation error:', err);
                votersSkipped++;
                skippedRecords.push({ ...voter, reason: err.message || 'Database error' });
            }
        }

        // Update total_voters count for each area
        for (const areaCode of processedAreas) {
            const voterCount = await prisma.voter.count({
                where: { voter_area_code: areaCode, status: { not: 'Deleted' } },
            });
            await prisma.voterArea.update({
                where: { voter_area_code: areaCode },
                data: { total_voters: voterCount },
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Import completed',
            data: {
                areaCreated: areasCreated > 0,
                areasCreated,
                votersCreated,
                votersSkipped,
                skippedRecords,
                totalProcessed: voters.length,
            },
        });
    } catch (error: any) {
        console.error('Import error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to import data' },
            { status: 500 }
        );
    }
}
