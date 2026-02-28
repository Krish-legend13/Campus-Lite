'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function AdminDashboard() {
    const { role, consentGiven, logout } = useStore();
    const router = useRouter();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        if (!consentGiven || role !== 'Admin') {
            router.push('/');
            return;
        }

        fetch('http://localhost:8000/admin/stats')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error(err));
    }, [role, consentGiven, router]);

    if (!consentGiven || role !== 'Admin') return null;

    const chartData = stats ? [
        { name: 'Phishing Clicks', count: stats.total_phishing_clicks },
        { name: 'Lessons Completed', count: stats.total_lessons_completed }
    ] : [];

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Organization Security Dashboard</h1>
                    <button onClick={() => { logout(); router.push('/'); }} className="text-sm border border-gray-300 px-4 py-2 rounded shadow-sm hover:bg-gray-100">
                        Logout
                    </button>
                </div>

                {stats?.privacy_noise_applied && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r shadow-sm">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <span className="text-blue-500 font-bold">🛡️ Privacy First</span>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-blue-700">
                                    Data in this dashboard has been protected using statistical noise injection.
                                    Individual users cannot be de-anonymized from these aggregated totals.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow border border-gray-200 text-center">
                        <div className="text-sm font-medium text-gray-500 uppercase">Phishing Links Clicked</div>
                        <div className="mt-2 text-4xl font-black text-red-600">{stats?.total_phishing_clicks ?? '-'}</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow border border-gray-200 text-center">
                        <div className="text-sm font-medium text-gray-500 uppercase">Micro-Lessons Completed</div>
                        <div className="mt-2 text-4xl font-black text-green-600">{stats?.total_lessons_completed ?? '-'}</div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow border border-gray-200 h-96 mt-8">
                    <h3 className="text-lg font-bold mb-6 text-gray-800">Engagement Metrics</h3>
                    {stats ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" tick={{ fill: '#6B7280' }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fill: '#6B7280' }} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">Loading metrics...</div>
                    )}
                </div>
            </div>
        </div>
    );
}
