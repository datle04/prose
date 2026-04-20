import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Comment } from '@/types';

export function useComments(postId: string) {
    const queryClient = useQueryClient();

    const { data: comments = [], isLoading } = useQuery({
        queryKey: ['comments', postId],
        queryFn: async () => {
            const res = await api.get(`/posts/${postId}/comments`);   
            return res.data.data as Comment[];
        },
    });

    const { mutate: addComment, isPending: isAdding } = useMutation({
        mutationFn: (content: string) =>
            api.post(`/posts/${postId}/comments`, { content }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', postId] });
        },
    });

    const { mutate: deleteComment } = useMutation({
        mutationFn: (commentId: string) =>
            api.delete(`/comments/${commentId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', postId] });
        },
    });

    const { mutate: addReply, isPending: isReplying } = useMutation({
        mutationFn: ({ content, parentId }: { content: string; parentId: string }) =>
            api.post(`/posts/${postId}/comments`, { content, parentId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', postId] });
        },
    });

    return { comments, isLoading, addComment, isAdding, deleteComment, addReply, isReplying };
}
