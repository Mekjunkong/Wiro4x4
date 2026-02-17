import * as Sentry from "@sentry/react";
import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ErrorInfo, ReactNode } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

function useT() {
  try {
    const { t } = useLanguage();
    return t;
  } catch {
    return (en: string, _he: string) => en;
  }
}

function ErrorFallbackSection({
  onReset,
  error,
}: {
  onReset: () => void;
  error: Error | null;
}) {
  const t = useT();
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertTriangle
        size={32}
        className="text-destructive mb-4 flex-shrink-0"
      />
      <h3 className="text-lg font-semibold mb-2">
        {t("Something went wrong", "משהו השתבש")}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-md">
        {t(
          "This section encountered an error. You can try again or reload the page if the problem persists.",
          "הקטע הזה נתקל בשגיאה. אפשר לנסות שוב או לטעון מחדש את הדף."
        )}
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={onReset}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm",
            "bg-primary text-primary-foreground",
            "hover:opacity-90 cursor-pointer"
          )}
        >
          <RotateCcw size={14} />
          {t("Try Again", "נסו שוב")}
        </button>
        <button
          onClick={() => window.location.reload()}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm",
            "border border-border text-muted-foreground",
            "hover:bg-muted cursor-pointer"
          )}
        >
          {t("Reload Page", "טעינה מחדש")}
        </button>
      </div>
      {process.env.NODE_ENV === "development" && error && (
        <div className="mt-4 p-3 w-full rounded bg-muted overflow-auto text-left">
          <pre className="text-xs text-muted-foreground whitespace-break-spaces">
            {error.message}
          </pre>
        </div>
      )}
    </div>
  );
}

function ErrorFallbackPage({
  onReset,
  error,
}: {
  onReset: () => void;
  error: Error | null;
}) {
  const t = useT();
  return (
    <div className="flex items-center justify-center min-h-screen p-8 bg-background">
      <div className="flex flex-col items-center w-full max-w-2xl p-8">
        <AlertTriangle
          size={48}
          className="text-destructive mb-6 flex-shrink-0"
        />
        <h2 className="text-xl font-semibold mb-2">
          {t("An unexpected error occurred", "אירעה שגיאה בלתי צפויה")}
        </h2>
        <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
          {t(
            "The application encountered a problem. You can try again or reload the page.",
            "האפליקציה נתקלה בבעיה. אפשר לנסות שוב או לטעון מחדש."
          )}
        </p>
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onReset}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg",
              "bg-primary text-primary-foreground",
              "hover:opacity-90 cursor-pointer"
            )}
          >
            <RotateCcw size={16} />
            {t("Try Again", "נסו שוב")}
          </button>
          <button
            onClick={() => window.location.reload()}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg",
              "border border-border text-muted-foreground",
              "hover:bg-muted cursor-pointer"
            )}
          >
            {t("Reload Page", "טעינה מחדש")}
          </button>
        </div>
        {error && (
          <div className="p-4 w-full rounded bg-muted overflow-auto">
            <pre className="text-sm text-muted-foreground whitespace-break-spaces">
              {error.stack}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

interface Props {
  children: ReactNode;
  /** Optional custom fallback UI to render when an error is caught. */
  fallback?: ReactNode;
  /**
   * Controls the fallback layout style.
   * - "page" renders a full-screen centered error (suitable for top-level boundaries).
   * - "section" renders a smaller inline error (suitable for tabs, panels, widgets).
   * Defaults to "page".
   */
  level?: "page" | "section";
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("[ErrorBoundary] Caught error:", error);
    console.error("[ErrorBoundary] Component stack:", errorInfo.componentStack);
    if (import.meta.env.VITE_SENTRY_DSN) {
      Sentry.captureException(error, {
        extra: { componentStack: errorInfo.componentStack },
      });
    }
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, render it directly.
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const level = this.props.level ?? "page";

      if (level === "section") {
        return (
          <ErrorFallbackSection
            onReset={this.handleReset}
            error={this.state.error}
          />
        );
      }

      return (
        <ErrorFallbackPage
          onReset={this.handleReset}
          error={this.state.error}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
