'use client';

export default function SettingsPage() {
    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    Settings
                </h1>
                <p className="mt-2 text-slate-400">
                    Configure application settings
                </p>
            </div>

            <div className="max-w-3xl space-y-6">
                {/* Database Connection */}
                <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">
                        Database Connection
                    </h2>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">
                            MongoDB Atlas
                        </label>
                        <input
                            type="text"
                            value="Connected via Prisma ORM"
                            disabled
                            className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-slate-400 font-mono text-sm"
                        />
                    </div>
                </div>

                {/* Application Info */}
                <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">
                        Application Info
                    </h2>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Version</span>
                            <span className="text-white">1.0.0</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Framework</span>
                            <span className="text-white">Next.js 16</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Database</span>
                            <span className="text-white">MongoDB Atlas (Prisma)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
