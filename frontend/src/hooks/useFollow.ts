import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import api from '@/lib/api';

export function useFollow(username: string) {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    const { data: profile } = useQuery({
        queryKey: ['profile', username],
        queryFn: async () => {
            const res = await api.get(`/users/${username}/profile`);
            console.log('[useFollow] profile from client:', res.data.data);
            return res.data.data;
        },
        enabled: !!user,
    });

    const followed = profile?.isFollowing ?? false;

    const { mutate: toggleFollow, isPending } = useMutation({
        mutationFn: () => api.post(`/users/${username}/follow`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile', username] });
        },
    });

    return { followed, toggleFollow, isPending };
}
