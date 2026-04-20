'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/auth/register', form);
            router.push('/login');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <h1 className="font-heading text-3xl font-bold mb-2">Create account</h1>
                <p className="text-muted-foreground mb-8">Start your blogging journey</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {[
                        { label: 'Full name', key: 'name', type: 'text', placeholder: 'John Doe' },
                        { label: 'Username', key: 'username', type: 'text', placeholder: 'johndoe' },
                        { label: 'Email', key: 'email', type: 'email', placeholder: 'you@example.com' },
                        { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
                    ].map(({ label, key, type, placeholder }) => (
                        <div key={key} className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium">{label}</label>
                            <input
                                type={type}
                                value={form[key as keyof typeof form]}
                                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                className="border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                                placeholder={placeholder}
                                required
                            />
                        </div>
                    ))}

                    {error && <p className="text-destructive text-sm">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary text-primary-foreground rounded-lg py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {loading ? 'Creating account...' : 'Create account'}
                    </button>
                </form>

                <p className="text-sm text-muted-foreground text-center mt-6">
                    Already have an account?{' '}
                    <Link href="/login" className="text-primary font-medium hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
