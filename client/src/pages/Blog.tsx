import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { usePageMeta } from '@/hooks/usePageMeta';
import { trpc } from '@/lib/trpc';

// Hardcoded fallback posts (used when DB returns empty)
const FALLBACK_POSTS = [
  {
    slug: 'kosher-dining-guide',
    title: 'Kosher Dining Guide for Northern Thailand',
    titleHe: '',
    excerpt: 'Everything you need to know about finding and preparing kosher meals during your Chiang Mai adventure.',
    excerptHe: '',
    coverImage: '/images/1000000149.jpg',
    category: 'Food & Kosher',
    publishedAt: '2024-12-01',
    content: '',
  },
  {
    slug: 'israeli-traveler-tips',
    title: 'Israeli Traveler Tips for Southeast Asia',
    titleHe: '',
    excerpt: 'Essential advice from experienced Israeli travelers about navigating Thailand, Laos, and Vietnam.',
    excerptHe: '',
    coverImage: '/images/vietnam_rice_terraces.jpg',
    category: 'Travel Tips',
    publishedAt: '2024-12-01',
    content: '',
  },
  {
    slug: 'cultural-etiquette',
    title: 'Cultural Etiquette Guide for Indochina',
    titleHe: '',
    excerpt: "Learn the dos and don'ts of interacting with local communities in Thailand, Laos, and Vietnam.",
    excerptHe: '',
    coverImage: '/images/1000000135.jpg',
    category: 'Culture',
    publishedAt: '2024-12-01',
    content: '',
  },
];

export default function Blog() {
  const { language, t } = useLanguage();
  const isHebrew = language === 'he';
  usePageMeta('Travel Blog', 'Travel tips, kosher dining guides, and cultural insights for Israeli travelers exploring Northern Thailand.');

  const { data: dbPosts } = trpc.blog.list.useQuery();

  // Use DB posts if available, otherwise fallback
  const posts = (dbPosts && dbPosts.length > 0 ? dbPosts : FALLBACK_POSTS).map(post => ({
    slug: post.slug,
    title: isHebrew && post.titleHe ? post.titleHe : post.title,
    excerpt: isHebrew && post.excerptHe ? post.excerptHe : (post.excerpt || ''),
    image: post.coverImage || '/images/1000000149.jpg',
    category: post.category || '',
    date: post.publishedAt ? new Date(post.publishedAt).toLocaleDateString(isHebrew ? 'he-IL' : 'en-US', { year: 'numeric', month: 'long' }) : '',
  }));

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {t('Travel Resources & Guides', 'Travel Resources & Guides')}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t(
                'Expert advice and insider tips for Israeli travelers exploring Indochina',
                'Expert advice and insider tips for Israeli travelers exploring Indochina'
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {posts.map((post) => (
              <Card key={post.slug} className="overflow-hidden hover:shadow-premium-lg transition-all duration-300 hover:-translate-y-2 group">
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {post.category && (
                    <div className="absolute top-4 left-4">
                      <span className="inline-block px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                        {post.category}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6 space-y-4">
                  {post.date && (
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{post.date}</span>
                      </div>
                    </div>
                  )}

                  <h3 className="text-xl font-bold line-clamp-2">{post.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>

                  <Link href={`/blog/${post.slug}`}>
                    <Button variant="outline" className="w-full gap-2 mt-2">
                      {t('Read More', 'Read More')}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
