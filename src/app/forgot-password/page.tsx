
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [username, setUsername] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would call an API API to send a reset email.
        // For now, we simulate the request.
        console.log('Password reset requested for:', username);
        setSubmitted(true);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-slate-800 p-8 shadow-2xl shadow-black/50 border border-slate-700">
                <div>
                    <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-white">
                        Reset Password
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-400">
                        Enter your username to request a password reset.
                    </p>
                </div>

                {!submitted ? (
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="username" className="sr-only">
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="relative block w-full rounded-md border-0 bg-slate-700/50 py-3 pl-3 text-white ring-1 ring-inset ring-slate-600 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-violet-500 sm:text-sm sm:leading-6"
                                placeholder="Enter your username"
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="group relative flex w-full justify-center rounded-lg bg-gradient-to-r from-violet-600 to-cyan-600 px-3 py-3 text-sm font-semibold text-white hover:from-violet-500 hover:to-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 transition-all duration-200"
                            >
                                Request Reset
                            </button>
                        </div>

                        <div className="text-center">
                            <Link
                                href="/login"
                                className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                            >
                                <ArrowLeft size={16} />
                                Back to Login
                            </Link>
                        </div>
                    </form>
                ) : (
                    <div className="mt-8 text-center space-y-6">
                        <div className="p-4 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20">
                            If an account exists for <strong>{username}</strong>, please contact your administrator to complete the process.
                        </div>
                        <Link
                            href="/login"
                            className="inline-block rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-600 transition-colors"
                        >
                            Return to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
