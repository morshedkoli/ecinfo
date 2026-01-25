'use client';

import { useState, useRef } from 'react';
import { Upload, Database, CheckCircle, AlertCircle, Info, FileJson, Play, Download, AlertTriangle } from 'lucide-react';

const CHUNK_SIZE = 50;

export default function ImportDataPage() {
    const [importQueue, setImportQueue] = useState<any[]>([]);
    const [skippedData, setSkippedData] = useState<any[]>([]);
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
            setSkippedData([]);
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
        setSkippedData([]);

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

                        if (result.data.skippedRecords && Array.isArray(result.data.skippedRecords)) {
                            setSkippedData(prev => [...prev, ...result.data.skippedRecords]);
                        }
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

    const downloadSkippedData = () => {
        if (skippedData.length === 0) return;

        const dataStr = JSON.stringify(skippedData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = `skipped_records_${new Date().toISOString().slice(0, 10)}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
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

                            {/* Skipped Data Warning & Download */}
                            {skippedData.length > 0 && (
                                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={24} />
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-amber-400">
                                                {skippedData.length} Records Skipped
                                            </h3>
                                            <p className="text-sm text-amber-300/80 mt-1 mb-3">
                                                Some records were skipped due to errors or duplication. You can download the details to analyze the issues.
                                            </p>
                                            <button
                                                onClick={downloadSkippedData}
                                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20 text-amber-300 text-sm font-medium hover:bg-amber-500/30 transition-colors"
                                            >
                                                <Download size={16} />
                                                Download Skipped Records JSON
                                            </button>
                                        </div>
                                    </div>

                                    {/* Preview of first 5 skipped items */}
                                    <div className="mt-4 pt-4 border-t border-amber-500/20">
                                        <p className="text-xs text-amber-400/70 mb-2 uppercase font-semibold">Preview (First 5)</p>
                                        <div className="bg-slate-900/50 rounded-lg p-3 text-xs font-mono text-amber-200/80 overflow-x-auto max-h-40 overflow-y-auto">
                                            {skippedData.slice(0, 5).map((item, idx) => (
                                                <div key={idx} className="mb-1 pb-1 border-b border-white/5 last:border-0 last:mb-0 last:pb-0">
                                                    <span className="text-amber-500">[{item.reason}]</span> {item.name} ({item.voter_id || 'ID Missing'})
                                                </div>
                                            ))}
                                            {skippedData.length > 5 && (
                                                <div className="text-slate-500 italic mt-1">...and {skippedData.length - 5} more</div>
                                            )}
                                        </div>
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
