import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    gradient?: string;
}

export default function StatsCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    gradient = 'from-violet-500 to-cyan-500',
}: StatsCardProps) {
    return (
        <div className="relative overflow-hidden rounded-2xl bg-slate-800/50 p-6 border border-slate-700/50 backdrop-blur-sm hover:border-slate-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/5">
            {/* Background gradient accent */}
            <div
                className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${gradient} opacity-20 blur-2xl`}
            />

            <div className="relative z-10">
                {/* Icon */}
                <div
                    className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-br ${gradient} p-3 shadow-lg`}
                >
                    <Icon className="h-6 w-6 text-white" />
                </div>

                {/* Value */}
                <div className="mt-4">
                    <p className="text-3xl font-bold text-white">{value}</p>
                    <p className="mt-1 text-sm text-slate-400">{title}</p>
                </div>

                {/* Trend or Subtitle */}
                {trend && (
                    <div className="mt-3 flex items-center gap-1">
                        <span
                            className={`text-sm font-medium ${trend.isPositive ? 'text-emerald-400' : 'text-red-400'
                                }`}
                        >
                            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
                        </span>
                        <span className="text-xs text-slate-500">vs last month</span>
                    </div>
                )}
                {subtitle && !trend && (
                    <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
                )}
            </div>
        </div>
    );
}
