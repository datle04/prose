'use client';

import { useAuthStore } from '@/stores/auth.store';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import api from '@/lib/api';
import { Post } from '@/types';
import PostCard from '@/components/shared/PostCard';

export default function FeedPage() {
    const { user } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!user) router.push('/login');
    }, [user, router]);

    const { data, isLoading } = useQuery({
        queryKey: ['feed'],
        queryFn: async () => {
            const res = await api.get('/posts/feed');
            return res.data.data;
        },
        enabled: !!user,
    });

    if (!user) return null;

    return (
        <div className="max-w-3xl mx-auto px-4 py-10">
            <h1 className="font-heading text-4xl font-bold mb-2">Your feed</h1>
            <p className="text-muted-foreground mb-10">Posts from people you follow</p>

            {isLoading ? (
                <p className="text-muted-foreground text-sm">Loading...</p>
            ) : !data?.posts?.length ? (
                <p className="text-muted-foreground text-sm">
                    No posts yet. Follow some authors to see their posts here.
                </p>
            ) : (
                data.posts.map((post: Post) => (
                    <PostCard key={post.id} post={post} />
                ))
            )}
        </div>
    );
}
