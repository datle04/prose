'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '@/lib/api';

export function useLike(postId: string, initialCount: number, initialLiked = false) {
  const queryClient = useQueryClient();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);

  const { mutate, isPending } = useMutation({
    mutationFn: () => api.post(`/posts/${postId}/like`),

    onMutate: () => {
      // Lưu trạng thái trước khi thay đổi để rollback
      const prevLiked = liked;
      const prevCount = count;

      setLiked(!prevLiked);
      setCount(prevLiked ? prevCount - 1 : prevCount + 1);

      // Trả về context để onError dùng
      return { prevLiked, prevCount };
    },

    onSuccess: (res) => {
      // Sync với server — server là source of truth
      const { liked: serverLiked, likeCount: serverCount } = res.data.data;
      setLiked(serverLiked);
      if (serverCount !== undefined) {
        setCount(serverCount);
      }
    },

    onError: (_err, _vars, context) => {
      // Rollback về trạng thái trước khi click, không phải initialCount
      if (context) {
        setLiked(context.prevLiked);
        setCount(context.prevCount);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });

  return { liked, count, toggle: mutate, isPending };
}
