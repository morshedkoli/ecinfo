
import { auth } from "@/lib/auth";

export async function checkAuth() {
    const session = await auth();
    if (!session || !session.user) {
        return null;
    }
    return session;
}

export async function checkAdmin() {
    const session = await auth();
    if (!session || (session.user as any)?.role !== 'admin') {
        return null;
    }
    return session;
}
