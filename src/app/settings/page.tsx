'use client';

import { useState } from 'react';
import { Upload, Database, CheckCircle, AlertCircle, Info } from 'lucide-react';

const SAMPLE_JSON = `[
  {
    "serial_no": "০০০১",
    "name": "মোছাঃ কামরুন্নাহার",
    "voter_id": "১২০৭০৭২২০৩৭৯",
    "father_name": "মোঃ আব্দুল জলিল",
    "mother_name": "মোছাঃ নিয়াজুন নেছা",
    "occupation": "গৃহিনী",
    "date_of_birth": "১২/০৮/১৯৬২",
    "address": "দুবাজাইল, উত্তর পাড়া, সরাইল",
    "district": "ব্রাহ্মণবাড়িয়া",
    "upazila": "সরাইল",
    "union": "অরুয়াইল",
    "ward_number": "১",
    "voter_area": "দুবাজাইল পশ্চিম পাড়া",
    "voter_area_code": "০৭০৭"
  },
  {
    "serial_no": "০০০২",
    "name": "খ, ম, ফয়জুন নাহার",
    "voter_id": "১২০৭০৭২২০৩৮১",
    "father_name": "মোঃ তাবারক আলী খন্দকার",
    "mother_name": "মোছাঃ ফরিদা আক্তার",
    "occupation": "শিক্ষক",
    "date_of_birth": "০১/০৭/১৯৮৩",
    "address": "দুবাজাইল, উত্তরপাড়া, সরাইল",
    "district": "ব্রাহ্মণবাড়িয়া",
    "upazila": "সরাইল",
    "union": "অরুয়াইল",
    "ward_number": "১",
    "voter_area": "দুবাজাইল পশ্চিম পাড়া",
    "voter_area_code": "০৭০৭"
  }
]`;

export default function SettingsPage() {
    // JSON Import state
    const [jsonData, setJsonData] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [importResult, setImportResult] = useState<{
        success: boolean;
        message: string;
        data?: {
            areaCreated: boolean;
            areasCreated?: number;
            votersCreated: number;
            votersSkipped: number;
            totalProcessed: number;
        };
    } | null>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setJsonData(event.target?.result as string);
                setImportResult(null);
            };
            reader.readAsText(file);
        }
    };

    const handleImport = async () => {
        if (!jsonData.trim()) {
            setImportResult({ success: false, message: 'Please provide JSON data' });
            return;
        }

        setIsImporting(true);
        setImportResult(null);

        try {
            const parsed = JSON.parse(jsonData);

            const res = await fetch('/api/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parsed),
            });

            const result = await res.json();

            if (result.success) {
                setImportResult({
                    success: true,
                    message: result.message,
                    data: result.data,
                });
                setJsonData('');
            } else {
                setImportResult({ success: false, message: result.error });
            }
        } catch (error: unknown) {
            setImportResult({
                success: false,
                message: error instanceof Error ? error.message : 'Invalid JSON format',
            });
        } finally {
            setIsImporting(false);
        }
    };

    const loadSampleFormat = () => {
        setJsonData(SAMPLE_JSON);
        setImportResult(null);
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    Settings
                </h1>
                <p className="mt-2 text-slate-400">
                    Configure application settings and import data
                </p>
            </div>

            <div className="max-w-3xl space-y-6">
                {/* JSON Import */}
                <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Upload className="text-violet-400" size={20} />
                        <h2 className="text-lg font-semibold text-white">
                            Import JSON Data
                        </h2>
                    </div>
                    <p className="text-sm text-slate-400 mb-4">
                        Upload a JSON file or paste JSON data to import voter records into the database.
                    </p>

                    {/* Sample Format Info */}
                    <div className="mb-4 rounded-lg bg-blue-500/10 border border-blue-500/30 p-4">
                        <div className="flex items-start gap-3">
                            <Info className="text-blue-400 flex-shrink-0 mt-0.5" size={18} />
                            <div className="flex-1">
                                <p className="text-sm text-blue-300 font-medium mb-2">
                                    JSON Format: Array of voter objects
                                </p>
                                <p className="text-xs text-slate-400 mb-2">
                                    Each voter object should have: serial_no, name, voter_id, father_name, mother_name, occupation, date_of_birth (DD/MM/YYYY), address, district, upazila, union, ward_number, voter_area, voter_area_code
                                </p>
                                <button
                                    onClick={loadSampleFormat}
                                    className="text-xs text-blue-400 hover:text-blue-300 underline"
                                >
                                    Load sample format
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* File Upload */}
                    <div className="mb-4">
                        <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-violet-500 hover:bg-slate-700/30 transition-all">
                            <div className="text-center">
                                <Upload className="mx-auto text-slate-400 mb-2" size={20} />
                                <span className="text-sm text-slate-400">
                                    Click to upload JSON file
                                </span>
                            </div>
                            <input
                                type="file"
                                accept=".json"
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                        </label>
                    </div>

                    {/* Text Area */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-400 mb-2">
                            Or paste JSON data
                        </label>
                        <textarea
                            value={jsonData}
                            onChange={(e) => {
                                setJsonData(e.target.value);
                                setImportResult(null);
                            }}
                            placeholder='[{"serial_no": "০০০১", "name": "...", "voter_id": "...", ...}]'
                            rows={8}
                            className="w-full rounded-lg border border-slate-600 bg-slate-900/50 px-4 py-3 text-sm text-white font-mono placeholder-slate-500 focus:border-violet-500 focus:outline-none resize-none"
                        />
                    </div>

                    {/* Import Result */}
                    {importResult && (
                        <div
                            className={`mb-4 rounded-lg p-4 ${importResult.success
                                ? 'bg-emerald-500/10 border border-emerald-500/30'
                                : 'bg-red-500/10 border border-red-500/30'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                {importResult.success ? (
                                    <CheckCircle className="text-emerald-400 flex-shrink-0" size={20} />
                                ) : (
                                    <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
                                )}
                                <div>
                                    <p
                                        className={`font-medium ${importResult.success ? 'text-emerald-400' : 'text-red-400'
                                            }`}
                                    >
                                        {importResult.message}
                                    </p>
                                    {importResult.data && (
                                        <div className="mt-2 text-sm text-slate-400 space-y-1">
                                            <p>
                                                Area created:{' '}
                                                <span className="text-white">
                                                    {importResult.data.areaCreated ? 'Yes' : 'No (already exists)'}
                                                </span>
                                            </p>
                                            <p>
                                                Voters created:{' '}
                                                <span className="text-white">{importResult.data.votersCreated}</span>
                                            </p>
                                            <p>
                                                Voters skipped:{' '}
                                                <span className="text-white">{importResult.data.votersSkipped}</span>
                                            </p>
                                            <p>
                                                Total processed:{' '}
                                                <span className="text-white">{importResult.data.totalProcessed}</span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Import Button */}
                    <button
                        onClick={handleImport}
                        disabled={isImporting || !jsonData.trim()}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-5 py-3 font-medium text-white hover:from-violet-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isImporting ? (
                            <>
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Importing...
                            </>
                        ) : (
                            <>
                                <Database size={18} />
                                Import JSON to Database
                            </>
                        )}
                    </button>
                </div>

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
