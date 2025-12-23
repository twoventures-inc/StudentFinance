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

const goalSchema = z.object({
  name: z.string().min(1, "Goal name is required").max(50),
  emoji: z.string().min(1, "Emoji is required"),
  target: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Target must be a positive number",
  }),
  current: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "Current amount must be 0 or more",
  }),
});

type GoalFormValues = z.infer<typeof goalSchema>;

interface AddGoalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: GoalFormValues) => void;
}

const emojis = [
  { label: "Laptop", value: "💻" },
  { label: "Travel", value: "✈️" },
  { label: "Car", value: "🚗" },
  { label: "Home", value: "🏠" },
  { label: "Phone", value: "📱" },
  { label: "Camera", value: "📷" },
  { label: "Book", value: "📚" },
  { label: "Game", value: "🎮" },
  { label: "Music", value: "🎵" },
  { label: "Graduation", value: "🎓" },
];

export function AddGoalForm({ open, onOpenChange, onSubmit }: AddGoalFormProps) {
  const { toast } = useToast();
  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: "",
      emoji: "💻",
      target: "",
      current: "0",
    },
  });

  const handleSubmit = (values: GoalFormValues) => {
    onSubmit(values);
    toast({
      title: "Goal Created",
      description: `${values.emoji} ${values.name} - Target: $${values.target}`,
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-savings">Create Savings Goal</DialogTitle>
          <DialogDescription>
            Set a savings goal to track your progress towards something special.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., New Laptop" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="emoji"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an icon" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {emojis.map((emoji) => (
                        <SelectItem key={emoji.value} value={emoji.value}>
                          <span className="flex items-center gap-2">
                            <span className="text-xl">{emoji.value}</span>
                            {emoji.label}
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
              name="target"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Amount ($)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="1000.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="current"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Savings ($)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
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
                Create Goal
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
