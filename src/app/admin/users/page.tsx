
'use client';

import { useState, useEffect } from 'react';
import { Trash2, UserPlus, Shield, User, Edit2, Ban, CheckCircle } from 'lucide-react';

interface UserData {
    id: string;
    username: string;
    role: string;
    status: string;
    createdAt: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

    // Form State
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [status, setStatus] = useState('active');
    const [submitLoading, setSubmitLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setUsername('');
        setPassword('');
        setRole('user');
        setStatus('active');
        setSelectedUser(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowAddModal(true);
    };

    const openEditModal = (user: UserData) => {
        setSelectedUser(user);
        setUsername(user.username);
        setPassword(''); // Don't populate password
        setRole(user.role);
        setStatus(user.status || 'active');
        setShowEditModal(true);
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitLoading(true);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, role }),
            });

            if (res.ok) {
                setShowAddModal(false);
                fetchUsers();
                resetForm();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to create user');
            }
        } catch (error) {
            console.error('Error creating user:', error);
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        setSubmitLoading(true);
        try {
            const body: any = { id: selectedUser.id, role, status };
            if (password) body.password = password;

            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                setShowEditModal(false);
                fetchUsers();
                resetForm();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to update user');
            }
        } catch (error) {
            console.error('Error updating user:', error);
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDeleteUser = async (id: string, username: string) => {
        if (!confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) return;
        try {
            const res = await fetch(`/api/admin/users?id=${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                fetchUsers();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 p-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">User Management</h1>
                    <p className="text-slate-400">Manage system access and roles</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-white hover:bg-violet-500 transition-colors"
                >
                    <UserPlus size={20} />
                    Add User
                </button>
            </div>

            {loading ? (
                <div className="text-center text-slate-400">Loading users...</div>
            ) : (
                <div className="rounded-xl border border-slate-700 bg-slate-800/50 backdrop-blur-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-700/50 text-slate-300">
                            <tr>
                                <th className="p-4 font-semibold">Username</th>
                                <th className="p-4 font-semibold">Role</th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 font-semibold">Created At</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-full bg-slate-700 p-2 text-slate-300">
                                                <User size={16} />
                                            </div>
                                            <span className="font-medium text-white">{user.username}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${user.role === 'admin'
                                                ? 'bg-violet-500/10 text-violet-400 ring-1 ring-inset ring-violet-500/20'
                                                : 'bg-slate-500/10 text-slate-400 ring-1 ring-inset ring-slate-500/20'
                                                }`}
                                        >
                                            {user.role === 'admin' && <Shield size={12} />}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${user.status === 'active'
                                                ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20'
                                                : 'bg-red-500/10 text-red-400 ring-1 ring-inset ring-red-500/20'
                                                }`}
                                        >
                                            {user.status === 'active' ? <CheckCircle size={12} /> : <Ban size={12} />}
                                            {user.status || 'active'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-400">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(user)}
                                                className="rounded-lg p-2 text-slate-400 hover:bg-blue-500/10 hover:text-blue-400 transition-colors"
                                                title="Edit User"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id, user.username)}
                                                className="rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                                                title="Delete User"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {users.length === 0 && (
                        <div className="p-8 text-center text-slate-500">No users found.</div>
                    )}
                </div>
            )}

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl bg-slate-800 p-6 shadow-2xl border border-slate-700">
                        <h2 className="mb-6 text-xl font-bold text-white">Create New User</h2>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Username</label>
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full rounded-lg border border-slate-600 bg-slate-700 p-2.5 text-white placeholder-slate-400 focus:border-violet-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-lg border border-slate-600 bg-slate-700 p-2.5 text-white placeholder-slate-400 focus:border-violet-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full rounded-lg border border-slate-600 bg-slate-700 p-2.5 text-white focus:border-violet-500 focus:outline-none"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 rounded-lg bg-slate-700 px-4 py-2 text-white hover:bg-slate-600 transition-colors">Cancel</button>
                                <button type="submit" disabled={submitLoading} className="flex-1 rounded-lg bg-violet-600 px-4 py-2 text-white hover:bg-violet-500 transition-colors disabled:opacity-50">
                                    {submitLoading ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl bg-slate-800 p-6 shadow-2xl border border-slate-700">
                        <h2 className="mb-6 text-xl font-bold text-white">Edit User</h2>
                        <form onSubmit={handleUpdateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Username</label>
                                <input
                                    type="text"
                                    disabled
                                    value={username}
                                    className="w-full rounded-lg border border-slate-600 bg-slate-700/50 p-2.5 text-slate-400 cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full rounded-lg border border-slate-600 bg-slate-700 p-2.5 text-white focus:border-violet-500 focus:outline-none"
                                >
                                    <option value="active">Active</option>
                                    <option value="disabled">Disabled</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Password (Leave blank to keep current)</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="New password (optional)"
                                    className="w-full rounded-lg border border-slate-600 bg-slate-700 p-2.5 text-white placeholder-slate-400 focus:border-violet-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full rounded-lg border border-slate-600 bg-slate-700 p-2.5 text-white focus:border-violet-500 focus:outline-none"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 rounded-lg bg-slate-700 px-4 py-2 text-white hover:bg-slate-600 transition-colors">Cancel</button>
                                <button type="submit" disabled={submitLoading} className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 transition-colors disabled:opacity-50">
                                    {submitLoading ? 'Updating...' : 'Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
