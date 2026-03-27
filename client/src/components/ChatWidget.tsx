import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, X, Send, Loader2, Globe } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/const";

type ChatLanguage = "en" | "he" | "th";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatResponse {
  reply: string;
  language: ChatLanguage;
  escalate: boolean;
}

const TRANSLATIONS = {
  en: {
    chatTitle: "WIRO 4x4 Assistant",
    placeholder: "Ask about our tours...",
    greeting:
      "Hi! 👋 I'm the WIRO 4x4 assistant. I can help you with information about our off-road tours in Chiang Mai, kosher arrangements, and more. How can I help you today?",
    sendError: "Sorry, something went wrong. Please try again.",
    typing: "Typing...",
    languageLabel: "Language",
  },
  he: {
    chatTitle: "עוזר WIRO 4x4",
    placeholder: "שאלו על הטיולים שלנו...",
    greeting:
      "שלום! 👋 אני העוזר של WIRO 4x4. אני יכול לעזור לכם עם מידע על טיולי השטח שלנו בצ'יאנג מאי, הסדרי כשרות ועוד. איך אני יכול לעזור לכם היום?",
    sendError: "מצטער, משהו השתבש. אנא נסו שוב.",
    typing: "מקליד...",
    languageLabel: "שפה",
  },
  th: {
    chatTitle: "ผู้ช่วย WIRO 4x4",
    placeholder: "สอบถามเกี่ยวกับทัวร์ของเรา...",
    greeting:
      "สวัสดีครับ! 👋 ผมคือผู้ช่วยของ WIRO 4x4 ผมสามารถช่วยให้ข้อมูลเกี่ยวกับทัวร์ออฟโรดในเชียงใหม่ การจัดเตรียมอาหารโคเชอร์ และอื่นๆ วันนี้ช่วยอะไรได้บ้างครับ?",
    sendError: "ขออภัย เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
    typing: "กำลังพิมพ์...",
    languageLabel: "ภาษา",
  },
};

function detectBrowserLanguage(): ChatLanguage {
  if (typeof navigator === "undefined") return "en";

  const lang =
    navigator.language ||
    (navigator as unknown as { userLanguage?: string }).userLanguage ||
    "";
  const langCode = lang.toLowerCase().slice(0, 2);

  if (langCode === "he" || langCode === "iw") return "he";
  if (langCode === "th") return "th";
  return "en";
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<ChatLanguage>(() =>
    detectBrowserLanguage()
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const t = TRANSLATIONS[language];
  const isRtl = language === "he";

  // Initialize with greeting when opened for the first time
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: "assistant", content: t.greeting }]);
    }
  }, [isOpen, messages.length, t.greeting]);

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
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          language,
          history: messages.slice(-10), // Send last 10 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error("Chat request failed");
      }

      const data: ChatResponse = await response.json();

      setMessages(prev => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);

      // If escalation is suggested, update the language if server detected different
      if (data.language !== language) {
        setLanguage(data.language);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: t.sendError },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, language, messages, t.sendError]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  const handleWhatsAppEscalate = () => {
    const message = encodeURIComponent(
      language === "he"
        ? "שלום, דיברתי עם הבוט ואשמח לפרטים נוספים על הטיולים"
        : language === "th"
          ? "สวัสดีครับ ผมคุยกับบอทแล้ว อยากทราบข้อมูลเพิ่มเติมเกี่ยวกับทัวร์"
          : "Hi, I was chatting with your bot and would like more information about tours"
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed z-[9998] rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
          isOpen
            ? "bg-gray-600 hover:bg-gray-700 bottom-[420px] md:bottom-[520px]"
            : "bg-[#f97316] hover:bg-[#ea580c] bottom-4 md:bottom-6"
        } ${isRtl ? "left-4 md:left-6" : "right-20 md:right-24"}`}
        style={{ zIndex: 9998 }}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed z-[9997] bg-white dark:bg-gray-900 rounded-lg shadow-2xl flex flex-col overflow-hidden ${
            isRtl ? "left-4 md:left-6" : "right-4 md:right-6"
          }`}
          style={{
            bottom: "80px",
            width: "min(360px, calc(100vw - 32px))",
            height: "min(500px, calc(100vh - 120px))",
            zIndex: 9997,
          }}
          dir={isRtl ? "rtl" : "ltr"}
        >
          {/* Header */}
          <div className="bg-[#f97316] text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="h-4 w-4" />
              </div>
              <span className="font-semibold">{t.chatTitle}</span>
            </div>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/20 transition-colors"
                aria-label={t.languageLabel}
              >
                <Globe className="h-4 w-4" />
                <span className="text-sm uppercase">{language}</span>
              </button>

              {showLanguageMenu && (
                <div
                  className={`absolute top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden ${
                    isRtl ? "left-0" : "right-0"
                  }`}
                >
                  {(["en", "he", "th"] as ChatLanguage[]).map(lang => (
                    <button
                      key={lang}
                      onClick={() => {
                        setLanguage(lang);
                        setShowLanguageMenu(false);
                        // Update greeting if no conversation yet
                        if (messages.length <= 1) {
                          setMessages([
                            {
                              role: "assistant",
                              content: TRANSLATIONS[lang].greeting,
                            },
                          ]);
                        }
                      }}
                      className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        language === lang
                          ? "bg-gray-100 dark:bg-gray-700 font-medium"
                          : ""
                      } text-gray-900 dark:text-gray-100`}
                    >
                      {lang === "en"
                        ? "English"
                        : lang === "he"
                          ? "עברית"
                          : "ไทย"}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? (isRtl ? "justify-start" : "justify-end") : isRtl ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                    msg.role === "user"
                      ? "bg-[#f97316] text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  }`}
                >
                  {msg.content.split("\n").map((line, i) => (
                    <p key={i} className={i > 0 ? "mt-2" : ""}>
                      {line}
                    </p>
                  ))}

                  {/* WhatsApp CTA for assistant messages containing WhatsApp mention */}
                  {msg.role === "assistant" &&
                    msg.content.toLowerCase().includes("whatsapp") && (
                      <button
                        onClick={handleWhatsAppEscalate}
                        className="mt-2 flex items-center gap-2 text-xs bg-[#25D366] text-white px-3 py-1.5 rounded-full hover:bg-[#20BA5A] transition-colors"
                      >
                        <MessageCircle className="h-3 w-3" />
                        WhatsApp
                      </button>
                    )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div
                className={`flex ${isRtl ? "justify-end" : "justify-start"}`}
              >
                <div className="bg-gray-100 dark:bg-gray-800 text-gray-500 px-4 py-2 rounded-2xl text-sm flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t.typing}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-3">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.placeholder}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-full text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent disabled:opacity-50"
                dir={isRtl ? "rtl" : "ltr"}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="p-2 bg-[#f97316] text-white rounded-full hover:bg-[#ea580c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316] focus-visible:ring-offset-2"
                aria-label="Send message"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
