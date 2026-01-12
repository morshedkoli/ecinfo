
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { auth } from '@/lib/auth';

// Middleware check helper
async function checkAdmin() {
    const session = await auth();
    if (!session || (session.user as any)?.role !== 'admin') {
        return false;
    }
    return true;
}

export async function GET() {
    if (!(await checkAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const users = await prisma.user.findMany({
            where: {
                username: { not: 'admin' }
            },
            select: {
                id: true,
                username: true,
                role: true,
                status: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    if (!(await checkAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { username, password, role } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role: role || 'user',
                status: 'active'
            },
        });

        return NextResponse.json({ success: true, user: { id: user.id, username: user.username, role: user.role, status: user.status } });
    } catch (error) {
        console.error('Create user error:', error);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    if (!(await checkAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id, password, role, status } = await req.json();

        if (!id) {
            return NextResponse.json({ error: 'Missing User ID' }, { status: 400 });
        }

        const updateData: any = {};
        if (password) updateData.password = await hash(password, 10);
        if (role) updateData.role = role;
        if (status) updateData.status = status;

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
            select: { id: true, username: true, role: true, status: true }
        });

        return NextResponse.json({ success: true, user });

    } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    if (!(await checkAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        // Double check to prevent deleting main admin if ID somehow passed
        const user = await prisma.user.findUnique({ where: { id } });
        if (user?.username === 'admin') {
            return NextResponse.json({ error: 'Cannot delete main admin' }, { status: 403 });
        }

        await prisma.user.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
