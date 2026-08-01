import { useState, useEffect, useRef, useCallback } from "react";
import {
  ExternalLink,
  Languages,
  LoaderCircle,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { WHATSAPP_NUMBER } from "@/const";
import { TrackedWhatsAppLink } from "@/components/TrackedWhatsAppLink";

interface ChatMessage {
  role: "user" | "levi";
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
  const [whatsappMessage, setWhatsappMessage] = useState("");
  const [visitorId] = useState(getVisitorId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isRtl = chatLanguage === "he";
  const chatText = (en: string, he: string) =>
    chatLanguage === "en" ? en : he;

  const welcomeMessage =
    chatLanguage === "he"
      ? "שלום, אני לוי, העוזר של WIRO 4x4. שלחו לי מסלול, תאריך, מספר מטיילים ואזור איסוף, ואעזור לתכנן את הטיול לפני המעבר ל-WhatsApp."
      : "Hi, I'm Levi, the WIRO 4x4 assistant. Send your route, date, group size, and pickup area, and I will help check the fit before WhatsApp.";

  const bookingChecklist =
    chatLanguage === "he"
      ? [
          "מסלול או רעיון לטיול",
          "תאריך או טווח תאריכים",
          "מספר מטיילים וגילאי ילדים",
          "מלון או אזור איסוף בצ׳אנג מאי",
          "כשרות, שבת או צורך במדריך בעברית",
        ]
      : [
          "Tour or route idea",
          "Date or date range",
          "Group size and kids' ages",
          "Hotel or pickup area in Chiang Mai",
          "Kosher, Shabbat, or Hebrew-guide needs",
        ];

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
      setMessages([{ role: "levi", content: welcomeMessage }]);
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
        const res = await fetch("/api/levi/message", {
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
            ? "תודה! לוי קיבל את ההודעה שלך. אפשר להמשיך דרך WhatsApp."
            : "Thanks! Levi received your message. You can continue via WhatsApp.");

        setMessages(prev => [...prev, { role: "levi", content: reply }]);
        if (data.whatsappUrl) {
          try {
            setWhatsappMessage(
              new URL(data.whatsappUrl).searchParams.get("text") ?? ""
            );
          } catch {
            setWhatsappMessage("");
          }
        }
        setNeedsHandoff(Boolean(data.escalate));
      } catch {
        const fallback =
          chatLanguage === "he"
            ? `מצטער, יש בעיה זמנית בצ'אט. אפשר ליצור קשר ישירות ב-WhatsApp: +${WHATSAPP_NUMBER}`
            : `Sorry, the chat is having a temporary issue. You can contact us directly on WhatsApp: +${WHATSAPP_NUMBER}`;
        setMessages(prev => [...prev, { role: "levi", content: fallback }]);
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
          ? "שלום, אני לוי, העוזר של WIRO 4x4. שלחו לי מסלול, תאריך, מספר מטיילים ואזור איסוף, ואעזור לתכנן את הטיול לפני המעבר ל-WhatsApp."
          : "Hi, I'm Levi, the WIRO 4x4 assistant. Send your route, date, group size, and pickup area, and I will help check the fit before WhatsApp.";
      setMessages([{ role: "levi", content: newWelcome }]);
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
              <span className="h-11 w-11 shrink-0 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="font-semibold leading-tight truncate">
                  {chatText("Levi, WIRO Assistant", "לוי, העוזר של WIRO")}
                </p>
                <p className="text-xs text-primary-foreground/75">
                  {chatText(
                    "Route, date, pickup, then fast WhatsApp confirmation",
                    "מסלול, תאריך ואיסוף, ואז אישור מהיר ב-WhatsApp"
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleLanguage}
                className="h-11 w-11 rounded-full hover:bg-primary-foreground/10 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-primary"
                aria-label={chatText("Toggle language", "החלף שפה")}
              >
                <Languages className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="h-11 w-11 rounded-full hover:bg-primary-foreground/10 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-primary"
                aria-label={chatText("Close chat", "סגור צ'אט")}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background/70">
            <ul
              role="log"
              aria-live="polite"
              aria-relevant="additions text"
              aria-label={chatText("Chat conversation", "שיחת צ'אט")}
              className="space-y-3"
            >
              {messages.map((msg, idx) => (
                <li
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <span
                    className={`px-3.5 py-2.5 text-sm leading-relaxed max-w-[82%] shadow-sm ${
                      msg.role === "user"
                        ? "bg-secondary text-secondary-foreground rounded-2xl rounded-br-sm"
                        : "bg-card text-card-foreground border border-border rounded-2xl rounded-bl-sm"
                    }`}
                    dir="auto"
                  >
                    {msg.content}
                  </span>
                </li>
              ))}

              {isLoading && (
                <li className="flex justify-start">
                  <span className="bg-card text-muted-foreground border border-border rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm inline-flex items-center gap-2">
                    <LoaderCircle
                      className="h-4 w-4 animate-spin text-secondary"
                      aria-hidden="true"
                    />
                    {chatText("Levi is checking...", "לוי בודק...")}
                  </span>
                </li>
              )}
            </ul>

            {messages.length <= 1 && (
              <div className="rounded-xl border border-secondary/30 bg-card p-3 shadow-sm">
                <p className="text-sm font-semibold text-card-foreground">
                  {chatText(
                    "For a useful quote, send these details:",
                    "כדי לקבל תשובה מדויקת, שלחו את הפרטים האלה:"
                  )}
                </p>
                <ul className="mt-2 grid gap-1.5 text-sm text-muted-foreground">
                  {bookingChecklist.map(item => (
                    <li key={item} className="flex items-start gap-2">
                      <span
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {messages.length <= 1 && (
              <div className="grid gap-2 pt-1">
                {quickPrompts.map(prompt => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => void sendMessage(prompt)}
                    className="min-h-11 text-start rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground hover:border-secondary hover:bg-secondary/10 transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-1"
                  >
                    <Sparkles
                      className="inline-block h-3.5 w-3.5 me-2 text-secondary"
                      aria-hidden="true"
                    />
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {needsHandoff && (
            <div className="px-4 py-3 border-t border-border bg-card">
              <TrackedWhatsAppLink
                sourceCode={
                  chatLanguage === "he" ? "CHAT-HANDOFF-HE" : "CHAT-HANDOFF-EN"
                }
                humanMessage={whatsappMessage}
                target="_blank"
                rel="noreferrer"
                className="min-h-11 w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-[#f9fff9] hover:bg-[#20BA5A] transition-colors focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
              >
                {chatText(
                  "Ask availability on WhatsApp",
                  "בדיקת זמינות ב-WhatsApp"
                )}
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </TrackedWhatsAppLink>
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
                "Route, date, group size, pickup area...",
                "מסלול, תאריך, מספר מטיילים ואזור איסוף..."
              )}
              disabled={isLoading}
              rows={1}
              className="min-h-11 max-h-24 flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm leading-5 focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-50"
              dir={isRtl ? "rtl" : "ltr"}
            />
            <button
              type="button"
              onClick={() => void sendMessage()}
              disabled={!input.trim() || isLoading}
              className="h-11 w-11 shrink-0 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-1"
              aria-label={chatText("Send message", "שלח הודעה")}
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
