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
      ? "שלום! אני משה 👨‍💼 המדריך האישי שלכם ב-WIRO 4x4. שלחו לי את שאלתכם ואחזור אליכם בהקדם!"
      : "Hi! I'm Moshe 👨‍💼 your personal guide at WIRO 4x4. Send me your question and I'll get back to you as soon as possible!";

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
          ? "תודה! משה קיבל את ההודעה שלך ויחזור אליך בהקדם דרך WhatsApp 📱"
          : "Thanks! Moshe received your message and will reply via WhatsApp shortly 📱");

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
          ? "שלום! אני משה 👨‍💼 המדריך האישי שלכם ב-WIRO 4x4. שלחו לי את שאלתכם ואחזור אליכם בהקדם!"
          : "Hi! I'm Moshe 👨‍💼 your personal guide at WIRO 4x4. Send me your question and I'll get back to you as soon as possible!";
      setMessages([{ role: "moshe", content: newWelcome }]);
    }
  };

  return (
    <>
      {/* Chat Panel (open state) */}
      {isOpen && (
        <div
          className={`fixed inset-x-0 bottom-0 md:bottom-6 md:w-80 md:inset-auto w-full md:w-auto h-[60vh] md:h-96 bg-white md:rounded-2xl shadow-2xl border-t md:border border-gray-200 flex flex-col z-[9999] overflow-hidden ${isRtl ? "md:left-4 md:right-auto" : "md:right-4 md:left-auto"}`}
          dir={isRtl ? "rtl" : "ltr"}
        >
          {/* Header */}
          <div className="h-12 bg-secondary/10 rounded-t-2xl px-3 flex items-center justify-between">
            <span className="font-semibold text-gray-800 flex items-center gap-1.5">
              <span className="text-lg">👨‍💼</span>
              {t("Moshe — Your Guide", "משה — המדריך שלכם")}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleLanguage}
                className="text-xs font-medium px-2 py-1 rounded hover:bg-secondary/20 transition-colors"
                aria-label={t("Toggle language", "החלף שפה")}
              >
                {chatLanguage === "en" ? "עב" : "EN"}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-secondary/20 transition-colors"
                aria-label={t("Close chat", "סגור צ'אט")}
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <span
                  className={`px-3 py-2 text-sm max-w-[75%] ${
                    msg.role === "user"
                      ? "bg-secondary text-white rounded-2xl rounded-br-sm"
                      : "bg-gray-100 text-gray-800 rounded-2xl rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </span>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <span className="bg-gray-100 text-gray-800 rounded-2xl rounded-bl-sm px-3 py-2 text-sm">
                  <span className="inline-flex gap-1">
                    <span className="animate-bounce">.</span>
                    <span
                      className="animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    >
                      .
                    </span>
                    <span
                      className="animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    >
                      .
                    </span>
                  </span>
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="h-14 border-t flex items-center px-3 gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("Ask Moshe anything...", "שאלו את משה כל דבר...")}
              disabled={isLoading}
              className="flex-1 rounded-full border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-50"
              dir={isRtl ? "rtl" : "ltr"}
            />
            <button
              onClick={() => void sendMessage()}
              disabled={!input.trim() || isLoading}
              className="rounded-full bg-secondary text-white p-1.5 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-1"
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
