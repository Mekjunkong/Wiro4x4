import { useState, useEffect, useRef, useCallback } from "react";
import { X, Send } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { WHATSAPP_NUMBER } from "@/const";

interface ChatMessage {
  role: "user" | "moshe";
  content: string;
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
  const { language: appLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatLanguage, setChatLanguage] = useState<"en" | "he">(appLanguage);
  const [visitorId] = useState(getVisitorId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isRtl = chatLanguage === "he";

  const welcomeMessage =
    chatLanguage === "he"
      ? "שלום! כאן מתכנן הטיולים של WIRO 4x4 👨‍💼 שלחו שאלה, תאריכים או גודל קבוצה ונחזור אליכם בהקדם ב-WhatsApp."
      : "Hi! This is the WIRO 4x4 trip planner 👨‍💼 Send a question, dates, or group size and we'll reply on WhatsApp as soon as possible.";

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

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/moshe/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          messages: [...messages, { role: "user", content: userMessage }],
          language: chatLanguage,
          visitorId,
        }),
      });

      const data = (await res.json()) as { reply?: string };
      const reply =
        data.reply ??
        (chatLanguage === "he"
          ? "תודה! WIRO קיבלו את ההודעה שלך ויחזרו אליך בהקדם דרך WhatsApp 📱"
          : "Thanks! WIRO received your message and will reply via WhatsApp shortly 📱");

      setMessages(prev => [...prev, { role: "moshe", content: reply }]);
    } catch {
      const fallback =
        chatLanguage === "he"
          ? `מצטער, אירעה שגיאה. צרו קשר ישירות: +${WHATSAPP_NUMBER}`
          : `Sorry, something went wrong. Contact us directly: +${WHATSAPP_NUMBER}`;
      setMessages(prev => [...prev, { role: "moshe", content: fallback }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, visitorId, chatLanguage]);

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
          ? "שלום! כאן מתכנן הטיולים של WIRO 4x4 👨‍💼 שלחו שאלה, תאריכים או גודל קבוצה ונחזור אליכם בהקדם ב-WhatsApp."
          : "Hi! This is the WIRO 4x4 trip planner 👨‍💼 Send a question, dates, or group size and we'll reply on WhatsApp as soon as possible.";
      setMessages([{ role: "moshe", content: newWelcome }]);
    }
  };

  return (
    <>
      {/* Chat Panel (open state) */}
      {isOpen && (
        <div
          className={`fixed inset-x-0 bottom-0 md:bottom-6 md:w-[24rem] md:inset-auto w-full md:w-auto h-[68vh] max-h-[32rem] bg-card/98 backdrop-blur-sm md:rounded-3xl shadow-2xl border-t md:border border-border/70 flex flex-col z-[9999] overflow-hidden ${isRtl ? "md:left-4 md:right-auto" : "md:right-4 md:left-auto"}`}
          dir={isRtl ? "rtl" : "ltr"}
        >
          {/* Header */}
          <div className="min-h-14 bg-secondary/10 px-3 md:px-4 flex items-center justify-between border-b border-border/70">
            <span className="font-semibold text-foreground flex items-center gap-2">
              <span className="text-lg">👨‍💼</span>
              {t("WIRO Trip Planner", "מתכנן הטיולים של WIRO")}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleLanguage}
                className="inline-flex items-center justify-center min-h-11 min-w-11 text-xs font-medium px-3 rounded-full hover:bg-secondary/20 transition-colors"
                aria-label={t("Toggle language", "החלף שפה")}
              >
                {chatLanguage === "en" ? "עב" : "EN"}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center justify-center min-h-11 min-w-11 rounded-full hover:bg-secondary/20 transition-colors"
                aria-label={t("Close chat", "סגור צ'אט")}
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <ul
            className="flex-1 overflow-y-auto p-3 space-y-2"
            role="log"
            aria-live="polite"
            aria-relevant="additions text"
          >
            {messages.map((msg, idx) => (
              <li
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-3 py-2 text-sm max-w-[75%] ${
                    msg.role === "user"
                      ? "bg-secondary text-secondary-foreground rounded-2xl rounded-br-sm"
                      : "bg-muted text-foreground rounded-2xl rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </li>
            ))}

            {isLoading && (
              <li
                className="flex justify-start"
                aria-label={t("WIRO is typing", "WIRO כותב")}
              >
                <div className="bg-muted text-foreground rounded-2xl rounded-bl-sm px-3 py-2 text-sm">
                  <span className="inline-flex gap-1 motion-safe:[&>span]:animate-pulse">
                    <span>.</span>
                    <span style={{ animationDelay: "0.1s" }}>.</span>
                    <span style={{ animationDelay: "0.2s" }}>.</span>
                  </span>
                </div>
              </li>
            )}

            <div ref={messagesEndRef} />
          </ul>

          {/* Input area */}
          <div className="min-h-16 border-t border-border/70 flex items-center px-3 py-2 gap-2 bg-background/80">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("Ask WIRO anything...", "שאלו את WIRO כל דבר...")}
              disabled={isLoading}
              className="flex-1 min-h-11 rounded-full border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-50"
              dir={isRtl ? "rtl" : "ltr"}
            />
            <button
              type="button"
              onClick={() => void sendMessage()}
              disabled={!input.trim() || isLoading}
              className="inline-flex items-center justify-center min-h-11 min-w-11 rounded-full bg-secondary text-secondary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-1"
              aria-label={t("Send message", "שלח הודעה")}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
