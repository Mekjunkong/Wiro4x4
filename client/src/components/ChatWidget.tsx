import { useState, useEffect, useRef, useCallback } from "react";
import {
  Bot,
  ExternalLink,
  Languages,
  LoaderCircle,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { WHATSAPP_NUMBER } from "@/const";

interface ChatMessage {
  role: "user" | "moshe";
  content: string;
}

interface ChatResponse {
  reply?: string;
  escalate?: boolean;
  whatsappUrl?: string;
}

function getVisitorId(): string {
  const STORAGE_KEY = "wiro_chat_visitor_id";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    const newId = Date.now().toString(36) + Math.random().toString(36);
    localStorage.setItem(STORAGE_KEY, newId);
    return newId;
  } catch {
    return Date.now().toString(36) + Math.random().toString(36);
  }
}

export function ChatWidget() {
  const { language: appLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatLanguage, setChatLanguage] = useState<"en" | "he">(appLanguage);
  const [needsHandoff, setNeedsHandoff] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState(
    `https://wa.me/${WHATSAPP_NUMBER}`
  );
  const [visitorId] = useState(getVisitorId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isRtl = chatLanguage === "he";
  const chatText = (en: string, he: string) =>
    chatLanguage === "en" ? en : he;

  const welcomeMessage =
    chatLanguage === "he"
      ? "שלום, אני משה מ-WIRO 4x4. אפשר לשאול אותי על מסלולים, כשרות, שבת, מחירים או התאמה למשפחה."
      : "Hi, I'm Moshe from WIRO 4x4. Ask me about tours, kosher meals, Shabbat planning, prices, or what fits your group.";

  const quickPrompts =
    chatLanguage === "he"
      ? [
          "איזה טיול מתאים למשפחה עם ילדים?",
          "יש אפשרות לאוכל כשר?",
          "כמה עולה טיול יום?",
        ]
      : [
          "Which tour is best with kids?",
          "Can you arrange kosher meals?",
          "How much is a day tour?",
        ];

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("chat-open", { detail: isOpen }));
  }, [isOpen]);

  useEffect(() => {
    const handler = () => setIsOpen(prev => !prev);
    window.addEventListener("chat-toggle", handler);
    return () => window.removeEventListener("chat-toggle", handler);
  }, []);

  useEffect(() => {
    setChatLanguage(appLanguage);
  }, [appLanguage]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: "moshe", content: welcomeMessage }]);
    }
  }, [isOpen, messages.length, welcomeMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = useCallback(
    async (overrideMessage?: string) => {
      const userMessage = (overrideMessage ?? input).trim();
      if (!userMessage || isLoading) return;

      setInput("");
      setNeedsHandoff(false);
      setMessages(prev => [...prev, { role: "user", content: userMessage }]);
      setIsLoading(true);

      try {
        const nextMessages = [
          ...messages,
          { role: "user" as const, content: userMessage },
        ];
        const res = await fetch("/api/moshe/message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMessage,
            messages: nextMessages,
            language: chatLanguage,
            visitorId,
          }),
        });

        if (!res.ok) {
          throw new Error(`Chat request failed with status ${res.status}`);
        }

        const data = (await res.json()) as ChatResponse;
        const reply =
          data.reply ??
          (chatLanguage === "he"
            ? "תודה! משה קיבל את ההודעה שלך ויחזור אליך בהקדם דרך WhatsApp."
            : "Thanks! Moshe received your message and will reply via WhatsApp shortly.");

        setMessages(prev => [...prev, { role: "moshe", content: reply }]);
        if (data.whatsappUrl) setWhatsappUrl(data.whatsappUrl);
        setNeedsHandoff(Boolean(data.escalate));
      } catch {
        const fallback =
          chatLanguage === "he"
            ? `מצטער, יש בעיה זמנית בצ'אט. אפשר ליצור קשר ישירות ב-WhatsApp: +${WHATSAPP_NUMBER}`
            : `Sorry, the chat is having a temporary issue. You can contact us directly on WhatsApp: +${WHATSAPP_NUMBER}`;
        setMessages(prev => [...prev, { role: "moshe", content: fallback }]);
        setNeedsHandoff(true);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, messages, visitorId, chatLanguage]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading) {
      e.preventDefault();
      void sendMessage();
    }
  };

  const toggleLanguage = () => {
    const newLang = chatLanguage === "en" ? "he" : "en";
    setChatLanguage(newLang);
    if (messages.length <= 1) {
      const newWelcome =
        newLang === "he"
          ? "שלום, אני משה מ-WIRO 4x4. אפשר לשאול אותי על מסלולים, כשרות, שבת, מחירים או התאמה למשפחה."
          : "Hi, I'm Moshe from WIRO 4x4. Ask me about tours, kosher meals, Shabbat planning, prices, or what fits your group.";
      setMessages([{ role: "moshe", content: newWelcome }]);
    }
  };

  return (
    <>
      {/* Chat Panel (open state) */}
      {isOpen && (
        <div
          className={`fixed inset-x-0 bottom-0 md:bottom-6 md:inset-auto w-full md:w-[380px] h-[72dvh] md:h-[560px] max-h-[720px] bg-card md:rounded-lg shadow-2xl border-t md:border border-border flex flex-col z-[9999] overflow-hidden ${isRtl ? "md:left-4 md:right-auto" : "md:right-4 md:left-auto"}`}
          dir={isRtl ? "rtl" : "ltr"}
        >
          {/* Header */}
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <span className="h-9 w-9 shrink-0 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="font-semibold leading-tight truncate">
                  {chatText("Moshe — WIRO Guide", "משה — מדריך WIRO")}
                </p>
                <p className="text-xs text-primary-foreground/70">
                  {chatText("Usually replies instantly", "בדרך כלל עונה מיד")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleLanguage}
                className="h-8 w-8 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center"
                aria-label={chatText("Toggle language", "החלף שפה")}
              >
                <Languages className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center"
                aria-label={chatText("Close chat", "סגור צ'אט")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background/70">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <span
                  className={`px-3.5 py-2.5 text-sm leading-relaxed max-w-[82%] shadow-sm ${
                    msg.role === "user"
                      ? "bg-secondary text-secondary-foreground rounded-2xl rounded-br-sm"
                      : "bg-card text-card-foreground border border-border rounded-2xl rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </span>
              </div>
            ))}

            {messages.length <= 1 && (
              <div className="grid gap-2 pt-1">
                {quickPrompts.map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => void sendMessage(prompt)}
                    className="text-start rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground hover:border-secondary hover:bg-secondary/10 transition-colors"
                  >
                    <Sparkles className="inline-block h-3.5 w-3.5 me-2 text-secondary" />
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="flex justify-start">
                <span className="bg-card text-muted-foreground border border-border rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm inline-flex items-center gap-2">
                  <LoaderCircle className="h-4 w-4 animate-spin text-secondary" />
                  {chatText("Moshe is checking...", "משה בודק...")}
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {needsHandoff && (
            <div className="px-4 py-3 border-t border-border bg-card">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#20BA5A] transition-colors"
              >
                {chatText("Continue on WhatsApp", "המשיכו ב-WhatsApp")}
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}

          {/* Input area */}
          <div className="border-t border-border bg-card p-3 flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={chatText(
                "Ask Moshe anything...",
                "שאלו את משה כל דבר..."
              )}
              disabled={isLoading}
              rows={1}
              className="min-h-10 max-h-24 flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm leading-5 focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-50"
              dir={isRtl ? "rtl" : "ltr"}
            />
            <button
              onClick={() => void sendMessage()}
              disabled={!input.trim() || isLoading}
              className="h-10 w-10 shrink-0 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-1"
              aria-label={chatText("Send message", "שלח הודעה")}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
