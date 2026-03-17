import { useLanguage } from "@/contexts/LanguageContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingActionButtons } from "@/components/FloatingActionButtons";
import { GoldDivider } from "@/components/GoldDivider";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
  BlogPostHero,
  BlogPostMeta,
  BlogPostCta,
  ShareButtons,
  MarkdownRenderer,
  getHardcodedPosts,
} from "@/components/blog";

export default function BlogPost() {
  const { language, t } = useLanguage();
  const isHebrew = language === "he";
  const [, params] = useRoute("/blog/:id");
  const postId = params?.id;

  // Try to fetch from DB by slug
  const { data: dbPost } = trpc.blog.getBySlug.useQuery(
    { slug: postId || "" },
    { enabled: !!postId }
  );

  // Hardcoded fallback posts
  const hardcodedPosts = getHardcodedPosts(t);

  // Use DB post if available, otherwise fall back to hardcoded
  const post = dbPost
    ? (() => {
        const content =
          isHebrew && dbPost.contentHe ? dbPost.contentHe : dbPost.content;
        const wordCount = content.split(/\s+/).filter(Boolean).length;
        const minutes = Math.max(1, Math.ceil(wordCount / 200));
        return {
          title: isHebrew && dbPost.titleHe ? dbPost.titleHe : dbPost.title,
          date: dbPost.publishedAt
            ? new Date(dbPost.publishedAt).toLocaleDateString(
                isHebrew ? "he-IL" : "en-US",
                { year: "numeric", month: "long", day: "numeric" }
              )
            : "",
          readTime: `${minutes} ${t("min read", "דק' קריאה")}`,
          image:
            dbPost.coverImage ||
            "/images/optimized/village_hamlet_rice_fields.jpg",
          content,
        };
      })()
    : postId
      ? hardcodedPosts[postId]
      : null;

  usePageMeta({
    title: post?.title ?? "Blog Post",
    description: dbPost?.excerpt ?? "WIRO 4x4 travel blog",
    canonicalPath: `/blog/${postId}`,
    jsonLd: post
      ? {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          datePublished: dbPost?.publishedAt ?? undefined,
          author: { "@type": "Organization", name: "WIRO 4x4" },
          publisher: {
            "@type": "Organization",
            name: "WIRO 4x4",
            url: "https://www.wiro4x4indochina.com",
          },
          image: dbPost?.coverImage || undefined,
        }
      : undefined,
  });

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            {t("Post not found", "הפוסט לא נמצא")}
          </h1>
          <Link href="/blog">
            <Button>{t("Back to Blog", "חזרה לבלוג")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <Breadcrumb
        items={[
          { label: t("Blog", "\u05D1\u05DC\u05D5\u05D2"), href: "/blog" },
          { label: post.title },
        ]}
      />

      <BlogPostHero image={post.image} title={post.title} />

      {/* Article Content */}
      <article className="container max-w-3xl mx-auto -mt-32 relative z-10 pb-20">
        <div
          className="bg-background rounded-sm shadow-premium-lg p-8 md:p-12"
          dir={isHebrew ? "rtl" : undefined}
        >
          {/* Back Button */}
          <Link href="/blog">
            <Button
              variant="ghost"
              className={`mb-6 text-[#D4AF37] ${isHebrew ? "flex-row-reverse" : ""}`}
            >
              <ArrowLeft
                className={`h-4 w-4 ${isHebrew ? "ml-2 rotate-180" : "mr-2"}`}
              />
              {t("Back to Blog", "חזרה לבלוג")}
            </Button>
          </Link>

          <BlogPostMeta date={post.date} readTime={post.readTime} />

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-medium mb-8">
            {post.title}
          </h1>

          <GoldDivider className={`mb-8 ${isHebrew ? "mr-0" : "mx-0"}`} />

          <div className="text-lg leading-relaxed">
            <MarkdownRenderer content={post.content} />
          </div>

          <BlogPostCta />

          <ShareButtons
            url={`/blog/${postId}`}
            title={post.title}
            excerpt={dbPost?.excerpt || ""}
          />
        </div>
      </article>

      <Footer />
      <FloatingActionButtons />
    </div>
  );
}
