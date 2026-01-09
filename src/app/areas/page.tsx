'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Eye, Pencil, Trash2, MapPin, Users, Calendar } from 'lucide-react';
import SearchFilter from '@/components/SearchFilter';

interface VoterArea {
    _id: string;
    district: string;
    upazila_thana: string;
    union_paurashava: string;
    ward_number: string;
    voter_area_name: string;
    voter_area_code: string;
    post_office: string;
    post_code: string;
    total_voters: number;
    total_male_voters: number;
    publication_date: string;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default function AreasPage() {
    const [areas, setAreas] = useState<VoterArea[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
    const [selectedArea, setSelectedArea] = useState<VoterArea | null>(null);

    const fetchAreas = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
            });

            if (searchQuery) params.append('search', searchQuery);

            const res = await fetch(`/api/voter-areas?${params}`);
            const data = await res.json();

            if (data.success) {
                setAreas(data.data);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch areas:', error);
        } finally {
            setIsLoading(false);
        }
    }, [pagination.page, pagination.limit, searchQuery]);

    useEffect(() => {
        fetchAreas();
    }, [fetchAreas]);

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const openModal = (mode: 'add' | 'edit' | 'view', area?: VoterArea) => {
        setModalMode(mode);
        setSelectedArea(area || null);
        setIsModalOpen(true);
    };

    const handleDelete = async (area: VoterArea) => {
        if (!confirm(`Are you sure you want to delete ${area.voter_area_name}?`)) return;

        try {
            const res = await fetch(`/api/voter-areas/${area.voter_area_code}`, {
                method: 'DELETE',
            });
            const data = await res.json();

            if (data.success) {
                fetchAreas();
            }
        } catch (error) {
            console.error('Failed to delete area:', error);
        }
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        Voter Areas
                    </h1>
                    <p className="mt-2 text-slate-400">
                        Manage administrative voter area data
                    </p>
                </div>
                <button
                    onClick={() => openModal('add')}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-5 py-3 font-medium text-white hover:from-violet-500 hover:to-cyan-500 transition-all shadow-lg shadow-violet-500/25"
                >
                    <Plus size={20} />
                    Add Area
                </button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <SearchFilter
                    onSearch={handleSearch}
                    placeholder="Search by district, upazila, area name, code..."
                />
            </div>

            {/* Areas Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="h-64 rounded-2xl bg-slate-800/50 animate-pulse"
                        />
                    ))}
                </div>
            ) : areas.length === 0 ? (
                <div className="text-center py-16 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                    <MapPin className="mx-auto text-slate-500 mb-4" size={48} />
                    <p className="text-slate-400">No voter areas found.</p>
                    <p className="text-sm text-slate-500 mt-1">
                        Add a new area or run the seed script.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {areas.map((area) => (
                        <div
                            key={area._id}
                            className="relative rounded-2xl bg-slate-800/50 border border-slate-700/50 p-6 hover:border-slate-600/50 transition-all group"
                        >
                            {/* Actions */}
                            <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => openModal('view', area)}
                                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                                >
                                    <Eye size={16} />
                                </button>
                                <button
                                    onClick={() => openModal('edit', area)}
                                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-cyan-400 transition-colors"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(area)}
                                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            {/* Area Code Badge */}
                            <div className="inline-flex items-center rounded-full bg-gradient-to-r from-violet-500/20 to-cyan-500/20 px-3 py-1 text-sm font-medium text-violet-300 mb-4">
                                Code: {area.voter_area_code}
                            </div>

                            {/* Area Name */}
                            <h3 className="text-lg font-semibold text-white mb-2">
                                {area.voter_area_name}
                            </h3>

                            {/* Location */}
                            <p className="text-sm text-slate-400 mb-4">
                                {area.union_paurashava}, {area.upazila_thana}, {area.district}
                            </p>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700/50">
                                <div className="flex items-center gap-2">
                                    <Users className="text-violet-400" size={16} />
                                    <div>
                                        <p className="text-lg font-semibold text-white">
                                            {area.total_voters}
                                        </p>
                                        <p className="text-xs text-slate-500">Total Voters</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="text-cyan-400" size={16} />
                                    <div>
                                        <p className="text-sm font-medium text-white">
                                            {area.publication_date
                                                ? new Date(area.publication_date).toLocaleDateString(
                                                    'en-GB'
                                                )
                                                : '-'}
                                        </p>
                                        <p className="text-xs text-slate-500">Published</p>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="mt-4 pt-4 border-t border-slate-700/50 text-xs text-slate-500">
                                Ward {area.ward_number} • Post Office: {area.post_office} (
                                {area.post_code})
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Simple Modal for Add/Edit/View */}
            {isModalOpen && (
                <AreaModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={fetchAreas}
                    area={selectedArea}
                    mode={modalMode}
                />
            )}
        </div>
    );
}

// Area Modal Component
function AreaModal({
    isOpen,
    onClose,
    onSave,
    area,
    mode,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    area: VoterArea | null;
    mode: 'add' | 'edit' | 'view';
}) {
    const [formData, setFormData] = useState({
        district: '',
        upazila_thana: '',
        union_paurashava: '',
        ward_number: '',
        voter_area_name: '',
        voter_area_code: '',
        post_office: '',
        post_code: '',
        total_voters: 0,
        total_male_voters: 0,
        publication_date: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (area) {
            setFormData({
                ...area,
                publication_date: area.publication_date
                    ? new Date(area.publication_date).toISOString().split('T')[0]
                    : '',
            });
        } else {
            setFormData({
                district: '',
                upazila_thana: '',
                union_paurashava: '',
                ward_number: '',
                voter_area_name: '',
                voter_area_code: '',
                post_office: '',
                post_code: '',
                total_voters: 0,
                total_male_voters: 0,
                publication_date: '',
            });
        }
        setError('');
    }, [area, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const url =
                mode === 'add'
                    ? '/api/voter-areas'
                    : `/api/voter-areas/${area?.voter_area_code}`;
            const method = mode === 'add' ? 'POST' : 'PUT';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error);
            }

            onSave();
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || 0 : value,
        }));
    };

    if (!isOpen) return null;

    const isViewMode = mode === 'view';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-slate-800 border border-slate-700 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
                    <h2 className="text-xl font-semibold text-white">
                        {mode === 'add' ? 'Add Voter Area' : mode === 'edit' ? 'Edit Voter Area' : 'Area Details'}
                    </h2>
                    <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-white">
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
                    {error && (
                        <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-red-400">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-400 mb-1">Area Name</label>
                            <input
                                type="text"
                                name="voter_area_name"
                                value={formData.voter_area_name}
                                onChange={handleChange}
                                disabled={isViewMode}
                                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white focus:border-violet-500 focus:outline-none disabled:opacity-60"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Area Code</label>
                            <input
                                type="text"
                                name="voter_area_code"
                                value={formData.voter_area_code}
                                onChange={handleChange}
                                disabled={isViewMode || mode === 'edit'}
                                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white focus:border-violet-500 focus:outline-none disabled:opacity-60"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">District</label>
                            <input
                                type="text"
                                name="district"
                                value={formData.district}
                                onChange={handleChange}
                                disabled={isViewMode}
                                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white focus:border-violet-500 focus:outline-none disabled:opacity-60"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Upazila/Thana</label>
                            <input
                                type="text"
                                name="upazila_thana"
                                value={formData.upazila_thana}
                                onChange={handleChange}
                                disabled={isViewMode}
                                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white focus:border-violet-500 focus:outline-none disabled:opacity-60"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Union/Paurashava</label>
                            <input
                                type="text"
                                name="union_paurashava"
                                value={formData.union_paurashava}
                                onChange={handleChange}
                                disabled={isViewMode}
                                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white focus:border-violet-500 focus:outline-none disabled:opacity-60"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Ward Number</label>
                            <input
                                type="text"
                                name="ward_number"
                                value={formData.ward_number}
                                onChange={handleChange}
                                disabled={isViewMode}
                                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white focus:border-violet-500 focus:outline-none disabled:opacity-60"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Post Office</label>
                            <input
                                type="text"
                                name="post_office"
                                value={formData.post_office}
                                onChange={handleChange}
                                disabled={isViewMode}
                                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white focus:border-violet-500 focus:outline-none disabled:opacity-60"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Post Code</label>
                            <input
                                type="text"
                                name="post_code"
                                value={formData.post_code}
                                onChange={handleChange}
                                disabled={isViewMode}
                                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white focus:border-violet-500 focus:outline-none disabled:opacity-60"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Total Voters</label>
                            <input
                                type="number"
                                name="total_voters"
                                value={formData.total_voters}
                                onChange={handleChange}
                                disabled={isViewMode}
                                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white focus:border-violet-500 focus:outline-none disabled:opacity-60"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Male Voters</label>
                            <input
                                type="number"
                                name="total_male_voters"
                                value={formData.total_male_voters}
                                onChange={handleChange}
                                disabled={isViewMode}
                                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white focus:border-violet-500 focus:outline-none disabled:opacity-60"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-400 mb-1">Publication Date</label>
                            <input
                                type="date"
                                name="publication_date"
                                value={formData.publication_date}
                                onChange={handleChange}
                                disabled={isViewMode}
                                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white focus:border-violet-500 focus:outline-none disabled:opacity-60"
                            />
                        </div>
                    </div>

                    {!isViewMode && (
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-700">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2.5 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-medium disabled:opacity-50"
                            >
                                {isLoading ? 'Saving...' : mode === 'add' ? 'Add Area' : 'Save Changes'}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
