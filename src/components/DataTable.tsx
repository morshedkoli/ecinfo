'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Column<T> {
    key: keyof T | string;
    label: string;
    render?: (item: T) => React.ReactNode;
    className?: string;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    onPageChange?: (page: number) => void;
    onRowClick?: (item: T) => void;
    isLoading?: boolean;
    emptyMessage?: string;
}

export default function DataTable<T extends { _id?: string }>({
    columns,
    data,
    pagination,
    onPageChange,
    onRowClick,
    isLoading = false,
    emptyMessage = 'No data found',
}: DataTableProps<T>) {
    const getValue = (item: T, key: string): unknown => {
        const keys = key.split('.');
        let value: unknown = item;
        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = (value as Record<string, unknown>)[k];
            } else {
                return undefined;
            }
        }
        return value;
    };

    if (isLoading) {
        return (
            <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 overflow-hidden">
                <div className="animate-pulse">
                    <div className="h-12 bg-slate-700/50" />
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 border-t border-slate-700/50 bg-slate-800/30" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-700/30">
                            {columns.map((column) => (
                                <th
                                    key={String(column.key)}
                                    className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 ${column.className || ''}`}
                                >
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            data.map((item, index) => (
                                <tr
                                    key={item._id || index}
                                    onClick={() => onRowClick?.(item)}
                                    className={`transition-colors ${onRowClick
                                            ? 'cursor-pointer hover:bg-slate-700/30'
                                            : ''
                                        }`}
                                >
                                    {columns.map((column) => (
                                        <td
                                            key={String(column.key)}
                                            className={`px-6 py-4 text-sm text-slate-300 ${column.className || ''}`}
                                        >
                                            {column.render
                                                ? column.render(item)
                                                : String(getValue(item, String(column.key)) ?? '-')}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-700/50 px-6 py-4">
                    <p className="text-sm text-slate-400">
                        Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                        {pagination.total} results
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onPageChange?.(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="flex items-center gap-1 rounded-lg bg-slate-700/50 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={16} />
                            Previous
                        </button>
                        <div className="flex items-center gap-1">
                            {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                                let pageNum: number;
                                if (pagination.totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (pagination.page <= 3) {
                                    pageNum = i + 1;
                                } else if (pagination.page >= pagination.totalPages - 2) {
                                    pageNum = pagination.totalPages - 4 + i;
                                } else {
                                    pageNum = pagination.page - 2 + i;
                                }

                                return (
                                    <button
                                        key={i}
                                        onClick={() => onPageChange?.(pageNum)}
                                        className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${pageNum === pagination.page
                                                ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white'
                                                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => onPageChange?.(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages}
                            className="flex items-center gap-1 rounded-lg bg-slate-700/50 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
