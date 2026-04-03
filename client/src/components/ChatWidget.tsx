import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { WHATSAPP_NUMBER } from "@/const";

interface ChatMessage {
  role: "user" | "ai";
  content: string;
}

// Generate or retrieve visitor ID from localStorage
function getVisitorId(): string {
  const STORAGE_KEY = "wiro_chat_visitor_id";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    const newId = Date.now().toString(36) + Math.random().toString(36);
    localStorage.setItem(STORAGE_KEY, newId);
    return newId;
  } catch {
    // localStorage unavailable
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
  const [_sessionId, setSessionId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isRtl = chatLanguage === "he";

  // Welcome messages
  const welcomeMessage =
    chatLanguage === "en"
      ? "Hi! I am Wiro 🤙 Ask me anything about our 4x4 tours, kosher options, or how to book!"
      : "שלום! אני וירו 🤙 שאל אותי כל דבר על הסיורים שלנו, אפשרויות כשרות, או איך להזמין!";

  const errorMessage =
    chatLanguage === "en"
      ? `Sorry, I am unavailable right now. Please contact us via WhatsApp: +${WHATSAPP_NUMBER}`
      : `מצטער, אני לא זמין כרגע. אנא צרו קשר דרך וואטסאפ: +${WHATSAPP_NUMBER}`;

  // Sync chat language with app language
  useEffect(() => {
    setChatLanguage(appLanguage);
  }, [appLanguage]);

  // Add welcome message when opened for the first time
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: "ai", content: welcomeMessage }]);
    }
  }, [isOpen, messages.length, welcomeMessage]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
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
      const response = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId,
          message: userMessage,
          language: chatLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error("Chat request failed");
      }

      const data = (await response.json()) as {
        reply: string;
        sessionId: number;
      };

      setSessionId(data.sessionId);
      setMessages(prev => [...prev, { role: "ai", content: data.reply }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: "ai", content: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, visitorId, chatLanguage, errorMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading) {
      e.preventDefault();
      void sendMessage();
    }
  };

  const toggleLanguage = () => {
    const newLang = chatLanguage === "en" ? "he" : "en";
    setChatLanguage(newLang);
    // Update welcome message if no conversation yet
    if (messages.length <= 1) {
      const newWelcome =
        newLang === "en"
          ? "Hi! I am Wiro 🤙 Ask me anything about our 4x4 tours, kosher options, or how to book!"
          : "שלום! אני וירו 🤙 שאל אותי כל דבר על הסיורים שלנו, אפשרויות כשרות, או איך להזמין!";
      setMessages([{ role: "ai", content: newWelcome }]);
    }
  };

  return (
    <>
      {/* Chat Button (closed state) */}
      {!isOpen && (
        <div className="fixed bottom-20 md:bottom-6 right-[5.5rem] md:right-[6.5rem] z-[9998] flex flex-col items-center gap-2">
          {/* Tooltip label */}
          <span className="bg-white text-gray-700 text-xs font-medium px-2 py-1 rounded shadow-md">
            {t("Ask Wiro", "שאל את וירו")}
          </span>
          <button
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 bg-secondary rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
            aria-label={t("Open chat", "פתח צ'אט")}
          >
            <MessageCircle className="h-6 w-6 text-white" />
          </button>
        </div>
      )}

      {/* Chat Panel (open state) */}
      {isOpen && (
        <div
          className="fixed bottom-20 md:bottom-6 right-[5.5rem] md:right-[6.5rem] w-80 h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-[9998] overflow-hidden"
          dir={isRtl ? "rtl" : "ltr"}
        >
          {/* Header */}
          <div className="h-12 bg-secondary/10 rounded-t-2xl px-3 flex items-center justify-between">
            <span className="font-semibold text-gray-800 flex items-center gap-1">
              🌿 {t("Wiro Assistant", "עוזר וירו")}
            </span>
            <div className="flex items-center gap-2">
              {/* Language toggle */}
              <button
                onClick={toggleLanguage}
                className="text-xs font-medium px-2 py-1 rounded hover:bg-secondary/20 transition-colors"
                aria-label={t("Toggle language", "החלף שפה")}
              >
                {chatLanguage === "en" ? "עב" : "EN"}
              </button>
              {/* Close button */}
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

            {/* Loading indicator */}
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
          <div className="h-12 border-t flex items-center px-2 gap-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t(
                "Ask about our tours...",
                "שאלו על הסיורים שלנו..."
              )}
              disabled={isLoading}
              className="flex-1 rounded-full border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-50"
              dir={isRtl ? "rtl" : "ltr"}
            />
            <button
              onClick={sendMessage}
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
