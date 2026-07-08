import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  usePageMeta("Page Not Found");

  // Keep 404 pages out of search results when reached via client-side
  // navigation (server-side 404s already send X-Robots-Tag: noindex).
  useEffect(() => {
    const meta = document.querySelector('meta[name="robots"]');
    const previous = meta?.getAttribute("content") ?? null;
    meta?.setAttribute("content", "noindex, nofollow");
    return () => {
      if (previous) meta?.setAttribute("content", previous);
    };
  }, []);

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center mt-20">
        <Card className="w-full max-w-lg mx-4 shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse" />
                <AlertCircle className="relative h-16 w-16 text-primary" />
              </div>
            </div>

            <h1 className="text-4xl font-medium text-foreground mb-2">404</h1>

            <h2 className="text-xl font-semibold text-foreground/80 mb-4">
              {t("Page Not Found", "הדף לא נמצא")}
            </h2>

            <p className="text-muted-foreground mb-8 leading-relaxed">
              {t(
                "Sorry, the page you are looking for doesn't exist. It may have been moved or deleted.",
                "מצטערים, הדף שחיפשתם לא קיים. ייתכן שהוא הועבר או נמחק."
              )}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleGoHome}
                className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Home className="w-4 h-4 mr-2" />
                {t("Go Home", "חזרה לדף הבית")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
