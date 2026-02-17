import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const TOPIC_LIBRARY = [
  "Kosher Dining Guide for Northern Thailand",
  "Shabbat-Friendly Accommodations in Chiang Mai",
  "Israeli Traveler Tips for Southeast Asia",
  "Cultural Etiquette Guide for Thailand/Laos/Vietnam",
  "Best Time to Visit Chiang Mai",
  "Packing List for Off-Road Adventures",
];

interface GenerateArticleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerated: (draft: {
    title: string;
    titleHe: string;
    slug: string;
    excerpt: string;
    excerptHe: string;
    content: string;
    contentHe: string;
    category: string;
    tags: string;
  }) => void;
}

export function GenerateArticleDialog({
  open,
  onOpenChange,
  onGenerated,
}: GenerateArticleDialogProps) {
  const [topic, setTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [tone, setTone] = useState<"informative" | "adventurous" | "practical">(
    "informative"
  );
  const [length, setLength] = useState(1000);

  const generateMut = trpc.blog.generateDraft.useMutation({
    onSuccess: draft => {
      toast.success("Article draft generated!");
      onGenerated(draft);
      onOpenChange(false);
      setTopic("");
      setCustomTopic("");
    },
    onError: error => {
      toast.error(`Generation failed: ${error.message}`);
    },
  });

  const handleGenerate = () => {
    const finalTopic = topic === "custom" ? customTopic : topic;
    if (!finalTopic) {
      toast.error("Please select or enter a topic");
      return;
    }
    generateMut.mutate({ topic: finalTopic, tone, length });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            Generate Article with AI
          </DialogTitle>
          <DialogDescription>
            Select a topic and style. Claude will generate a full bilingual
            draft.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Topic</label>
            <select
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm"
            >
              <option value="">Select a topic...</option>
              {TOPIC_LIBRARY.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
              <option value="custom">Custom topic...</option>
            </select>
          </div>

          {topic === "custom" && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Custom Topic
              </label>
              <input
                type="text"
                value={customTopic}
                onChange={e => setCustomTopic(e.target.value)}
                placeholder="Enter your article topic"
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tone</label>
              <select
                value={tone}
                onChange={e => setTone(e.target.value as typeof tone)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              >
                <option value="informative">Informative</option>
                <option value="adventurous">Adventurous</option>
                <option value="practical">Practical Guide</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Length</label>
              <select
                value={length}
                onChange={e => setLength(Number(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              >
                <option value={500}>Short (~500 words)</option>
                <option value={1000}>Medium (~1000 words)</option>
                <option value={2000}>Long (~2000 words)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted/50"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={generateMut.isPending}
            className="flex-1 px-4 py-2 bg-[#D4AF37] text-white rounded-lg text-sm hover:bg-[#D4AF37]/90 flex items-center justify-center gap-2"
          >
            {generateMut.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
