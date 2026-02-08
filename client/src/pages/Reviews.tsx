import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, MessageSquare, Send } from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageMeta';

const TOUR_TYPES = [
  { id: 'waterfall', en: 'Waterfall Adventure', he: 'הרפתקאות מפלים' },
  { id: 'mountain', en: 'Mountain Explorer', he: 'חוקר הרים' },
  { id: 'cultural', en: 'Cultural Journey', he: 'מסע תרבותי' },
  { id: 'multi-day', en: 'Multi-Day Expedition', he: 'משלחת רב-יומית' },
  { id: 'custom', en: 'Custom Tour', he: 'סיור מותאם אישית' },
];

function StarRating({ rating, onRate, interactive = false }: { rating: number; onRate?: (r: number) => void; interactive?: boolean }) {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const { t } = useLanguage();

  const displayRating = interactive && hoveredStar !== null ? hoveredStar : rating;

  if (!interactive) {
    return (
      <div className="flex gap-1" role="img" aria-label={t(`${rating} out of 5 stars`, `${rating} מתוך 5 כוכבים`)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            aria-hidden="true"
          >
            ★
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-1" role="radiogroup" aria-label={t('Star rating', 'דירוג כוכבים')}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
            star <= displayRating ? 'text-yellow-400' : 'text-gray-300'
          } hover:scale-110`}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => setHoveredStar(star)}
          onMouseLeave={() => setHoveredStar(null)}
          aria-label={t(`Rate ${star} out of 5 stars`, `דרג ${star} מתוך 5 כוכבים`)}
          role="radio"
          aria-checked={star === rating}
        >
          <span className="text-2xl leading-none select-none" style={{ fontSize: '24px' }} aria-hidden="true">★</span>
        </button>
      ))}
    </div>
  );
}

export default function Reviews() {
  const { t, language } = useLanguage();
  const isHebrew = language === 'he';
  usePageMeta('Guest Reviews', 'Read what our guests say about their WIRO 4x4 kosher off-road adventures in Chiang Mai.');
  const [filterTourType, setFilterTourType] = useState('all');
  const [showSuccess, setShowSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const REVIEWS_PER_PAGE = 6;
  const [visibleCount, setVisibleCount] = useState(REVIEWS_PER_PAGE);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 5,
    text: '',
    tourType: '',
  });

  const { data: reviewsList, isLoading } = trpc.review.listPublic.useQuery();
  const utils = trpc.useUtils();

  const createReview = trpc.review.create.useMutation({
    onSuccess: () => {
      setShowSuccess(true);
      setFormError('');
      setFormData({ name: '', email: '', rating: 5, text: '', tourType: '' });
      utils.review.listPublic.invalidate();
    },
    onError: (error) => {
      setFormError(error.message || (isHebrew ? 'שגיאה בשליחת הביקורת' : 'Error submitting review'));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError(isHebrew ? 'שם נדרש' : 'Name is required');
      return;
    }
    if (!formData.email.trim()) {
      setFormError(isHebrew ? 'אימייל נדרש' : 'Email is required');
      return;
    }
    if (!formData.text.trim()) {
      setFormError(isHebrew ? 'טקסט ביקורת נדרש' : 'Review text is required');
      return;
    }

    createReview.mutate({
      ...formData,
      tourType: formData.tourType || undefined,
    });
  };

  const filteredReviews = reviewsList?.filter(
    (review) => filterTourType === 'all' || review.tourType === filterTourType
  ) || [];

  const visibleReviews = filteredReviews.slice(0, visibleCount);
  const hasMore = visibleCount < filteredReviews.length;

  return (
    <div className="min-h-screen">
      <Header />
      <main id="main-content">

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary to-primary/80 py-16 md:py-20 text-center text-white mt-20">
        <div className="container">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-90" />
          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-3 md:mb-4">
            {t('Guest Reviews', 'ביקורות אורחים')}
          </h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
            {t(
              'Read what our guests say about their WIRO 4x4 adventures and share your own experience',
              'קראו מה האורחים שלנו אומרים על ההרפתקאות שלהם ושתפו את החוויה שלכם'
            )}
          </p>
        </div>
      </section>

      <div className="container py-8 md:py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Review Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {showSuccess ? (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="pt-6 text-center">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-green-800 mb-2">
                      {t('Thank You!', 'תודה!')}
                    </h3>
                    <p className="text-green-700 mb-4">
                      {t(
                        'Your review has been submitted and will appear after approval.',
                        'הביקורת שלך נשלחה ותופיע לאחר אישור.'
                      )}
                    </p>
                    <Button
                      variant="outline"
                      className="border-green-300 text-green-700 hover:bg-green-100"
                      onClick={() => setShowSuccess(false)}
                    >
                      {t('Write Another Review', 'כתבו ביקורת נוספת')}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-primary">
                      {t('Share Your Experience', 'שתפו את החוויה שלכם')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {formError && (
                        <Alert variant="destructive">
                          <AlertDescription>{formError}</AlertDescription>
                        </Alert>
                      )}

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          {t('Your Name *', 'השם שלך *')}
                        </label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder={isHebrew ? 'שם מלא' : 'Full Name'}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          {t('Email *', 'אימייל *')}
                        </label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="email@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          {t('Rating *', 'דירוג *')}
                        </label>
                        <StarRating
                          rating={formData.rating}
                          onRate={(r) => setFormData(prev => ({ ...prev, rating: r }))}
                          interactive
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          {t('Tour Type', 'סוג הסיור')}
                        </label>
                        <select
                          value={formData.tourType}
                          onChange={(e) => setFormData(prev => ({ ...prev, tourType: e.target.value }))}
                          className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                        >
                          <option value="">{isHebrew ? 'בחר סוג סיור...' : 'Select tour type...'}</option>
                          {TOUR_TYPES.map((type) => (
                            <option key={type.id} value={type.id}>
                              {isHebrew ? type.he : type.en}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          {t('Your Review *', 'הביקורת שלך *')}
                        </label>
                        <Textarea
                          value={formData.text}
                          onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                          placeholder={isHebrew ? 'ספרו לנו על החוויה שלכם...' : 'Tell us about your experience...'}
                          rows={4}
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={createReview.isPending}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {createReview.isPending
                          ? (isHebrew ? 'שולח...' : 'Submitting...')
                          : (isHebrew ? 'שלח ביקורת' : 'Submit Review')}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2">
            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                variant={filterTourType === 'all' ? 'default' : 'outline'}
                className="rounded-full"
                onClick={() => { setFilterTourType('all'); setVisibleCount(REVIEWS_PER_PAGE); }}
                size="sm"
              >
                {t('All', 'הכל')}
              </Button>
              {TOUR_TYPES.map((type) => (
                <Button
                  key={type.id}
                  variant={filterTourType === type.id ? 'default' : 'outline'}
                  className="rounded-full"
                  onClick={() => { setFilterTourType(type.id); setVisibleCount(REVIEWS_PER_PAGE); }}
                  size="sm"
                >
                  {isHebrew ? type.he : type.en}
                </Button>
              ))}
            </div>

            {isLoading && (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              </div>
            )}

            {!isLoading && filteredReviews.length === 0 && (
              <div className="text-center py-16">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                  {t('No reviews yet', 'אין ביקורות עדיין')}
                </h3>
                <p className="text-muted-foreground">
                  {t('Be the first to share your experience!', 'היו הראשונים לשתף את החוויה שלכם!')}
                </p>
              </div>
            )}

            {!isLoading && filteredReviews.length > 0 && (
              <div className="space-y-4">
                {visibleReviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">{review.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <StarRating rating={review.rating} />
                            {review.tourType && (
                              <Badge variant="secondary" className="text-xs">
                                {TOUR_TYPES.find(t => t.id === review.tourType)?.[isHebrew ? 'he' : 'en'] || review.tourType}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <p className="text-foreground/80 leading-relaxed">{review.text}</p>

                      {review.adminResponse && (
                        <div className="mt-4 pl-4 border-l-4 border-primary bg-primary/5 rounded-r-lg p-3">
                          <p className="text-sm font-semibold text-primary mb-1">
                            {t('Response from WIRO 4x4', 'תגובה מ-WIRO 4x4')}
                          </p>
                          <p className="text-sm text-foreground/70">{review.adminResponse}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {/* Show More / Show Less controls */}
                <div className="flex justify-center gap-3 pt-4">
                  {hasMore && (
                    <Button
                      variant="outline"
                      onClick={() => setVisibleCount(prev => prev + REVIEWS_PER_PAGE)}
                    >
                      {t(
                        `Show More (${filteredReviews.length - visibleCount} remaining)`,
                        `הצג עוד (${filteredReviews.length - visibleCount} נותרו)`
                      )}
                    </Button>
                  )}
                  {visibleCount > REVIEWS_PER_PAGE && (
                    <Button
                      variant="ghost"
                      onClick={() => setVisibleCount(REVIEWS_PER_PAGE)}
                    >
                      {t('Show Less', 'הצג פחות')}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      </main>
      <Footer />
    </div>
  );
}
