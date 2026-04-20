'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import api from '@/lib/api';
import { useLike } from '@/hooks/useLike';

interface Props {
    postId: string;
    initialCount: number;
}

export default function LikeButton({ postId, initialCount }: Props) {
   
    const { user } = useAuthStore();
    const { liked, count, toggle, isPending } = useLike(postId, initialCount);

    const handleLike = () => {
        if (!user) return alert('Please login to like posts');
        toggle();
    }

    return (
        <button
            onClick={handleLike}
            disabled={isPending}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${
                liked
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border hover:border-primary hover:text-primary'
            }`}
        >
            <span>{liked ? '♥' : '♡'}</span>
            <span className="text-sm">{count}</span>
        </button>
    );
}
