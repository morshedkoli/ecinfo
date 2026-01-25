const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
    console.log('Connecting to database...');
    try {
        const countBefore = await prisma.voter.count();
        console.log(`Found ${countBefore} voters before deletion.`);

        if (countBefore > 0) {
            console.log('Deleting all voters...');
            const result = await prisma.voter.deleteMany({});
            console.log(`Successfully deleted ${result.count} voters.`);
        } else {
            console.log('No voters found to delete.');
        }

        const countAfter = await prisma.voter.count();
        console.log(`Voters remaining in database: ${countAfter}`);

    } catch (error) {
        console.error('Error during deletion:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
