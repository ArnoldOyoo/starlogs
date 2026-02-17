import { useMemo } from "react";

interface PasswordStrengthIndicatorProps {
  password: string;
}

type StrengthLevel = "weak" | "medium" | "strong";

interface StrengthResult {
  level: StrengthLevel;
  score: number;
  label: string;
}

function calculateStrength(password: string): StrengthResult {
  if (!password) {
    return { level: "weak", score: 0, label: "" };
  }

  let score = 0;

  // Length checks
  if (password.length >= 6) score += 1;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;

  // Character variety checks
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  // Determine level
  if (score <= 2) {
    return { level: "weak", score: 1, label: "Weak" };
  } else if (score <= 4) {
    return { level: "medium", score: 2, label: "Medium" };
  } else {
    return { level: "strong", score: 3, label: "Strong" };
  }
}

export default function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const strength = useMemo(() => calculateStrength(password), [password]);

  if (!password) {
    return null;
  }

  const getBarColor = (barIndex: number): string => {
    if (barIndex > strength.score) {
      return "bg-muted";
    }
    
    switch (strength.level) {
      case "weak":
        return "bg-destructive";
      case "medium":
        return "bg-yellow-500";
      case "strong":
        return "bg-green-500";
      default:
        return "bg-muted";
    }
  };

  const getLabelColor = (): string => {
    switch (strength.level) {
      case "weak":
        return "text-destructive";
      case "medium":
        return "text-yellow-500";
      case "strong":
        return "text-green-500";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3].map((barIndex) => (
          <div
            key={barIndex}
            className={`h-1 flex-1 rounded-full transition-colors duration-200 ${getBarColor(barIndex)}`}
          />
        ))}
      </div>
      <p className={`text-xs ${getLabelColor()}`}>
        {strength.label}
      </p>
    </div>
  );
}
