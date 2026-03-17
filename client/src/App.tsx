import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
const Home = React.lazy(() => import("./pages/Home"));
import { CookieConsent } from "./components/CookieConsent";
import { ScrollProgress } from "./components/ScrollProgress";
import { CustomCursor } from "./components/CustomCursor";
import { captureUtmParams } from "@/lib/utm";

const Pricing = React.lazy(() => import("./pages/Pricing"));
const Estimate = React.lazy(() => import("./pages/Estimate"));
const TourDetail = React.lazy(() => import("./pages/TourDetail"));
const Blog = React.lazy(() => import("./pages/Blog"));
const BlogPost = React.lazy(() => import("./pages/BlogPost"));
const BookingForm = React.lazy(() => import("./pages/BookingForm"));
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));
const Gallery = React.lazy(() => import("./pages/Gallery"));
const Reviews = React.lazy(() => import("./pages/Reviews"));
const BookingSuccess = React.lazy(() => import("./pages/BookingSuccess"));
const BookingCancel = React.lazy(() => import("./pages/BookingCancel"));
const TermsOfService = React.lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = React.lazy(() => import("./pages/PrivacyPolicy"));
const KosherTours = React.lazy(() => import("./pages/KosherTours"));
const HebrewGuide = React.lazy(() => import("./pages/HebrewGuide"));
const AccessibleTours = React.lazy(() => import("./pages/AccessibleTours"));
const ToursListing = React.lazy(() => import("./pages/ToursListing"));
const Packages = React.lazy(() => import("./pages/Packages"));
const PackageDetail = React.lazy(() => import("./pages/PackageDetail"));
const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register"));
const ForgotPassword = React.lazy(() => import("./pages/ForgotPassword"));

/** Scrolls to top on every route change (N1) */
function ScrollToTop() {
  const [location] = useLocation();
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location]);
  return null;
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  );
}

function Router() {
  const [location] = useLocation();
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  React.useEffect(() => {
    captureUtmParams();
  }, []);

  return (
    <>
      <ScrollToTop />
      <React.Suspense fallback={<LoadingSpinner />}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location}
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.3, ease: "easeInOut" }
            }
          >
            <Switch>
              <Route path={"/"} component={Home} />
              <Route path={"/pricing"} component={Pricing} />
              <Route path={"/estimate"} component={Estimate} />
              <Route path={"/tours"} component={ToursListing} />
              <Route path={"/tours/:slug"} component={TourDetail} />
              <Route path={"/packages"} component={Packages} />
              <Route path={"/packages/:slug"} component={PackageDetail} />
              <Route path={"/blog"} component={Blog} />
              <Route path={"/blog/:id"} component={BlogPost} />
              <Route path={"/gallery"} component={Gallery} />
              <Route path={"/reviews"} component={Reviews} />
              <Route path={"/book"} component={BookingForm} />
              <Route path={"/booking/success"} component={BookingSuccess} />
              <Route path={"/booking/cancel"} component={BookingCancel} />
              <Route path={"/kosher-tours"} component={KosherTours} />
              <Route path={"/hebrew-guide"} component={HebrewGuide} />
              <Route path={"/accessible-tours"} component={AccessibleTours} />
              <Route path={"/terms"} component={TermsOfService} />
              <Route path={"/privacy"} component={PrivacyPolicy} />
              <Route path={"/login"} component={Login} />
              <Route path={"/register"} component={Register} />
              <Route path={"/forgot-password"} component={ForgotPassword} />
              <Route path={"/admin"} component={AdminDashboard} />
              <Route path={"/404"} component={NotFound} />
              {/* Final fallback route */}
              <Route component={NotFound} />
            </Switch>
          </motion.div>
        </AnimatePresence>
      </React.Suspense>
    </>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function AppContent() {
  const { language, t } = useLanguage();

  // Set document language and direction
  React.useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "he" ? "rtl" : "ltr";
  }, [language]);

  return (
    <TooltipProvider>
      <ScrollProgress />
      <CustomCursor />
      {/* Skip to main content link (I2) — visible only on keyboard focus */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[99999] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:text-sm focus:font-medium focus:shadow-lg"
      >
        {t("Skip to main content", "דלג לתוכן הראשי")}
      </a>
      <Toaster />
      <ErrorBoundary>
        <Router />
      </ErrorBoundary>
      <CookieConsent />
    </TooltipProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
