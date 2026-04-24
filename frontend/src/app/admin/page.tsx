'use client';

import { useAuthStore } from '@/stores/auth.store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import api from '@/lib/api';

export default function AdminPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!user) router.push('/login');
        else if (user.role !== 'ADMIN') router.push('/');
    }, [user, router]);

    const { data: stats } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            const res = await api.get('/admin/stats');
            return res.data.data;
        },
        enabled: user?.role === 'ADMIN',
    });

    const { data: users } = useQuery({
        queryKey: ['admin-users'],
        queryFn: async () => {
            const res = await api.get('/admin/users');
            return res.data.data;
        },
        enabled: user?.role === 'ADMIN',
    });

    const { data: reports } = useQuery({
        queryKey: ['admin-reports'],
        queryFn: async () => {
            const res = await api.get('/reports');
            return res.data.data;
        },
        enabled: user?.role === 'ADMIN',
    });

    const { mutate: banUser } = useMutation({
        mutationFn: (userId: string) => api.patch(`/admin/users/${userId}/ban`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
    });

    const { mutate: updateRole } = useMutation({
        mutationFn: ({ userId, role }: { userId: string; role: string }) =>
            api.patch(`/admin/users/${userId}/role`, { role }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
    });

    const { mutate: updateReportStatus } = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            api.patch(`/reports/${id}/status`, { status }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reports'] }),
    });

    if (!user || user.role !== 'ADMIN') return null;

    return (
        <div className="max-w-5xl mx-auto px-4 py-10 flex flex-col gap-12">
            <h1 className="font-heading text-3xl font-bold">Admin Panel</h1>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-4 gap-4">
                    {[
                        { label: 'Users', value: stats.users },
                        { label: 'Posts', value: stats.posts },
                        { label: 'Comments', value: stats.comments },
                        { label: 'Reports', value: stats.reports },
                    ].map(({ label, value }) => (
                        <div key={label} className="border border-border rounded-xl p-5">
                            <p className="text-muted-foreground text-sm">{label}</p>
                            <p className="font-heading text-3xl font-bold mt-1">{value}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Users */}
            <div>
                <h2 className="font-heading text-xl font-bold mb-4">Users</h2>
                <div className="border border-border rounded-xl overflow-hidden">
                    {users?.map((u: any) => (
                        <div key={u.id} className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{u.name}</p>
                                <p className="text-xs text-muted-foreground">@{u.username} · {u.email}</p>
                            </div>

                            <select
                                value={u.role}
                                onChange={(e) => updateRole({ userId: u.id, role: e.target.value })}
                                className="text-xs border border-input rounded px-2 py-1 bg-background"
                            >
                                <option value="USER">USER</option>
                                <option value="AUTHOR">AUTHOR</option>
                                <option value="ADMIN">ADMIN</option>
                            </select>

                            <button
                                onClick={() => banUser(u.id)}
                                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                                    !u.isActive
                                        ? 'border-green-500 text-green-600 hover:bg-green-50'
                                        : 'border-destructive text-destructive hover:bg-red-50'
                                }`}
                            >
                                {u.isActive ? 'Ban' : 'Unban'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Reports */}
            <div>
                <h2 className="font-heading text-xl font-bold mb-4">Reports</h2>
                {!reports?.length ? (
                    <p className="text-sm text-muted-foreground">No reports.</p>
                ) : (
                    <div className="border border-border rounded-xl overflow-hidden">
                        {reports.map((r: any) => (
                            <div key={r.id} className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium">{r.type} · <span className="text-muted-foreground font-normal">{r.reason}</span></p>
                                    <p className="text-xs text-muted-foreground">by @{r.reporter.username}</p>
                                </div>

                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    r.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                    r.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                                    'bg-muted text-muted-foreground'
                                }`}>
                                    {r.status}
                                </span>

                                {r.status === 'PENDING' && (
                                    <div className="flex gap-2 shrink-0">
                                        <button
                                            onClick={() => updateReportStatus({ id: r.id, status: 'RESOLVED' })}
                                            className="text-xs text-green-600 hover:underline"
                                        >
                                            Resolve
                                        </button>
                                        <button
                                            onClick={() => updateReportStatus({ id: r.id, status: 'DISMISSED' })}
                                            className="text-xs text-muted-foreground hover:underline"
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
