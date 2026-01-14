import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useEncryption } from '@/contexts/EncryptionContext';

export interface Profile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  currency: string;
  dateFormat: string;
  fontFamily: string;
  budgetAlerts: boolean;
  goalReminders: boolean;
  weeklyReport: boolean;
  monthlyReport: boolean;
  overspendingWarnings: boolean;
}

export function useProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isReady: encryptionReady, encryptValue, decryptValue } = useEncryption();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id, encryptionReady],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      // Decrypt name fields
      const firstName = data.first_name && encryptionReady
        ? await decryptValue(data.first_name)
        : data.first_name;
      const lastName = data.last_name && encryptionReady
        ? await decryptValue(data.last_name)
        : data.last_name;

      return {
        id: data.id,
        firstName,
        lastName,
        currency: data.currency || 'USD',
        dateFormat: data.date_format || 'MM/DD/YYYY',
        fontFamily: data.font_family || 'Inter',
        budgetAlerts: data.budget_alerts ?? true,
        goalReminders: data.goal_reminders ?? true,
        weeklyReport: data.weekly_report ?? false,
        monthlyReport: data.monthly_report ?? true,
        overspendingWarnings: data.overspending_warnings ?? true,
      } as Profile;
    },
    enabled: !!user,
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<Omit<Profile, 'id'>>) => {
      if (!user) throw new Error('Not authenticated');

      const dbUpdates: Record<string, unknown> = {};

      // Encrypt name fields before saving
      if (updates.firstName !== undefined) {
        dbUpdates.first_name = encryptionReady && updates.firstName
          ? await encryptValue(updates.firstName)
          : updates.firstName;
      }
      if (updates.lastName !== undefined) {
        dbUpdates.last_name = encryptionReady && updates.lastName
          ? await encryptValue(updates.lastName)
          : updates.lastName;
      }

      // Non-encrypted fields
      if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
      if (updates.dateFormat !== undefined) dbUpdates.date_format = updates.dateFormat;
      if (updates.fontFamily !== undefined) dbUpdates.font_family = updates.fontFamily;
      if (updates.budgetAlerts !== undefined) dbUpdates.budget_alerts = updates.budgetAlerts;
      if (updates.goalReminders !== undefined) dbUpdates.goal_reminders = updates.goalReminders;
      if (updates.weeklyReport !== undefined) dbUpdates.weekly_report = updates.weeklyReport;
      if (updates.monthlyReport !== undefined) dbUpdates.monthly_report = updates.monthlyReport;
      if (updates.overspendingWarnings !== undefined) dbUpdates.overspending_warnings = updates.overspendingWarnings;

      const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({ title: 'Settings saved successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to save settings', description: error.message, variant: 'destructive' });
    },
  });

  return { profile, isLoading, updateProfile };
}
