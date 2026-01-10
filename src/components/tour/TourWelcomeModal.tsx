import React, { useEffect, useState } from "react";
import { useTour } from "@/contexts/TourContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, BookOpen, ArrowRight } from "lucide-react";

export const TourWelcomeModal: React.FC = () => {
  const { hasSeenTour, startTour, skipTour } = useTour();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!hasSeenTour) {
      // Delay showing the modal so the page loads first
      const timer = setTimeout(() => setOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTour]);

  const handleStartTour = () => {
    setOpen(false);
    startTour();
  };

  const handleSkip = () => {
    setOpen(false);
    skipTour();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl">Welcome to Finance Dashboard! 🎉</DialogTitle>
          <DialogDescription className="text-base mt-2">
            Track your income, expenses, budgets, and savings goals all in one place. 
            Would you like a quick tour of all the features?
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4 space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <BookOpen className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-sm">What you'll learn:</p>
              <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                <li>• Navigate the dashboard efficiently</li>
                <li>• Track income and expenses</li>
                <li>• Set up budgets and goals</li>
                <li>• Use notifications and search</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleSkip} className="sm:flex-1">
            Skip for now
          </Button>
          <Button onClick={handleStartTour} className="sm:flex-1 gap-2">
            Start Tour
            <ArrowRight className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
