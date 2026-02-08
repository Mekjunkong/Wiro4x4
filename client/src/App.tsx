import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import Pricing from "./pages/Pricing";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import BookingForm from "./pages/BookingForm";
import AdminDashboard from "./pages/AdminDashboard";
import Gallery from "./pages/Gallery";
import Reviews from "./pages/Reviews";

/** Scrolls to top on every route change (N1) */
function ScrollToTop() {
  const [location] = useLocation();
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location]);
  return null;
}

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/pricing"} component={Pricing} />
        <Route path={"/blog"} component={Blog} />
        <Route path={"/blog/:id"} component={BlogPost} />
        <Route path={"/gallery"} component={Gallery} />
        <Route path={"/reviews"} component={Reviews} />
        <Route path={"/book"} component={BookingForm} />
        <Route path={"/admin"} component={AdminDashboard} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function AppContent() {
  const { language, t } = useLanguage();

  // Set document language (keep LTR layout for both languages)
  React.useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <TooltipProvider>
      {/* Skip to main content link (I2) — visible only on keyboard focus */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[99999] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:text-sm focus:font-medium focus:shadow-lg"
      >
        {t('Skip to main content', 'דלג לתוכן הראשי')}
      </a>
      <Toaster />
      <ErrorBoundary>
        <Router />
      </ErrorBoundary>
    </TooltipProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        switchable
      >
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
