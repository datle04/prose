'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';

export default function LoginPage() {
    const router = useRouter();
    const { setAuth } = useAuthStore();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await api.post('/auth/login', form);
            const { user, access_token } = res.data.data;
            setAuth(user, access_token);
            router.push('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <h1 className="font-heading text-3xl font-bold mb-2">Welcome back</h1>
                <p className="text-muted-foreground mb-8">Sign in to your account</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium">Email</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium">Password</label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            className="border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && <p className="text-destructive text-sm">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary text-primary-foreground rounded-lg py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                <p className="text-sm text-muted-foreground text-center mt-6">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-primary font-medium hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
