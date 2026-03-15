import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sendChatMessage } from "../services/api";

const QUICK_QUESTIONS = [
  "What projects has he built?",
  "What skills does he have?",
  "Tell me about his AI project",
  "How to download his resume?",
];

const BOT_AVATAR = "🤖";
const USER_AVATAR = "👤";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm Shashank's AI portfolio assistant 👋\n\nI can answer questions about his skills, projects, experience, and more. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");

    const newMessages = [...messages, { role: "user", content: msg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const history = newMessages
        .slice(1, -1)
        .map((m) => ({ role: m.role, content: m.content }));
      const res = await sendChatMessage(msg, history);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I'm having trouble connecting. Please try again or email shashankng626@gmail.com directly!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 w-80 md:w-96 z-50 flex flex-col"
            style={{ maxHeight: "70vh" }}
          >
            <div
              className="bg-light-navy border border-lightest-navy rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden"
              style={{ maxHeight: "70vh" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-navy border-b border-lightest-navy">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-lg">
                      🤖
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-navy" />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-lightest-slate text-sm">
                      Portfolio Assistant
                    </p>
                    <p className="font-mono text-xs text-accent">
                      AI Powered • Online
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate hover:text-accent p-1 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Messages */}
              <div
                className="flex-1 overflow-y-auto p-4 space-y-3"
                style={{ minHeight: 0 }}
              >
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div className="w-7 h-7 rounded-full bg-lightest-navy flex items-center justify-center text-sm flex-shrink-0">
                      {msg.role === "user" ? USER_AVATAR : BOT_AVATAR}
                    </div>
                    <div
                      className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-accent/20 border border-accent/30 text-lightest-slate rounded-tr-sm"
                          : "bg-navy border border-lightest-navy text-slate rounded-tl-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-2"
                  >
                    <div className="w-7 h-7 rounded-full bg-lightest-navy flex items-center justify-center text-sm">
                      {BOT_AVATAR}
                    </div>
                    <div className="bg-navy border border-lightest-navy rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ y: [0, -5, 0] }}
                          transition={{
                            duration: 0.6,
                            delay: i * 0.15,
                            repeat: Infinity,
                          }}
                          className="w-1.5 h-1.5 bg-accent rounded-full"
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Questions */}
              {messages.length <= 1 && (
                <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                  {QUICK_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="text-xs font-mono text-accent border border-accent/30 rounded-full px-2.5 py-1 hover:bg-accent/10 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="px-4 py-3 border-t border-lightest-navy flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-navy border border-lightest-navy rounded-xl px-3 py-2 text-sm text-lightest-slate placeholder-slate focus:outline-none focus:border-accent/50 transition-colors"
                  disabled={loading}
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center disabled:opacity-50 flex-shrink-0"
                >
                  <svg
                    className="w-4 h-4 text-navy"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, type: "spring" }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #0a192f 0%, #112240 100%)",
          border: "2px solid #64ffda",
          borderRadius: isOpen ? "50%" : "50px",
          padding: isOpen ? "0" : "0 18px",
          height: "52px",
          minWidth: "52px",
          boxShadow: isOpen
            ? "0 0 20px rgba(100,255,218,0.4)"
            : "0 0 25px rgba(100,255,218,0.35)",
          transition:
            "border-radius 0.3s ease, padding 0.3s ease, min-width 0.3s ease",
          gap: "8px",
          cursor: "pointer",
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              style={{
                width: 52,
                height: 52,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="18"
                height="18"
                fill="none"
                stroke="#64ffda"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              {/* AI Brain Icon */}
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #64ffda, #0d9488)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
                    fill="#0a192f"
                  />
                  <circle cx="8.5" cy="10" r="1.5" fill="#64ffda" />
                  <circle cx="15.5" cy="10" r="1.5" fill="#64ffda" />
                  <path
                    d="M8.5 14.5c1 1.5 5.5 1.5 7 0"
                    stroke="#64ffda"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 2v2M12 20v2M2 12h2M20 12h2"
                    stroke="#64ffda"
                    strokeWidth="1"
                    strokeLinecap="round"
                    opacity="0.5"
                  />
                </svg>
              </div>
              <span
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#64ffda",
                  whiteSpace: "nowrap",
                }}
              >
                Ask AI
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
