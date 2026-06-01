import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { fetchReminders, addReminder, updateReminder, deleteReminder, toggleReminder } from '@store/slices/reminder.slice';
import { Reminder } from '@/types/analytics.types';

export const useReminders = () => {
  const dispatch = useAppDispatch();
  const { items: reminders, isLoading, error } = useAppSelector((s) => s.reminder);

  const loadReminders = useCallback(() => dispatch(fetchReminders()), [dispatch]);

  const createReminder = useCallback(
    (payload: Reminder) => dispatch(addReminder(payload)),
    [dispatch]
  );

  const editReminder = useCallback(
    (payload: Reminder) => dispatch(updateReminder(payload)),
    [dispatch]
  );

  const removeReminder = useCallback(
    (id: string) => dispatch(deleteReminder(id)),
    [dispatch]
  );

  const toggle = useCallback(
    (id: string) => dispatch(toggleReminder(id)),
    [dispatch]
  );

  const activeReminders = reminders.filter((r) => r.isActive);
  const inactiveReminders = reminders.filter((r) => !r.isActive);

  return {
    reminders,
    activeReminders,
    inactiveReminders,
    isLoading,
    error,
    loadReminders,
    createReminder,
    editReminder,
    removeReminder,
    toggle,
  };
};
