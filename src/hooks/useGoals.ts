import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Goal {
  id: string;
  name: string;
  emoji: string;
  current: number;
  target: number;
}

export function useGoals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data.map(g => ({
        id: g.id,
        name: g.name,
        emoji: g.emoji || '🎯',
        current: Number(g.current_amount),
        target: Number(g.target_amount),
      }));
    },
    enabled: !!user,
  });

  const addGoal = useMutation({
    mutationFn: async (goal: Omit<Goal, 'id'>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          name: goal.name,
          emoji: goal.emoji,
          current_amount: goal.current,
          target_amount: goal.target,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({ title: 'Goal created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to create goal', description: error.message, variant: 'destructive' });
    },
  });

  const addSavings = useMutation({
    mutationFn: async ({ goalId, amount }: { goalId: string; amount: number }) => {
      // First get the current amount
      const { data: goal, error: fetchError } = await supabase
        .from('goals')
        .select('current_amount, target_amount')
        .eq('id', goalId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const newAmount = Math.min(Number(goal.current_amount) + amount, Number(goal.target_amount));
      
      const { error } = await supabase
        .from('goals')
        .update({ current_amount: newAmount })
        .eq('id', goalId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({ title: 'Savings added successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to add savings', description: error.message, variant: 'destructive' });
    },
  });

  const deleteGoal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('goals').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({ title: 'Goal deleted' });
    },
  });

  return { goals, isLoading, addGoal, addSavings, deleteGoal };
}
