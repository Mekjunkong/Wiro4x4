import { useState, useRef, useCallback, useEffect } from "react";
import { MarkdownRenderer } from "@/components/blog";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  Link,
  Image,
  List,
  ListOrdered,
  Quote,
  Code,
  Eye,
  Edit3,
} from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  dir?: "ltr" | "rtl";
  onImageUpload?: (file: File) => Promise<string>;
  storageKey?: string;
}

function insertAtCursor(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string,
  onChange: (val: string) => void
) {
  const { selectionStart, selectionEnd, value } = textarea;
  const selected = value.slice(selectionStart, selectionEnd);
  const newValue =
    value.slice(0, selectionStart) +
    before +
    selected +
    after +
    value.slice(selectionEnd);
  onChange(newValue);
  requestAnimationFrame(() => {
    textarea.selectionStart = selectionStart + before.length;
    textarea.selectionEnd = selectionStart + before.length + selected.length;
    textarea.focus();
  });
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  dir = "ltr",
  onImageUpload,
  storageKey,
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<"edit" | "preview" | "split">("split");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!storageKey || !value) return;
    const timer = setTimeout(() => {
      localStorage.setItem(storageKey, value);
    }, 30_000);
    return () => clearTimeout(timer);
  }, [value, storageKey]);

  const toolbar = useCallback(
    (action: string) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const map: Record<string, [string, string]> = {
        bold: ["**", "**"],
        italic: ["*", "*"],
        h2: ["## ", "\n"],
        h3: ["### ", "\n"],
        link: ["[", "](url)"],
        list: ["- ", "\n"],
        ordered: ["1. ", "\n"],
        quote: ["> ", "\n"],
        code: ["`", "`"],
      };
      const [before, after] = map[action] || ["", ""];
      insertAtCursor(ta, before, after, onChange);
    },
    [onChange]
  );

  const handleImageUpload = useCallback(async () => {
    if (!onImageUpload) return;
    fileInputRef.current?.click();
  }, [onImageUpload]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !onImageUpload) return;
      try {
        const url = await onImageUpload(file);
        const ta = textareaRef.current;
        if (ta) {
          insertAtCursor(ta, `![${file.name}](`, `${url})`, onChange);
        }
      } catch {
        // Error handled by caller
      }
      e.target.value = "";
    },
    [onImageUpload, onChange]
  );

  const buttons = [
    { icon: Bold, action: "bold", title: "Bold" },
    { icon: Italic, action: "italic", title: "Italic" },
    { icon: Heading2, action: "h2", title: "Heading 2" },
    { icon: Heading3, action: "h3", title: "Heading 3" },
    { icon: Link, action: "link", title: "Link" },
    { icon: List, action: "list", title: "Bullet list" },
    { icon: ListOrdered, action: "ordered", title: "Numbered list" },
    { icon: Quote, action: "quote", title: "Blockquote" },
    { icon: Code, action: "code", title: "Inline code" },
  ];

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/30 flex-wrap">
        {buttons.map(({ icon: Icon, action, title }) => (
          <button
            key={action}
            type="button"
            onClick={() => toolbar(action)}
            title={title}
            className="p-1.5 rounded hover:bg-muted transition-colors"
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
        {onImageUpload && (
          <button
            type="button"
            onClick={handleImageUpload}
            title="Upload image"
            className="p-1.5 rounded hover:bg-muted transition-colors"
          >
            <Image className="w-4 h-4" />
          </button>
        )}
        <div className="flex-1" />
        <div className="flex gap-1">
          {(["edit", "split", "preview"] as const).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-2 py-1 rounded text-xs ${mode === m ? "bg-primary text-white" : "hover:bg-muted"}`}
            >
              {m === "edit" ? (
                <Edit3 className="w-3 h-3" />
              ) : m === "preview" ? (
                <Eye className="w-3 h-3" />
              ) : (
                "Split"
              )}
            </button>
          ))}
        </div>
      </div>

      <div
        className={`flex ${mode === "split" ? "divide-x divide-border" : ""}`}
      >
        {mode !== "preview" && (
          <div className={mode === "split" ? "w-1/2" : "w-full"}>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={e => onChange(e.target.value)}
              placeholder={placeholder}
              dir={dir}
              className="w-full h-[400px] p-4 resize-none text-sm font-mono focus:outline-none"
            />
          </div>
        )}
        {mode !== "edit" && (
          <div
            className={`${mode === "split" ? "w-1/2" : "w-full"} h-[400px] overflow-y-auto p-4`}
          >
            {value ? (
              <MarkdownRenderer content={value} />
            ) : (
              <p className="text-muted-foreground text-sm italic">
                Preview will appear here...
              </p>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
