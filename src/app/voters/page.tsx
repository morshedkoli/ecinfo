'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import DataTable from '@/components/DataTable';
import SearchFilter from '@/components/SearchFilter';
import VoterModal, { VoterFormData } from '@/components/VoterModal';

interface Voter {
    _id: string;
    sl_no: string;
    name: string;
    voter_id: string;
    father: string;
    mother: string;
    occupation: string;
    dob: string;
    address: string;
    voter_area_code: string;
    status: string;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

const occupationOptions = [
    { value: 'Farmer', label: 'Farmer' },
    { value: 'Business', label: 'Business' },
    { value: 'Driver', label: 'Driver' },
    { value: 'Laborer', label: 'Laborer' },
    { value: 'Daily Laborer', label: 'Daily Laborer' },
    { value: 'Teacher', label: 'Teacher' },
    { value: 'Student', label: 'Student' },
    { value: 'Private Service', label: 'Private Service' },
    { value: 'Government Service', label: 'Government Service' },
    { value: 'Unemployed', label: 'Unemployed' },
];

export default function VotersPage() {
    const [voters, setVoters] = useState<Voter[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<Record<string, string>>({});

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
    const [selectedVoter, setSelectedVoter] = useState<Voter | null>(null);

    const fetchVoters = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
            });

            if (searchQuery) params.append('search', searchQuery);
            if (filters.occupation) params.append('occupation', filters.occupation);
            if (filters.status) params.append('status', filters.status);

            const res = await fetch(`/api/voters?${params}`);
            const data = await res.json();

            if (data.success) {
                setVoters(data.data);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch voters:', error);
        } finally {
            setIsLoading(false);
        }
    }, [pagination.page, pagination.limit, searchQuery, filters]);

    useEffect(() => {
        fetchVoters();
    }, [fetchVoters]);

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const handleFilter = (newFilters: Record<string, string>) => {
        setFilters(newFilters);
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const handlePageChange = (page: number) => {
        setPagination((prev) => ({ ...prev, page }));
    };

    const openModal = (mode: 'add' | 'edit' | 'view', voter?: Voter) => {
        setModalMode(mode);
        setSelectedVoter(voter || null);
        setIsModalOpen(true);
    };

    const handleSave = async (voterData: VoterFormData) => {
        const url = modalMode === 'add' ? '/api/voters' : `/api/voters/${voterData._id}`;
        const method = modalMode === 'add' ? 'POST' : 'PUT';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(voterData),
        });

        const data = await res.json();

        if (!data.success) {
            throw new Error(data.error);
        }

        fetchVoters();
    };

    const handleDelete = async (voter: Voter) => {
        if (!confirm(`Are you sure you want to delete ${voter.name}?`)) return;

        try {
            const res = await fetch(`/api/voters/${voter._id}`, { method: 'DELETE' });
            const data = await res.json();

            if (data.success) {
                fetchVoters();
            }
        } catch (error) {
            console.error('Failed to delete voter:', error);
        }
    };

    const columns = [
        { key: 'sl_no', label: 'SL', className: 'w-20' },
        {
            key: 'name',
            label: 'Name',
            render: (voter: Voter) => (
                <div>
                    <p className="font-medium text-white">{voter.name}</p>
                    <p className="text-xs text-slate-500">{voter.voter_id}</p>
                </div>
            ),
        },
        { key: 'father', label: 'Father' },
        { key: 'mother', label: 'Mother' },
        {
            key: 'occupation',
            label: 'Occupation',
            render: (voter: Voter) => (
                <span className="inline-flex items-center rounded-full bg-violet-500/10 px-2.5 py-0.5 text-xs font-medium text-violet-400">
                    {voter.occupation}
                </span>
            ),
        },
        {
            key: 'dob',
            label: 'DOB',
            render: (voter: Voter) =>
                voter.dob ? new Date(voter.dob).toLocaleDateString('en-GB') : '-',
        },
        {
            key: 'status',
            label: 'Status',
            render: (voter: Voter) => (
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${voter.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}
                >
                    {voter.status}
                </span>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (voter: Voter) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            openModal('view', voter);
                        }}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                        title="View"
                    >
                        <Eye size={16} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            openModal('edit', voter);
                        }}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-cyan-400 transition-colors"
                        title="Edit"
                    >
                        <Pencil size={16} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(voter);
                        }}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-red-400 transition-colors"
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        Voters
                    </h1>
                    <p className="mt-2 text-slate-400">
                        Manage voter registration records
                    </p>
                </div>
                <button
                    onClick={() => openModal('add')}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-5 py-3 font-medium text-white hover:from-violet-500 hover:to-cyan-500 transition-all shadow-lg shadow-violet-500/25"
                >
                    <Plus size={20} />
                    Add Voter
                </button>
            </div>

            {/* Search & Filter */}
            <div className="mb-6">
                <SearchFilter
                    onSearch={handleSearch}
                    onFilter={handleFilter}
                    placeholder="Search by name, voter ID, address..."
                    filters={[
                        { key: 'occupation', label: 'Occupation', options: occupationOptions },
                        {
                            key: 'status',
                            label: 'Status',
                            options: [
                                { value: 'Active', label: 'Active' },
                                { value: 'Deleted', label: 'Deleted' },
                            ],
                        },
                    ]}
                />
            </div>

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={voters}
                pagination={pagination}
                onPageChange={handlePageChange}
                isLoading={isLoading}
                emptyMessage="No voters found. Add a new voter or run the seed script."
            />

            {/* Modal */}
            <VoterModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                voter={selectedVoter}
                mode={modalMode}
            />
        </div>
    );
}
