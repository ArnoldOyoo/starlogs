import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import StarParticles from "@/components/StarParticles";
import starlogsIcon from "@/assets/starlogs-icon.png";
import { Star, Moon, Telescope, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Star,
    title: "Track Your Sessions",
    description: "Log observation sessions with conditions, equipment, and photos"
  },
  {
    icon: Moon,
    title: "Real-Time Sky Data",
    description: "Get moon phases, weather forecasts, and visibility predictions"
  },
  {
    icon: Telescope,
    title: "Interactive Sky Map",
    description: "Explore the night sky with our interactive star chart"
  }
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [isAnimating, setIsAnimating] = useState(false);

  const markOnboardingSeen = () => {
    localStorage.setItem("starlogs_onboarding_seen", "true");
  };

  const handleGetStarted = () => {
    markOnboardingSeen();
    navigate("/auth");
  };

  const goToStep = (newStep: number) => {
    if (isAnimating || newStep === currentStep) return;
    
    setDirection(newStep > currentStep ? "right" : "left");
    setIsAnimating(true);
    
    setTimeout(() => {
      setCurrentStep(newStep);
      setTimeout(() => setIsAnimating(false), 50);
    }, 150);
  };

  const handleNext = () => {
    if (currentStep < features.length - 1) {
      goToStep(currentStep + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    markOnboardingSeen();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen auth-wave-bg relative flex flex-col overflow-hidden">
      <StarParticles count={60} />
      
      {/* Header */}
      <header className="p-6 relative z-10">
        <div className="flex items-center justify-center gap-3">
          <img src={starlogsIcon} alt="StarLogs" className="w-10 h-10" />
          <span className="font-display text-2xl font-bold text-foreground">StarLogs</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12 relative z-10">
        <div className="max-w-md w-full text-center">
          {/* Feature Carousel with Slide Animation */}
          <div className="mb-8 overflow-hidden">
            <div 
              className={cn(
                "transition-all duration-300 ease-out",
                isAnimating && direction === "right" && "opacity-0 -translate-x-8",
                isAnimating && direction === "left" && "opacity-0 translate-x-8",
                !isAnimating && "opacity-100 translate-x-0"
              )}
            >
              <div className="w-20 h-20 rounded-2xl bg-primary/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6 border border-primary/30">
                {(() => {
                  const IconComponent = features[currentStep].icon;
                  return <IconComponent className="w-10 h-10 text-primary" />;
                })()}
              </div>
              
              <h1 className="font-display text-3xl font-bold text-foreground mb-3">
                {features[currentStep].title}
              </h1>
              <p className="text-muted-foreground text-lg">
                {features[currentStep].description}
              </p>
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => goToStep(index)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  index === currentStep 
                    ? "w-8 bg-primary" 
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handleNext}
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              disabled={isAnimating}
            >
              {currentStep < features.length - 1 ? (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Get Started
                  <Sparkles className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
            
            <Button 
              onClick={handleSkip}
              variant="ghost"
              size="lg"
              className="w-full text-muted-foreground hover:text-foreground"
            >
              Skip to Sign In
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center relative z-10">
        <p className="text-xs text-muted-foreground">
          Your personal stargazing companion
        </p>
      </footer>
    </div>
  );
}
