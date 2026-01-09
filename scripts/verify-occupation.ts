import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyOccupationFix() {
    try {
        console.log('Verifying occupation name fix...\n');

        // Check for old incorrect name
        const incorrectCount = await prisma.voter.count({
            where: {
                occupation: 'গৃিহনী'
            }
        });

        console.log(`Records with incorrect name "গৃিহনী": ${incorrectCount}`);

        // Check for new correct name
        const correctCount = await prisma.voter.count({
            where: {
                occupation: 'গৃহিনী'
            }
        });

        console.log(`Records with correct name "গৃহিনী": ${correctCount}`);

        if (incorrectCount === 0 && correctCount > 0) {
            console.log('\n✅ Verification successful! All records have been updated.');
        } else if (incorrectCount > 0) {
            console.log('\n⚠️ Warning: Some records still have the incorrect occupation name.');
        } else {
            console.log('\n⚠️ No records found with either occupation name.');
        }

    } catch (error) {
        console.error('Error verifying occupation fix:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

verifyOccupationFix()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
