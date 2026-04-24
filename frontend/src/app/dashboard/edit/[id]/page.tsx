'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import dynamic from 'next/dynamic';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [id, setId] = useState('');
    const [form, setForm] = useState({ title: '', content: '', thumbnail: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        params.then(({ id }) => setId(id));
    }, [params]);

    const { isLoading } = useQuery({
        queryKey: ['post-edit', id],
        queryFn: async () => {
            const res = await api.get(`/posts/id/${id}`);
            const post = res.data.data;
            setForm({ title: post.title, content: post.content, thumbnail: post.thumbnail ?? '' });
            return post;
        },
        enabled: !!id,
    });

    const { mutate: updatePost, isPending } = useMutation({
        mutationFn: () => api.patch(`/posts/${id}`, form),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-posts'] });
            router.push('/dashboard');
        },
        onError: (err: any) => setError(err.response?.data?.message || 'Failed to update post'),
    });

    if (isLoading) return <p className="text-center py-20 text-muted-foreground">Loading...</p>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            <h1 className="font-heading text-3xl font-bold mb-8">Edit post</h1>

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">Title</label>
                    <input
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">Thumbnail URL</label>
                    <input
                        value={form.thumbnail}
                        onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                        placeholder="https://..."
                        className="border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">Content</label>
                    <div data-color-mode="light">
                        <MDEditor
                            value={form.content}
                            onChange={(val) => setForm({ ...form, content: val ?? '' })}
                            height={400}
                        />
                    </div>
                </div>

                {error && <p className="text-destructive text-sm">{error}</p>}

                <div className="flex gap-3">
                    <button
                        onClick={() => updatePost()}
                        disabled={isPending || !form.title || !form.content}
                        className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
                    >
                        {isPending ? 'Saving...' : 'Save changes'}
                    </button>
                    <button
                        onClick={() => router.back()}
                        className="border border-border px-6 py-2 rounded-lg text-sm hover:bg-muted transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
