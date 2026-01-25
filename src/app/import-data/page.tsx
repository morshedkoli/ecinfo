'use client';

import { useState, useRef } from 'react';
import { Upload, Database, CheckCircle, AlertCircle, Info, FileJson, Play } from 'lucide-react';

const CHUNK_SIZE = 50;

export default function ImportDataPage() {
    const [importQueue, setImportQueue] = useState<any[]>([]);
    const [isImporting, setIsImporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [stats, setStats] = useState({
        processed: 0,
        total: 0,
        created: 0,
        skipped: 0,
        areasCreated: 0
    });
    const [statusMessage, setStatusMessage] = useState('');
    const [importComplete, setImportComplete] = useState(false);
    const [pastedJson, setPastedJson] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processContent = (content: string) => {
        try {
            const json = JSON.parse(content);
            let dataToImport: any[] = [];

            if (Array.isArray(json)) {
                dataToImport = json;
            } else if (json.administrative_metadata && json.voter_records) {
                // Legacy format normalization
                const { administrative_metadata, voter_records } = json;
                dataToImport = voter_records.map((record: any) => ({
                    ...record,
                    // Map legacy fields to flat fields expected by API
                    serial_no: record.sl_no,
                    name: record.name,
                    voter_id: record.voter_id,
                    father_name: record.father,
                    mother_name: record.mother,
                    occupation: record.occupation,
                    date_of_birth: record.dob,
                    address: record.address,
                    // Area info from metadata
                    district: administrative_metadata.district,
                    upazila: administrative_metadata.upazila_thana,
                    union: administrative_metadata.union_paurashava,
                    ward_number: administrative_metadata.ward_number,
                    voter_area: administrative_metadata.voter_area_name,
                    voter_area_code: administrative_metadata.voter_area_code,
                }));
            } else {
                throw new Error('Unrecognized JSON format');
            }

            setImportQueue(dataToImport);
            setStats({
                processed: 0,
                total: dataToImport.length,
                created: 0,
                skipped: 0,
                areasCreated: 0
            });
            setStatusMessage(`Loaded ${dataToImport.length} records. Ready to import.`);
            setImportComplete(false);
            setProgress(0);
            return true;

        } catch (error) {
            setStatusMessage('Error parsing JSON content');
            console.error(error);
            return false;
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setStatusMessage('Reading file...');
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            processContent(content);
        };
        reader.readAsText(file);
    };

    const handlePasteLoad = () => {
        if (!pastedJson.trim()) {
            setStatusMessage('Please paste valid JSON first');
            return;
        }
        if (processContent(pastedJson)) {
            setPastedJson(''); // Clear after successful load
        }
    };

    const startImport = async () => {
        if (importQueue.length === 0) return;

        setIsImporting(true);
        setStatusMessage('Starting import...');
        setImportComplete(false);

        let currentStats = {
            processed: 0,
            total: importQueue.length,
            created: 0,
            skipped: 0,
            areasCreated: 0
        };

        try {
            for (let i = 0; i < importQueue.length; i += CHUNK_SIZE) {
                const chunk = importQueue.slice(i, i + CHUNK_SIZE);

                try {
                    const res = await fetch('/api/import', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(chunk),
                    });

                    const result = await res.json();

                    if (result.success) {
                        currentStats.processed += chunk.length;
                        currentStats.created += result.data.votersCreated;
                        currentStats.skipped += result.data.votersSkipped;
                        currentStats.areasCreated += result.data.areasCreated;
                    } else {
                        console.error('Chunk failed', result);
                        currentStats.processed += chunk.length;
                    }
                } catch (err) {
                    console.error('Network error on chunk', err);
                    currentStats.processed += chunk.length;
                }

                // Update UI
                setStats({ ...currentStats });
                setProgress(Math.round((currentStats.processed / currentStats.total) * 100));
            }
            setStatusMessage('Import completed successfully!');
            setImportComplete(true);
        } catch (error) {
            setStatusMessage('Import failed unexpectedly.');
        } finally {
            setIsImporting(false);
            setImportQueue([]);
        }
    };

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    Import Data
                </h1>
                <p className="mt-2 text-slate-400">
                    Upload JSON or paste data to update database directly
                </p>
            </div>

            <div className="max-w-3xl space-y-6">
                <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-6">

                    {/* File Upload Section */}
                    <div className="mb-6">
                        <label
                            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${isImporting
                                    ? 'border-slate-700 bg-slate-800/30 opacity-50 cursor-not-allowed'
                                    : 'border-slate-600 hover:border-violet-500 hover:bg-slate-700/30'
                                }`}
                        >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className={`w-10 h-10 mb-3 ${isImporting ? 'text-slate-600' : 'text-slate-400'}`} />
                                <p className="mb-2 text-sm text-slate-400">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-slate-500">JSON files only</p>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".json"
                                className="hidden"
                                onChange={handleFileUpload}
                                disabled={isImporting}
                            />
                        </label>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-px bg-slate-700 flex-1" />
                        <span className="text-sm text-slate-500 font-medium">OR PASTE JSON</span>
                        <div className="h-px bg-slate-700 flex-1" />
                    </div>

                    {/* Paste JSON Section */}
                    <div className="mb-6">
                        <textarea
                            value={pastedJson}
                            onChange={(e) => setPastedJson(e.target.value)}
                            placeholder='Paste your JSON data here...'
                            rows={4}
                            disabled={isImporting}
                            className="w-full rounded-lg border border-slate-600 bg-slate-900/50 px-4 py-3 text-sm text-white font-mono placeholder-slate-500 focus:border-violet-500 focus:outline-none resize-none transition-all"
                        />
                        <button
                            onClick={handlePasteLoad}
                            disabled={!pastedJson.trim() || isImporting}
                            className="mt-3 w-full py-2 rounded-lg bg-slate-700 text-slate-200 text-sm font-medium hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Load from Text
                        </button>
                    </div>

                    {/* Status & Progress */}
                    {(importQueue.length > 0 || stats.total > 0) && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 border-t border-slate-700/50 pt-6">

                            {/* File Info */}
                            {!isImporting && !importComplete && (
                                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-700/30 border border-slate-600/50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-violet-500/20 text-violet-400">
                                            <FileJson size={24} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{stats.total} Records Found</p>
                                            <p className="text-xs text-slate-400">Ready to import</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={startImport}
                                        className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
                                    >
                                        <Play size={18} fill="currentColor" />
                                        Start Import
                                    </button>
                                </div>
                            )}

                            {/* Progress Bar (Visible during import or after completion) */}
                            {(isImporting || importComplete) && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-300 font-medium">Progress</span>
                                        <span className="text-violet-400 font-bold">{progress}%</span>
                                    </div>
                                    <div className="h-4 w-full bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-300 ease-out"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <p className="text-center text-xs text-slate-500">
                                        Processed {stats.processed} of {stats.total} records
                                    </p>
                                </div>
                            )}

                            {/* Final Stats */}
                            {(isImporting || importComplete) && (
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-4 rounded-xl bg-slate-700/20 border border-slate-700/50 text-center">
                                        <div className="mx-auto mb-2 w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                            <Database size={16} />
                                        </div>
                                        <p className="text-2xl font-bold text-white">{stats.created}</p>
                                        <p className="text-xs text-slate-400">Added</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-slate-700/20 border border-slate-700/50 text-center">
                                        <div className="mx-auto mb-2 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                                            <Info size={16} />
                                        </div>
                                        <p className="text-2xl font-bold text-white">{stats.skipped}</p>
                                        <p className="text-xs text-slate-400">Skipped/Merged</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-slate-700/20 border border-slate-700/50 text-center">
                                        <div className="mx-auto mb-2 w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                                            <Database size={16} />
                                        </div>
                                        <p className="text-2xl font-bold text-white">{stats.areasCreated}</p>
                                        <p className="text-xs text-slate-400">Areas Created</p>
                                    </div>
                                </div>
                            )}

                            {/* Completion Message */}
                            {importComplete && (
                                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                                    <CheckCircle className="text-emerald-400" size={24} />
                                    <div>
                                        <p className="font-semibold text-emerald-400">Import Complete</p>
                                        <p className="text-sm text-emerald-300/80">
                                            Successfully processed {stats.total} records.
                                        </p>
                                    </div>
                                </div>
                            )}

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
