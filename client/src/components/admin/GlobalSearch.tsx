import { useState, useEffect, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import {
  Search,
  X,
  Calendar,
  TrendingUp,
  Star,
  Mountain,
  Loader2,
} from "lucide-react";

type AdminTabId =
  | "analytics"
  | "crm"
  | "bookings"
  | "calendar"
  | "agents"
  | "leads"
  | "financial"
  | "accounting"
  | "gallery"
  | "reviews"
  | "tours"
  | "packages"
  | "blog"
  | "users"
  | "tripPhotos"
  | "whatsapp"
  | "postTourEmails"
  | "abandoned"
  | "settings";

interface GlobalSearchProps {
  onNavigate: (tab: AdminTabId) => void;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-purple-100 text-purple-800",
  quoted: "bg-indigo-100 text-indigo-800",
  converted: "bg-green-100 text-green-800",
  lost: "bg-red-100 text-red-800",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-800"}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="text-yellow-500 text-xs">
      {"★".repeat(rating)}
      {"☆".repeat(5 - rating)}
    </span>
  );
}

export default function GlobalSearch({ onNavigate }: GlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Debounce the query by 300ms
  useEffect(() => {
    if (query.length < 2) {
      setDebouncedQuery("");
      return;
    }
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // tRPC query
  const { data, isLoading } = trpc.search.global.useQuery(
    { query: debouncedQuery },
    { enabled: debouncedQuery.length >= 2 }
  );

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Auto-focus input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setDebouncedQuery("");
    }
  }, [open]);

  // Close on backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  const handleResultClick = useCallback(
    (tab: AdminTabId) => {
      onNavigate(tab);
      setOpen(false);
    },
    [onNavigate]
  );

  const hasResults =
    data &&
    (data.bookings.length > 0 ||
      data.leads.length > 0 ||
      data.reviews.length > 0 ||
      data.tours.length > 0);

  const showNoResults = debouncedQuery.length >= 2 && !isLoading && !hasResults;
  const showEmpty = debouncedQuery.length < 2 && !isLoading;

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors min-h-[44px] min-w-[44px] justify-center"
        title="Search (⌘K)"
      >
        <Search className="w-4 h-4" />
        <span className="hidden md:inline">Search</span>
        <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-muted rounded border border-border">
          ⌘K
        </kbd>
      </button>

      {/* Dialog overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          <div
            ref={dialogRef}
            className="w-full max-w-lg bg-card rounded-xl shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <Search className="w-5 h-5 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search bookings, leads, reviews, tours..."
                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm"
              />
              {isLoading && (
                <Loader2 className="w-4 h-4 text-muted-foreground animate-spin shrink-0" />
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results area */}
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {/* Empty state */}
              {showEmpty && (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  Type to search across bookings, leads, reviews, and tours
                </div>
              )}

              {/* No results */}
              {showNoResults && (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No results found for &ldquo;{debouncedQuery}&rdquo;
                </div>
              )}

              {/* Results */}
              {data && hasResults && (
                <div className="space-y-1">
                  {/* Bookings */}
                  {data.bookings.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <Calendar className="w-3.5 h-3.5" />
                        Bookings
                      </div>
                      {data.bookings.map(b => (
                        <button
                          key={`booking-${b.id}`}
                          onClick={() => handleResultClick("bookings")}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {b.contactName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {b.contactEmail || "No email"}
                            </p>
                          </div>
                          <StatusBadge status={b.status} />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Leads */}
                  {data.leads.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <TrendingUp className="w-3.5 h-3.5" />
                        Leads
                      </div>
                      {data.leads.map(l => (
                        <button
                          key={`lead-${l.id}`}
                          onClick={() => handleResultClick("leads")}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {l.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {l.email}
                              {l.phone ? ` · ${l.phone}` : ""}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {l.score != null && l.score > 0 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                {l.score}
                              </span>
                            )}
                            <StatusBadge status={l.status} />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Reviews */}
                  {data.reviews.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <Star className="w-3.5 h-3.5" />
                        Reviews
                      </div>
                      {data.reviews.map(r => (
                        <button
                          key={`review-${r.id}`}
                          onClick={() => handleResultClick("reviews")}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-foreground truncate">
                                {r.name}
                              </p>
                              <RatingStars rating={r.rating} />
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {r.text.length > 80
                                ? r.text.slice(0, 80) + "..."
                                : r.text}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Tours */}
                  {data.tours.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <Mountain className="w-3.5 h-3.5" />
                        Tours
                      </div>
                      {data.tours.map(t => (
                        <button
                          key={`tour-${t.id}`}
                          onClick={() => handleResultClick("tours")}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {t.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              /{t.slug}
                            </p>
                          </div>
                          <span className="text-xs font-medium text-foreground shrink-0">
                            &#3647;{t.price.toLocaleString()}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-2 border-t border-border text-xs text-muted-foreground flex items-center justify-between">
              <span>Navigate results with clicks</span>
              <span>
                <kbd className="px-1 py-0.5 bg-muted rounded border border-border font-mono text-[10px]">
                  ESC
                </kbd>{" "}
                to close
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
