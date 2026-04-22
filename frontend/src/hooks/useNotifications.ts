import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Notification } from '@/types';
import { useAuthStore } from '@/stores/auth.store';

export function useNotifications() {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    const { data: notifications = [] } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const res = await api.get('/notifications');
            return res.data.data as Notification[];
        },
        refetchInterval: 30000, // poll mỗi 30s
        enabled: !!user,        // chỉ fetch khi đã login
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const { mutate: markAllRead } = useMutation({
        mutationFn: () => api.patch('/notifications/read-all'),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    });

    const { mutate: markOneRead } = useMutation({
        mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    });

    return { notifications, unreadCount, markAllRead, markOneRead };
}
