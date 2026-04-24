'use client';

import { useAuthStore } from '@/stores/auth.store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Post } from '@/types';

export default function DashboardPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!user) router.push('/login');
        else if (user.role === 'USER') router.push('/');
    }, [user, router]);

    const { data, isLoading } = useQuery({
        queryKey: ['my-posts'],
        queryFn: async () => {
            const res = await api.get('/posts/mine');
            return res.data.data as Post[];
        },
        enabled: !!user,
    });

    const { mutate: togglePublish } = useMutation({
        mutationFn: (postId: string) => api.post(`/posts/${postId}/publish`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-posts'] }),
    });

    const { mutate: deletePost } = useMutation({
        mutationFn: (postId: string) => api.delete(`/posts/${postId}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-posts'] }),
    });

    if (!user || user.role === 'USER') return null;

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-heading text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Manage your posts</p>
                </div>
                <Link
                    href="/dashboard/new"
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
                >
                    + New post
                </Link>
            </div>

            {isLoading ? (
                <p className="text-muted-foreground text-sm">Loading...</p>
            ) : !data?.length ? (
                <p className="text-muted-foreground text-sm">No posts yet. Create your first post!</p>
            ) : (
                <div className="border border-border rounded-xl overflow-hidden">
                    {data.map((post) => (
                        <div key={post.id} className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/30">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{post.title}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {new Date(post.createdAt).toLocaleDateString()} ·{' '}
                                    {post._count?.likes ?? 0} likes · {post._count?.comments ?? 0} comments · {post.viewCount} views
                                </p>
                            </div>

                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                                post.published
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-muted text-muted-foreground'
                            }`}>
                                {post.published ? 'Published' : 'Draft'}
                            </span>

                            <div className="flex items-center gap-2 shrink-0">
                                <Link
                                    href={`/dashboard/edit/${post.id}`}
                                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={() => togglePublish(post.id)}
                                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {post.published ? 'Unpublish' : 'Publish'}
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm('Delete this post?')) deletePost(post.id);
                                    }}
                                    className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
