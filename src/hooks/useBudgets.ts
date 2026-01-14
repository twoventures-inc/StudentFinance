import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useEncryption } from '@/contexts/EncryptionContext';

export interface Budget {
  id: string;
  category: string;
  spent: number;
  limit: number;
  color: string;
}

export function useBudgets() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isReady: encryptionReady, encryptValue, decryptValue } = useEncryption();

  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ['budgets', user?.id, encryptionReady],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Decrypt category names
      const decryptedData = await Promise.all(
        data.map(async (b) => ({
          id: b.id,
          category: encryptionReady ? await decryptValue(b.category) : b.category,
          spent: Number(b.spent),
          limit: Number(b.budget_limit),
          color: b.color,
        }))
      );

      return decryptedData;
    },
    enabled: !!user,
  });

  const addBudget = useMutation({
    mutationFn: async (budget: Omit<Budget, 'id' | 'spent'>) => {
      if (!user) throw new Error('Not authenticated');

      // Encrypt category before saving
      const encryptedCategory = encryptionReady
        ? await encryptValue(budget.category)
        : budget.category;

      const { data, error } = await supabase
        .from('budgets')
        .insert({
          user_id: user.id,
          category: encryptedCategory,
          budget_limit: budget.limit,
          color: budget.color,
          spent: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast({ title: 'Budget created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to create budget', description: error.message, variant: 'destructive' });
    },
  });

  const updateBudget = useMutation({
    mutationFn: async ({ id, spent }: { id: string; spent: number }) => {
      const { error } = await supabase
        .from('budgets')
        .update({ spent })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  const deleteBudget = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('budgets').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast({ title: 'Budget deleted' });
    },
  });

  return { budgets, isLoading, addBudget, updateBudget, deleteBudget };
}
