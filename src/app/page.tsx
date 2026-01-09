'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  MapPin,
  UserCheck,
  UserX,
  Briefcase,
  TrendingUp,
} from 'lucide-react';
import StatsCard from '@/components/StatsCard';
import SearchFilter from '@/components/SearchFilter';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface Stats {
  totalVoters: number;
  deletedVoters: number;
  totalAreas: number;
  occupationStats: { occupation: string; count: number }[];
  areaStats: { area_code: string; count: number }[];
  ageStats: { ageGroup: string; count: number }[];
  recentVoters: { name: string; voter_id: string; occupation: string }[];
}

interface VoterArea {
  voter_area_code: string;
  voter_area_name: string;
  district: string;
}

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Dynamic filter options
  const [occupationOptions, setOccupationOptions] = useState<{ value: string; label: string }[]>([]);
  const [voterAreas, setVoterAreas] = useState<VoterArea[]>([]);

  useEffect(() => {
    fetchStats();
  }, [filters]);

  // Fetch occupations and voter areas on mount
  useEffect(() => {
    fetchInitialOccupations();
    fetchVoterAreas();
  }, []);

  const fetchStats = async () => {
    try {
      const params = new URLSearchParams();

      if (filters.occupation) params.append('occupation', filters.occupation);
      if (filters.status) params.append('status', filters.status);
      if (filters.area_code) params.append('area_code', filters.area_code);
      if (filters.minAge) params.append('minAge', filters.minAge);
      if (filters.maxAge) params.append('maxAge', filters.maxAge);

      const res = await fetch(`/api/stats?${params}`);
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInitialOccupations = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.success && data.data.occupationStats) {
        const uniqueOccupations = data.data.occupationStats
          .map((item: { occupation: string }) => ({
            value: item.occupation,
            label: item.occupation,
          }))
          .sort((a: { label: string }, b: { label: string }) => a.label.localeCompare(b.label));
        setOccupationOptions(uniqueOccupations);
      }
    } catch (error) {
      console.error('Failed to fetch occupations:', error);
    }
  };

  const fetchVoterAreas = async () => {
    try {
      const res = await fetch('/api/voter-areas');
      const data = await res.json();
      if (data.success) {
        setVoterAreas(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch voter areas:', error);
    }
  };

  const handleFilter = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-64 bg-slate-700 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-40 bg-slate-800 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="mt-2 text-slate-400">
          Overview of voter registration data
        </p>
      </div>

      {/* Search & Filter */}
      <div className="mb-6">
        <SearchFilter
          onSearch={() => { }}
          onFilter={handleFilter}
          placeholder="Filter dashboard statistics..."
          filters={[
            {
              key: 'occupation',
              label: 'Occupation',
              options: occupationOptions,
              type: 'select'
            },
            {
              key: 'status',
              label: 'Status',
              options: [
                { value: 'Active', label: 'Active' },
                { value: 'Deleted', label: 'Deleted' },
              ],
              type: 'select'
            },
            {
              key: 'area_code',
              label: 'Voter Area',
              options: voterAreas.map(area => ({
                value: area.voter_area_code,
                label: `${area.voter_area_name} (${area.voter_area_code})`,
              })),
              type: 'select'
            },
            {
              key: 'minAge',
              label: 'Min Age',
              type: 'number',
              placeholder: 'e.g., 18'
            },
            {
              key: 'maxAge',
              label: 'Max Age',
              type: 'number',
              placeholder: 'e.g., 65'
            },
          ]}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Voters"
          value={stats?.totalVoters || 0}
          icon={Users}
          gradient="from-violet-500 to-purple-600"
          subtitle="Active registrations"
        />
        <StatsCard
          title="Voter Areas"
          value={stats?.totalAreas || 0}
          icon={MapPin}
          gradient="from-cyan-500 to-blue-600"
          subtitle="Registered areas"
        />
        <StatsCard
          title="Active Voters"
          value={(stats?.totalVoters || 0) - (stats?.deletedVoters || 0)}
          icon={UserCheck}
          gradient="from-emerald-500 to-green-600"
          subtitle="Currently active"
        />
        <StatsCard
          title="Deleted Records"
          value={stats?.deletedVoters || 0}
          icon={UserX}
          gradient="from-rose-500 to-red-600"
          subtitle="Removed entries"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Occupation Distribution */}
        <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Briefcase className="text-violet-400" size={20} />
            <h2 className="text-lg font-semibold text-white">
              Occupation Distribution
            </h2>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats?.occupationStats?.slice(0, 8) || []}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                <YAxis
                  dataKey="occupation"
                  type="category"
                  stroke="#94a3b8"
                  fontSize={12}
                  width={80}
                  tickFormatter={(value) =>
                    value.length > 12 ? value.slice(0, 12) + '...' : value
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="url(#colorGradient)"
                  radius={[0, 4, 4, 0]}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Age Distribution Pie Chart */}
        <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-cyan-400" size={20} />
            <h2 className="text-lg font-semibold text-white">
              Age Distribution
            </h2>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.ageStats || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props) => {
                    const ageGroup = (props.payload as { ageGroup: string })?.ageGroup;
                    const percent = props.percent ?? 0;
                    return `${ageGroup}: ${(percent * 100).toFixed(0)}%`;
                  }}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stats?.ageStats?.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Voters */}
      <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Recently Added Voters
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                  Name
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                  Voter ID
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                  Occupation
                </th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentVoters?.map((voter, index) => (
                <tr
                  key={index}
                  className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                >
                  <td className="py-3 px-4 text-sm text-white">{voter.name}</td>
                  <td className="py-3 px-4 text-sm text-slate-300 font-mono">
                    {voter.voter_id}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center rounded-full bg-violet-500/10 px-2.5 py-0.5 text-xs font-medium text-violet-400">
                      {voter.occupation}
                    </span>
                  </td>
                </tr>
              ))}
              {(!stats?.recentVoters || stats.recentVoters.length === 0) && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-500">
                    No voters found. Run the seed script to add sample data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
