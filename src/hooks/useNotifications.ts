import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationService } from '@services/notification.service';
import { QUERY_KEYS } from '@constants/app.constants';

export const useNotifications = () => {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS,
    queryFn: NotificationService.getAll,
    staleTime: 2 * 60 * 1000,
  });

  const { mutateAsync: markRead } = useMutation({
    mutationFn: NotificationService.markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS }),
  });

  const { mutateAsync: markAllRead } = useMutation({
    mutationFn: NotificationService.markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS }),
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return { notifications, unreadCount, isLoading, markRead, markAllRead };
};
