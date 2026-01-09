'use client';

import { Search, X, Filter } from 'lucide-react';
import { useState } from 'react';

interface SearchFilterProps {
    onSearch: (value: string) => void;
    onFilter?: (filters: Record<string, string>) => void;
    placeholder?: string;
    filters?: {
        key: string;
        label: string;
        options?: { value: string; label: string }[];
        type?: 'select' | 'number';
        placeholder?: string;
    }[];
}

export default function SearchFilter({
    onSearch,
    onFilter,
    placeholder = 'Search...',
    filters = [],
}: SearchFilterProps) {
    const [searchValue, setSearchValue] = useState('');
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = (value: string) => {
        setSearchValue(value);
        onSearch(value);
    };

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...activeFilters, [key]: value };
        if (!value) {
            delete newFilters[key];
        }
        setActiveFilters(newFilters);
        onFilter?.(newFilters);
    };

    const clearAll = () => {
        setSearchValue('');
        setActiveFilters({});
        onSearch('');
        onFilter?.({});
    };

    const hasActiveFilters = Object.keys(activeFilters).length > 0 || searchValue;

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
                {/* Search Input */}
                <div className="relative flex-1 min-w-[200px]">
                    <Search
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        size={20}
                    />
                    <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder={placeholder}
                        className="w-full rounded-xl border border-slate-700/50 bg-slate-800/50 py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                    />
                    {searchValue && (
                        <button
                            onClick={() => handleSearch('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>

                {/* Filter Toggle */}
                {filters.length > 0 && (
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 rounded-xl border px-4 py-3 transition-all ${showFilters
                            ? 'border-violet-500 bg-violet-500/10 text-violet-400'
                            : 'border-slate-700/50 bg-slate-800/50 text-slate-300 hover:border-slate-600'
                            }`}
                    >
                        <Filter size={18} />
                        Filters
                        {Object.keys(activeFilters).length > 0 && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 text-xs text-white">
                                {Object.keys(activeFilters).length}
                            </span>
                        )}
                    </button>
                )}

                {/* Clear All */}
                {hasActiveFilters && (
                    <button
                        onClick={clearAll}
                        className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 hover:bg-red-500/20 transition-all"
                    >
                        <X size={18} />
                        Clear All
                    </button>
                )}
            </div>

            {/* Filter Dropdowns and Inputs */}
            {showFilters && filters.length > 0 && (
                <div className="flex flex-wrap gap-3 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                    {filters.map((filter) => (
                        <div key={filter.key} className="min-w-[150px]">
                            <label className="block text-xs font-medium text-slate-400 mb-1">
                                {filter.label}
                            </label>
                            {(!filter.type || filter.type === 'select') ? (
                                <select
                                    value={activeFilters[filter.key] || ''}
                                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                                    className="w-full rounded-lg border border-slate-700/50 bg-slate-800 py-2 px-3 text-sm text-white focus:border-violet-500 focus:outline-none"
                                >
                                    <option value="">All</option>
                                    {filter.options?.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="number"
                                    value={activeFilters[filter.key] || ''}
                                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                                    placeholder={filter.placeholder || ''}
                                    className="w-full rounded-lg border border-slate-700/50 bg-slate-800 py-2 px-3 text-sm text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
                                    min="0"
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
