'use client';

import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface VoterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (voter: VoterFormData) => Promise<void>;
    voter?: VoterFormData | null;
    mode: 'add' | 'edit' | 'view';
}

export interface VoterFormData {
    _id?: string;
    sl_no: string;
    name: string;
    voter_id: string;
    father: string;
    mother: string;
    occupation: string;
    dob: string;
    address: string;
    voter_area_code: string;
    status?: string;
}

const initialFormData: VoterFormData = {
    sl_no: '',
    name: '',
    voter_id: '',
    father: '',
    mother: '',
    occupation: '',
    dob: '',
    address: '',
    voter_area_code: '0749',
    status: 'Active',
};

export default function VoterModal({
    isOpen,
    onClose,
    onSave,
    voter,
    mode,
}: VoterModalProps) {
    const [formData, setFormData] = useState<VoterFormData>(initialFormData);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (voter) {
            setFormData({
                ...voter,
                dob: voter.dob ? new Date(voter.dob).toISOString().split('T')[0] : '',
            });
        } else {
            setFormData(initialFormData);
        }
        setError('');
    }, [voter, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await onSave(formData);
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to save voter');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    if (!isOpen) return null;

    const isViewMode = mode === 'view';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-slate-800 border border-slate-700 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
                    <h2 className="text-xl font-semibold text-white">
                        {mode === 'add' ? 'Add New Voter' : mode === 'edit' ? 'Edit Voter' : 'Voter Details'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
                    {error && (
                        <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-red-400">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        {/* Serial Number */}
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">
                                Serial No.
                            </label>
                            <input
                                type="text"
                                name="sl_no"
                                value={formData.sl_no}
                                onChange={handleChange}
                                disabled={isViewMode}
                                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none disabled:opacity-60"
                                required
                            />
                        </div>

                        {/* Voter ID */}
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">
                                Voter ID
                            </label>
                            <input
                                type="text"
                                name="voter_id"
                                value={formData.voter_id}
                                onChange={handleChange}
                                disabled={isViewMode}
                                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none disabled:opacity-60"
                                required
                            />
                        </div>

                        {/* Name */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-400 mb-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                disabled={isViewMode}
                                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none disabled:opacity-60"
                                required
                            />
                        </div>

                        {/* Father */}
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">
                                Father&apos;s Name
                            </label>
                            <input
                                type="text"
                                name="father"
                                value={formData.father}
                                onChange={handleChange}
                                disabled={isViewMode}
                                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none disabled:opacity-60"
                                required
                            />
                        </div>

                        {/* Mother */}
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">
                                Mother&apos;s Name
                            </label>
                            <input
                                type="text"
                                name="mother"
                                value={formData.mother}
                                onChange={handleChange}
                                disabled={isViewMode}
                                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none disabled:opacity-60"
                                required
                            />
                        </div>

                        {/* Date of Birth */}
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">
                                Date of Birth
                            </label>
                            <input
                                type="date"
                                name="dob"
                                value={formData.dob}
                                onChange={handleChange}
                                disabled={isViewMode}
                                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none disabled:opacity-60"
                            />
                        </div>

                        {/* Occupation */}
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">
                                Occupation
                            </label>
                            <input
                                type="text"
                                name="occupation"
                                value={formData.occupation}
                                onChange={handleChange}
                                disabled={isViewMode}
                                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none disabled:opacity-60"
                            />
                        </div>

                        {/* Address */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-400 mb-1">
                                Address
                            </label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                disabled={isViewMode}
                                rows={2}
                                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none disabled:opacity-60 resize-none"
                                required
                            />
                        </div>

                        {/* Voter Area Code */}
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">
                                Voter Area Code
                            </label>
                            <input
                                type="text"
                                name="voter_area_code"
                                value={formData.voter_area_code}
                                onChange={handleChange}
                                disabled={isViewMode}
                                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none disabled:opacity-60"
                                required
                            />
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">
                                Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                disabled={isViewMode}
                                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white focus:border-violet-500 focus:outline-none disabled:opacity-60"
                            >
                                <option value="Active">Active</option>
                                <option value="Deleted">Deleted</option>
                            </select>
                        </div>
                    </div>

                    {/* Actions */}
                    {!isViewMode && (
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-700">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2.5 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-medium hover:from-violet-500 hover:to-cyan-500 disabled:opacity-50 transition-all"
                            >
                                {isLoading ? 'Saving...' : mode === 'add' ? 'Add Voter' : 'Save Changes'}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
