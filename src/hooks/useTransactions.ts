import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useEncryption } from '@/contexts/EncryptionContext';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
}

// Fields to encrypt for transactions
const ENCRYPTED_FIELDS = ['description'] as const;

export function useTransactions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isReady: encryptionReady, encryptValue, decryptValue } = useEncryption();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', user?.id, encryptionReady],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      // Decrypt descriptions
      const decryptedData = await Promise.all(
        data.map(async (t) => ({
          id: t.id,
          description: encryptionReady ? await decryptValue(t.description) : t.description,
          amount: Number(t.amount),
          category: t.category,
          date: t.date,
          type: t.type as 'income' | 'expense',
        }))
      );

      return decryptedData;
    },
    enabled: !!user,
  });

  const addTransaction = useMutation({
    mutationFn: async (transaction: Omit<Transaction, 'id'>) => {
      if (!user) throw new Error('Not authenticated');

      // Encrypt description before saving
      const encryptedDescription = encryptionReady
        ? await encryptValue(transaction.description)
        : transaction.description;

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          description: encryptedDescription,
          amount: transaction.amount,
          category: transaction.category,
          date: transaction.date,
          type: transaction.type,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({ title: 'Transaction added successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to add transaction', description: error.message, variant: 'destructive' });
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({ title: 'Transaction deleted' });
    },
  });

  return { transactions, isLoading, addTransaction, deleteTransaction };
}
