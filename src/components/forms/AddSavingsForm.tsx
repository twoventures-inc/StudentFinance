import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Goal } from "@/components/dashboard/SavingsGoal";

const savingsSchema = z.object({
  goalId: z.string().min(1, "Goal is required"),
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount must be a positive number",
  }),
});

type SavingsFormValues = z.infer<typeof savingsSchema>;

interface AddSavingsFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goals: Goal[];
  onSubmit: (data: SavingsFormValues) => void;
}

export function AddSavingsForm({ open, onOpenChange, goals, onSubmit }: AddSavingsFormProps) {
  const { toast } = useToast();
  const form = useForm<SavingsFormValues>({
    resolver: zodResolver(savingsSchema),
    defaultValues: {
      goalId: "",
      amount: "",
    },
  });

  const handleSubmit = (values: SavingsFormValues) => {
    const goal = goals.find((g) => g.id === values.goalId);
    onSubmit(values);
    toast({
      title: "Savings Added",
      description: `$${values.amount} added to ${goal?.name || "goal"}`,
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-savings">Add to Savings</DialogTitle>
          <DialogDescription>
            Add money to one of your savings goals.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="goalId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Goal</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a savings goal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {goals.map((goal) => (
                        <SelectItem key={goal.id} value={goal.id}>
                          <span className="flex items-center gap-2">
                            <span>{goal.emoji}</span>
                            {goal.name} (${goal.current} / ${goal.target})
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount to Add ($)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="50.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-savings hover:bg-savings/90">
                Add Savings
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
