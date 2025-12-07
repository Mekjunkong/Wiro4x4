import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';

export default function Blog() {
  const { t } = useLanguage();

  const posts = [
    {
      id: 'kosher-dining-guide',
      title: t('Kosher Dining Guide for Northern Thailand', 'מדריך אוכל כשר לצפון תאילנד'),
      excerpt: t(
        'Everything you need to know about finding and preparing kosher meals during your Chiang Mai adventure.',
        'כל מה שצריך לדעת על מציאת והכנת ארוחות כשרות במהלך ההרפתקה שלכם בצ\'יאנג מאי.'
      ),
      date: t('December 2024', 'דצמבר 2024'),
      readTime: t('8 min read', '8 דקות קריאה'),
      image: '/images/1000000149.jpg',
      category: t('Food & Kosher', 'אוכל וכשרות'),
    },
    {
      id: 'israeli-traveler-tips',
      title: t('Israeli Traveler Tips for Southeast Asia', 'טיפים לישראלים בדרום מזרח אסיה'),
      excerpt: t(
        'Essential advice from experienced Israeli travelers about navigating Thailand, Laos, and Vietnam.',
        'עצות חיוניות ממטיילים ישראלים מנוסים על ניווט בתאילנד, לאוס ווייטנאם.'
      ),
      date: t('December 2024', 'דצמבר 2024'),
      readTime: t('10 min read', '10 דקות קריאה'),
      image: '/images/vietnam_rice_terraces.jpg',
      category: t('Travel Tips', 'טיפים לטיול'),
    },
    {
      id: 'cultural-etiquette',
      title: t('Cultural Etiquette Guide for Indochina', 'מדריך נימוסים תרבותיים לאינדוסין'),
      excerpt: t(
        'Learn the dos and don\'ts of interacting with local communities in Thailand, Laos, and Vietnam.',
        'למדו את מה מותר ומה אסור באינטראקציה עם קהילות מקומיות בתאילנד, לאוס ווייטנאם.'
      ),
      date: t('December 2024', 'דצמבר 2024'),
      readTime: t('7 min read', '7 דקות קריאה'),
      image: '/images/1000000135.jpg',
      category: t('Culture', 'תרבות'),
    },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {t('Travel Resources & Guides', 'משאבי טיול ומדריכים')}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t(
                'Expert advice and insider tips for Israeli travelers exploring Indochina',
                'עצות מומחים וטיפים פנימיים למטיילים ישראלים החוקרים את אינדוסין'
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
              <Card key={post.id} className="overflow-hidden hover:shadow-premium-lg transition-all duration-300 hover:-translate-y-2 group">
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="inline-block px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                      {post.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{post.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold line-clamp-2">{post.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>

                  <Link href={`/blog/${post.id}`}>
                    <Button variant="outline" className="w-full gap-2 mt-2">
                      {t('Read More', 'קרא עוד')}
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
