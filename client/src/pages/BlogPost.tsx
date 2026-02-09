import { useLanguage } from "@/contexts/LanguageContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { usePageMeta } from "@/hooks/usePageMeta";
import {
  BlogPostHero,
  BlogPostMeta,
  BlogPostCta,
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
    ? {
        title: isHebrew && dbPost.titleHe ? dbPost.titleHe : dbPost.title,
        date: dbPost.publishedAt
          ? new Date(dbPost.publishedAt).toLocaleDateString(
              isHebrew ? "he-IL" : "en-US",
              { year: "numeric", month: "long", day: "numeric" }
            )
          : "",
        readTime: "",
        image: dbPost.coverImage || "/images/1000000149.jpg",
        content:
          isHebrew && dbPost.contentHe ? dbPost.contentHe : dbPost.content,
      }
    : postId
      ? hardcodedPosts[postId]
      : null;

  usePageMeta(post?.title ?? "Blog Post", dbPost?.excerpt ?? undefined);

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

      <BlogPostHero image={post.image} title={post.title} />

      {/* Article Content */}
      <article className="container max-w-4xl -mt-32 relative z-10 pb-20">
        <div className="bg-background rounded-lg shadow-premium-lg p-8 md:p-12">
          {/* Back Button */}
          <Link href="/blog">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("Back to Blog", "חזרה לבלוג")}
            </Button>
          </Link>

          <BlogPostMeta date={post.date} readTime={post.readTime} />

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-8">{post.title}</h1>

          <MarkdownRenderer content={post.content} />

          <BlogPostCta />
        </div>
      </article>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
