import React, { useEffect, useState, useCallback } from "react";
import { useTour } from "@/contexts/TourContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Position {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const TourOverlay: React.FC = () => {
  const { isActive, currentStep, steps, nextStep, prevStep, endTour, skipTour } = useTour();
  const [targetPosition, setTargetPosition] = useState<Position | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const currentTourStep = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const updatePosition = useCallback(() => {
    if (!currentTourStep) return;

    const element = document.querySelector(currentTourStep.target);
    if (element) {
      const rect = element.getBoundingClientRect();
      const padding = 8;
      
      setTargetPosition({
        top: rect.top - padding + window.scrollY,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      });

      // Calculate tooltip position
      const tooltipWidth = 340;
      const tooltipHeight = 200;
      let tooltipTop = 0;
      let tooltipLeft = 0;

      switch (currentTourStep.position) {
        case "top":
          tooltipTop = rect.top + window.scrollY - tooltipHeight - 20;
          tooltipLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case "bottom":
          tooltipTop = rect.bottom + window.scrollY + 20;
          tooltipLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case "left":
          tooltipTop = rect.top + window.scrollY + rect.height / 2 - tooltipHeight / 2;
          tooltipLeft = rect.left - tooltipWidth - 20;
          break;
        case "right":
          tooltipTop = rect.top + window.scrollY + rect.height / 2 - tooltipHeight / 2;
          tooltipLeft = rect.right + 20;
          break;
      }

      // Keep tooltip within viewport
      const maxLeft = window.innerWidth - tooltipWidth - 20;
      const maxTop = window.innerHeight + window.scrollY - tooltipHeight - 20;
      
      tooltipLeft = Math.max(20, Math.min(tooltipLeft, maxLeft));
      tooltipTop = Math.max(20, Math.min(tooltipTop, maxTop));

      setTooltipPosition({ top: tooltipTop, left: tooltipLeft });

      // Scroll element into view
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      setTargetPosition(null);
    }
  }, [currentTourStep]);

  useEffect(() => {
    if (isActive) {
      updatePosition();
      
      const handleResize = () => updatePosition();
      const handleScroll = () => updatePosition();
      
      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleScroll, true);
      
      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleScroll, true);
      };
    }
  }, [isActive, currentStep, updatePosition]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive) return;
      
      if (e.key === "Escape") {
        skipTour();
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        nextStep();
      } else if (e.key === "ArrowLeft") {
        prevStep();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, nextStep, prevStep, skipTour]);

  if (!isActive || !currentTourStep) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Dark overlay with spotlight */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={skipTour} />
      
      {/* Spotlight highlight */}
      {targetPosition && (
        <div
          className="absolute rounded-lg ring-4 ring-primary ring-offset-2 ring-offset-background transition-all duration-300 ease-out"
          style={{
            top: targetPosition.top,
            left: targetPosition.left,
            width: targetPosition.width,
            height: targetPosition.height,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)",
            backgroundColor: "transparent",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Tooltip Card */}
      <Card
        className={cn(
          "absolute w-[340px] z-[101] shadow-2xl border-primary/20 animate-in fade-in-0 zoom-in-95 duration-300",
          "bg-gradient-to-br from-card to-card/95"
        )}
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{currentTourStep.title}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={skipTour}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Progress value={progress} className="h-1.5 mt-3" />
        </CardHeader>
        
        <CardContent className="pb-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {currentTourStep.description}
          </p>
        </CardContent>

        <CardFooter className="flex items-center justify-between pt-0">
          <span className="text-xs text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </span>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" size="sm" onClick={prevStep}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            <Button size="sm" onClick={nextStep}>
              {currentStep === steps.length - 1 ? (
                "Finish Tour"
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
