
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const username = 'admin';
    const password = 'password123';

    const hashedPassword = await hash(password, 10);

    const user = await prisma.user.upsert({
        where: { username },
        update: {},
        create: {
            username,
            password: hashedPassword,
            role: 'admin',
        },
    });

    console.log({ user });
    console.log(`Admin user created/verified.`);
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
