import React, { createContext, useContext, useState, useEffect } from "react";

export interface TourStep {
  id: string;
  target: string; // CSS selector for the element to highlight
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right";
  page?: string; // Optional: which page this step belongs to
}

interface TourContextType {
  isActive: boolean;
  currentStep: number;
  steps: TourStep[];
  startTour: () => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  hasSeenTour: boolean;
  skipTour: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    target: "[data-tour='welcome']",
    title: "Welcome to Your Financial Dashboard! 🎉",
    description: "This tour will guide you through all the features to help you manage your finances effectively. Let's get started!",
    position: "bottom",
    page: "/",
  },
  {
    id: "sidebar",
    target: "[data-tour='sidebar']",
    title: "Navigation Sidebar",
    description: "Use the sidebar to navigate between different sections: Dashboard, Transactions, Budgets, and Goals. You can collapse it for more space.",
    position: "right",
    page: "/",
  },
  {
    id: "quick-actions-sidebar",
    target: "[data-tour='quick-actions']",
    title: "Quick Actions",
    description: "Quickly add new income or expenses with these shortcut buttons. No need to navigate away from your current view!",
    position: "right",
    page: "/",
  },
  {
    id: "search",
    target: "[data-tour='search']",
    title: "Search Transactions",
    description: "Use the search bar to quickly find specific transactions by description or category. Great for tracking specific expenses!",
    position: "bottom",
    page: "/",
  },
  {
    id: "notifications",
    target: "[data-tour='notifications']",
    title: "Real-Time Notifications",
    description: "Stay updated with real-time notifications for new transactions. The badge shows unread notifications count. You can mark them as read individually or all at once.",
    position: "bottom",
    page: "/",
  },
  {
    id: "profile",
    target: "[data-tour='profile']",
    title: "Your Profile",
    description: "Access your profile settings, customize your preferences, and sign out from here.",
    position: "bottom",
    page: "/",
  },
  {
    id: "overview-cards",
    target: "[data-tour='overview-cards']",
    title: "Financial Overview",
    description: "Get a quick snapshot of your finances - total balance, monthly income, and expenses. These update automatically as you add transactions.",
    position: "bottom",
    page: "/",
  },
  {
    id: "expense-chart",
    target: "[data-tour='expense-chart']",
    title: "Expense Breakdown",
    description: "Visualize where your money goes with this interactive pie chart. Hover over sections to see category details and percentages.",
    position: "right",
    page: "/",
  },
  {
    id: "budget-progress",
    target: "[data-tour='budget-progress']",
    title: "Budget Tracking",
    description: "Monitor your spending against set budget limits. Progress bars turn red when you're approaching or exceeding your budget.",
    position: "right",
    page: "/",
  },
  {
    id: "quick-actions-main",
    target: "[data-tour='quick-actions-main']",
    title: "Quick Actions Panel",
    description: "Add income, expenses, or create new budgets with one click. These are your most-used actions in one convenient place.",
    position: "left",
    page: "/",
  },
  {
    id: "recent-transactions",
    target: "[data-tour='recent-transactions']",
    title: "Recent Transactions",
    description: "View your latest transactions at a glance. Click 'See All' to view and manage all your transactions.",
    position: "left",
    page: "/",
  },
  {
    id: "settings",
    target: "[data-tour='settings']",
    title: "Settings",
    description: "Customize your experience! Change currency, date format, notification preferences, and update your profile.",
    position: "right",
    page: "/",
  },
];

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTour, setHasSeenTour] = useState(true);

  useEffect(() => {
    const tourSeen = localStorage.getItem("finance-dashboard-tour-completed");
    if (!tourSeen) {
      setHasSeenTour(false);
    }
  }, []);

  const startTour = () => {
    setCurrentStep(0);
    setIsActive(true);
  };

  const endTour = () => {
    setIsActive(false);
    setCurrentStep(0);
    localStorage.setItem("finance-dashboard-tour-completed", "true");
    setHasSeenTour(true);
  };

  const skipTour = () => {
    setIsActive(false);
    setCurrentStep(0);
    localStorage.setItem("finance-dashboard-tour-completed", "true");
    setHasSeenTour(true);
  };

  const nextStep = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      endTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < TOUR_STEPS.length) {
      setCurrentStep(step);
    }
  };

  return (
    <TourContext.Provider
      value={{
        isActive,
        currentStep,
        steps: TOUR_STEPS,
        startTour,
        endTour,
        nextStep,
        prevStep,
        goToStep,
        hasSeenTour,
        skipTour,
      }}
    >
      {children}
    </TourContext.Provider>
  );
};

export const useTour = () => {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return context;
};
