import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingActionButtons } from "@/components/FloatingActionButtons";
import { GoldDivider } from "@/components/GoldDivider";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, ArrowRight, FileText, Search } from "lucide-react";
import { Link } from "wouter";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { trpc } from "@/lib/trpc";

// Hardcoded fallback posts (used when DB returns empty)
const FALLBACK_POSTS = [
  {
    slug: "kosher-dining-guide",
    title: "Kosher Dining Guide for Northern Thailand",
    titleHe: "איך שומרים כשרות בצפון תאילנד -- המדריך המלא",
    excerpt:
      "Everything you need to know about finding and preparing kosher meals during your Chiang Mai adventure.",
    excerptHe:
      "כל מה שצריך לדעת על אוכל כשר בצ'יאנג מאי -- בית חב\"ד, מסעדות, סופרים, וטיפים מהשטח.",
    coverImage: "/images/1000000149.jpg",
    category: "Food & Kosher",
    tags: "kosher,food,chiang-mai,chabad",
    publishedAt: "2024-12-01",
    content: "",
  },
  {
    slug: "israeli-traveler-tips",
    title: "Israeli Traveler Tips for Southeast Asia",
    titleHe: "המדריך השלם למטייל הישראלי בדרום מזרח אסיה",
    excerpt:
      "Essential advice from experienced Israeli travelers about navigating Thailand, Laos, and Vietnam.",
    excerptHe:
      "טיפים, מידע ועצות מניסיון של שנים -- כסף, בריאות, תחבורה, שבת וקהילה ישראלית.",
    coverImage: "/images/vietnam_rice_terraces.jpg",
    category: "Travel Tips",
    tags: "travel-tips,israel,southeast-asia,budget",
    publishedAt: "2024-12-01",
    content: "",
  },
  {
    slug: "cultural-etiquette",
    title: "Cultural Etiquette Guide for Indochina",
    titleHe: "איך להתנהג באינדוסין -- המדריך התרבותי",
    excerpt:
      "Learn the dos and don'ts of interacting with local communities in Thailand, Laos, and Vietnam.",
    excerptHe:
      "שמירת פנים, מקדשים, נזירים, מיקוח ועוד -- כל הכללים שישראלים צריכים להכיר.",
    coverImage: "/images/1000000135.jpg",
    category: "Culture",
    tags: "culture,etiquette,temples,thailand",
    publishedAt: "2024-12-01",
    content: "",
  },
];

export default function Blog() {
  const { language, t } = useLanguage();
  const isHebrew = language === "he";
  usePageMeta(
    "Travel Blog",
    "Travel tips, kosher dining guides, and cultural insights for Israeli travelers exploring Northern Thailand."
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const gridRef = useScrollReveal<HTMLDivElement>({ stagger: 0.1 });
  const { data: dbPosts } = trpc.blog.list.useQuery();

  // Use DB posts if available, otherwise fallback
  const posts = (dbPosts && dbPosts.length > 0 ? dbPosts : FALLBACK_POSTS).map(
    post => {
      const content = (post as { content?: string }).content || "";
      const wordCount = content.split(/\s+/).filter(Boolean).length;
      const minutes =
        wordCount > 0 ? Math.max(1, Math.ceil(wordCount / 200)) : 0;
      return {
        slug: post.slug,
        title: isHebrew && post.titleHe ? post.titleHe : post.title,
        excerpt:
          isHebrew && post.excerptHe ? post.excerptHe : post.excerpt || "",
        image: post.coverImage || "/images/1000000149.jpg",
        category: post.category || "",
        tags: ((post as { tags?: string }).tags || "")
          .split(",")
          .filter(Boolean),
        readTime: minutes > 0 ? `${minutes} ${t("min", "דק'")}` : "",
        date: post.publishedAt
          ? new Date(post.publishedAt).toLocaleDateString(
              isHebrew ? "he-IL" : "en-US",
              { year: "numeric", month: "long" }
            )
          : "",
      };
    }
  );

  const categories = Array.from(
    new Set(posts.map(p => p.category).filter(Boolean))
  );

  const filteredPosts = posts.filter(post => {
    const matchesSearch =
      !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      !selectedCategory || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen">
      <Header />
      <main id="main-content">
        {/* Hero Section */}
        <section className="relative py-20 mt-20 bg-gradient-to-br from-[#D4AF37]/5 to-[#D4AF37]/10">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-medium mb-6">
                {t("Travel Resources & Guides", "מדריכים וטיפים לטיול")}
              </h1>
              <GoldDivider />
              <p className="text-lg text-muted-foreground">
                {t(
                  "Expert advice and insider tips for Israeli travelers exploring Indochina",
                  "טיפים מקצועיים ומידע פנימי למטיילים ישראלים באינדוסין"
                )}
              </p>
            </div>
          </div>
        </section>

        {/* Search & Filter */}
        <section className="pt-8 pb-0">
          <div className="container max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t("Search articles...", "חיפוש מאמרים...")}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm bg-background"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    !selectedCategory
                      ? "bg-[#D4AF37] text-white"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {t("All", "הכל")}
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() =>
                      setSelectedCategory(cat === selectedCategory ? null : cat)
                    }
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      selectedCategory === cat
                        ? "bg-[#D4AF37] text-white"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-16">
          <div className="container">
            {/* N2: Empty state when no blog posts */}
            {filteredPosts.length === 0 && (
              <div className="text-center py-16">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                  {t("No blog posts yet", "אין פוסטים בבלוג עדיין")}
                </h3>
                <p className="text-muted-foreground">
                  {t(
                    "Check back soon for travel tips and adventure stories!",
                    "חזרו בקרוב - טיפים וסיפורים מהשטח בדרך!"
                  )}
                </p>
              </div>
            )}

            {filteredPosts.length > 0 && (
              <div
                ref={gridRef}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
              >
                {filteredPosts.map(post => (
                  <Card
                    key={post.slug}
                    className="overflow-hidden border-t-2 border-[#D4AF37] rounded-sm hover:shadow-premium-lg transition-all duration-300 hover:-translate-y-2 group"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      {post.category && (
                        <div className="absolute top-4 left-4">
                          <span className="inline-block px-3 py-1 bg-[#D4AF37] text-white text-xs font-semibold rounded-sm">
                            {post.category}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-6 space-y-4">
                      {(post.date || post.readTime) && (
                        <div className="flex items-center gap-4 text-xs text-muted-foreground uppercase tracking-wider">
                          {post.date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{post.date}</span>
                            </div>
                          )}
                          {post.readTime && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{post.readTime}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <h3 className="text-xl font-medium line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {post.excerpt}
                      </p>

                      <Link href={`/blog/${post.slug}`}>
                        <span className="inline-flex items-center gap-2 mt-2 text-[#D4AF37] hover:underline text-sm font-medium">
                          {t("Read More", "קראו עוד")}
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <FloatingActionButtons />
    </div>
  );
}
