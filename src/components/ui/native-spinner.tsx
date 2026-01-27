import { cn } from "./utils";

interface NativeSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  color?: "primary" | "white" | "muted";
}

/**
 * Native-style activity indicator that mimics iOS/Android spinners
 */
export function NativeSpinner({ 
  size = "md", 
  className,
  color = "primary" 
}: NativeSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  const colorClasses = {
    primary: "text-primary",
    white: "text-white",
    muted: "text-muted-foreground"
  };

  return (
    <div className={cn("native-spinner", sizeClasses[size], colorClasses[color], className)}>
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* iOS-style activity indicator with 8 segments */}
        {[...Array(8)].map((_, i) => (
          <line
            key={i}
            x1="12"
            y1="4"
            x2="12"
            y2="8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            style={{
              transform: `rotate(${i * 45}deg)`,
              transformOrigin: "center",
              opacity: 0.2 + (i * 0.1),
            }}
          />
        ))}
      </svg>
    </div>
  );
}

/**
 * Material/Android style circular progress spinner
 */
export function MaterialSpinner({
  size = "md",
  className,
  color = "primary"
}: NativeSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  const colorClasses = {
    primary: "text-primary",
    white: "text-white", 
    muted: "text-muted-foreground"
  };

  return (
    <div className={cn("material-spinner", sizeClasses[size], colorClasses[color], className)}>
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="31.416"
          strokeDashoffset="10"
        />
      </svg>
    </div>
  );
}

/**
 * Universal spinner that uses the appropriate style for the platform
 * Falls back to a smooth CSS-based spinner for best cross-platform experience
 */
export function Spinner({
  size = "md",
  className,
  color = "primary"
}: NativeSpinnerProps) {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  const colorClasses = {
    primary: "border-primary",
    white: "border-white",
    muted: "border-muted-foreground"
  };

  return (
    <div 
      className={cn(
        "spinner-native rounded-full border-2 border-t-transparent",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

/**
 * Full page loading overlay with native spinner
 */
export function LoadingOverlay({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        {message && (
          <p className="text-sm text-muted-foreground font-medium">{message}</p>
        )}
      </div>
    </div>
  );
}

/**
 * Inline loading state for buttons and small components
 */
export function InlineSpinner({ className }: { className?: string }) {
  return (
    <div 
      className={cn(
        "spinner-native w-4 h-4 rounded-full border-2 border-current border-t-transparent",
        className
      )}
    />
  );
}

export { NativeSpinner as IOSSpinner, MaterialSpinner as AndroidSpinner };
