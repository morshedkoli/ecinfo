import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixOccupationName() {
    try {
        console.log('Starting occupation name fix...');

        // First, check how many records need to be updated
        const count = await prisma.voter.count({
            where: {
                occupation: 'গৃিহনী'
            }
        });

        console.log(`Found ${count} records with incorrect occupation name "গৃিহনী"`);

        if (count === 0) {
            console.log('No records to update.');
            return;
        }

        // Update all records
        const result = await prisma.voter.updateMany({
            where: {
                occupation: 'গৃিহনী'
            },
            data: {
                occupation: 'গৃহিনী'
            }
        });

        console.log(`✅ Successfully updated ${result.count} records`);
        console.log('Occupation name changed from "গৃিহনী" to "গৃহিনী"');

    } catch (error) {
        console.error('Error fixing occupation name:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

fixOccupationName()
    .then(() => {
        console.log('\nUpdate completed successfully!');
        process.exit(0);
    })
    .catch(() => {
        console.error('\nUpdate failed!');
        process.exit(1);
    });
