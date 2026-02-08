import { Calendar, Clock, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface BlogPostMetaProps {
  date: string;
  readTime: string;
}

export function BlogPostMeta({ date, readTime }: BlogPostMetaProps) {
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        <span>{date}</span>
      </div>
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4" />
        <span>{readTime}</span>
      </div>
      <Button variant="ghost" size="sm" className="ml-auto">
        <Share2 className="h-4 w-4 mr-2" />
        {t('Share', '\u05E9\u05EA\u05E3')}
      </Button>
    </div>
  );
}
