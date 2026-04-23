'use client';

import { useAuthStore } from '@/stores/auth.store';
import { useFollow } from '@/hooks/useFollow';
import { useEffect } from 'react';

export default function FollowButton({ username }: { username: string }) {
    const { user } = useAuthStore();
    const { followed, toggleFollow, isPending } = useFollow(username);

    if (!user || user.username === username) return null;

    return (
        <button
            onClick={() => toggleFollow()}
            disabled={isPending}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50 ${
                followed
                    ? 'border border-border hover:border-destructive hover:text-destructive'
                    : 'bg-primary text-primary-foreground hover:opacity-90'
            }`}
        >
            {followed ? 'Following' : 'Follow'}
        </button>
    );
}
