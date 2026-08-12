import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sendChatMessage } from "../services/api";

const CATEGORIES = [
  { label: "📁 Projects", prompt: "Tell me about Shashank's top projects" },
  { label: "⚡ Skills", prompt: "What technologies and languages does he know?" },
  { label: "🎓 Education", prompt: "Where does he study and what is his CGPA?" },
  { label: "📄 Resume", prompt: "How can I download his resume or contact him?" },
];

const API_BASE = import.meta.env.VITE_API_URL || "/api";
const AVATAR_URL = `${API_BASE}/profile/photo`;
const FALLBACK_AVATAR = "https://github.com/ShashankGanapatiNaik.png";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm Shashank's AI assistant 👋\n\nAsk me anything about his projects, technical skills, education, or experience!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, loading]);

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
            "I'm having trouble connecting right now. Please reach out to Shashank directly at shashankng626@gmail.com!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            style={{
              position: "fixed",
              bottom: "78px",
              right: "max(16px, calc((100vw - 68rem) / 2 + 16px))",
              width: "calc(100vw - 32px)",
              maxWidth: "380px",
              height: "clamp(420px, 70vh, 540px)",
              maxHeight: "calc(100vh - 96px)",
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-accent)",
                borderRadius: "20px",
                boxShadow: "0 24px 60px rgba(0, 0, 0, 0.45)",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                overflow: "hidden",
                backdropFilter: "blur(20px)",
              }}
            >
              {/* Top Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 18px",
                  background: "var(--bg-primary)",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ position: "relative" }}>
                    <img
                      src={AVATAR_URL}
                      alt="Shashank AI"
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid var(--border-accent)",
                      }}
                      onError={(e) => {
                        e.target.src = FALLBACK_AVATAR;
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        bottom: "0",
                        right: "0",
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        background: "#10b981",
                        border: "2px solid var(--bg-primary)",
                        boxShadow: "0 0 6px #10b981",
                      }}
                    />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <h3
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontWeight: 700,
                          fontSize: "0.92rem",
                          color: "var(--text-primary)",
                          margin: 0,
                          lineHeight: 1.2,
                        }}
                      >
                        Shashank's AI Assistant
                      </h3>
                    </div>
                    <p
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.7rem",
                        color: "var(--accent)",
                        margin: 0,
                        marginTop: "2px",
                      }}
                    >
                      ● Online • Ask anything
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    padding: "6px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Messages Body */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                {messages.map((msg, i) => {
                  const isUser = msg.role === "user";
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: isUser ? "flex-end" : "flex-start",
                        gap: "4px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "8px",
                          flexDirection: isUser ? "row-reverse" : "row",
                          maxWidth: "100%",
                        }}
                      >
                        {!isUser && (
                          <img
                            src={AVATAR_URL}
                            alt="AI"
                            style={{
                              width: "24px",
                              height: "24px",
                              borderRadius: "50%",
                              objectFit: "cover",
                              flexShrink: 0,
                              marginTop: "2px",
                              border: "1px solid var(--border-accent)",
                            }}
                            onError={(e) => {
                              e.target.src = FALLBACK_AVATAR;
                            }}
                          />
                        )}

                        <div
                          style={{
                            maxWidth: "84%",
                            padding: "11px 15px",
                            borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                            fontSize: "0.85rem",
                            lineHeight: 1.55,
                            fontFamily: "var(--font-sans)",
                            whiteSpace: "pre-wrap",
                            background: isUser ? "var(--text-primary)" : "var(--bg-primary)",
                            color: isUser ? "var(--bg-primary)" : "var(--text-primary)",
                            border: isUser ? "1px solid var(--text-primary)" : "1px solid var(--border)",
                            position: "relative",
                          }}
                        >
                          {msg.content}
                        </div>
                      </div>

                      {!isUser && i > 0 && (
                        <button
                          onClick={() => handleCopy(msg.content, i)}
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.68rem",
                            color: copiedIndex === i ? "var(--accent)" : "var(--text-secondary)",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: "2px 6px",
                            marginLeft: "32px",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          {copiedIndex === i ? "✓ Copied" : "📋 Copy response"}
                        </button>
                      )}
                    </motion.div>
                  );
                })}

                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ display: "flex", alignItems: "center", gap: "8px" }}
                  >
                    <img
                      src={AVATAR_URL}
                      alt="AI"
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "1px solid var(--border-accent)",
                      }}
                      onError={(e) => {
                        e.target.src = FALLBACK_AVATAR;
                      }}
                    />
                    <div
                      style={{
                        background: "var(--bg-primary)",
                        border: "1px solid var(--border)",
                        borderRadius: "16px 16px 16px 4px",
                        padding: "10px 14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {[0, 1, 2].map((dot) => (
                        <motion.div
                          key={dot}
                          animate={{ y: [0, -4, 0] }}
                          transition={{
                            duration: 0.6,
                            delay: dot * 0.15,
                            repeat: Infinity,
                          }}
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: "var(--accent)",
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Topic Chips */}
              <div
                style={{
                  padding: "8px 14px",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px",
                  borderTop: "1px solid var(--border)",
                  background: "var(--bg-primary)",
                }}
              >
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.label}
                    onClick={() => sendMessage(cat.prompt)}
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.74rem",
                      fontWeight: 500,
                      color: "var(--text-primary)",
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      padding: "4px 10px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--border-accent)";
                      e.currentTarget.style.color = "var(--accent)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.color = "var(--text-primary)";
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Input Footer */}
              <div
                style={{
                  padding: "12px 14px",
                  borderTop: "1px solid var(--border)",
                  background: "var(--bg-primary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question..."
                  disabled={loading}
                  style={{
                    flex: 1,
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border)",
                    borderRadius: "10px",
                    padding: "9px 12px",
                    fontSize: "0.83rem",
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-sans)",
                    outline: "none",
                  }}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: input.trim() ? "var(--text-primary)" : "var(--border)",
                    color: input.trim() ? "var(--bg-primary)" : "var(--text-secondary)",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: input.trim() ? "pointer" : "default",
                    transition: "all 0.2s ease",
                    flexShrink: 0,
                  }}
                >
                  <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13" />
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" />
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
        transition={{ delay: 1, type: "spring" }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: "18px",
          right: "max(16px, calc((100vw - 68rem) / 2 + 16px))",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-accent)",
          borderRadius: "99px",
          padding: isOpen ? "0" : "0 16px",
          height: "48px",
          minWidth: "48px",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)",
          gap: "8px",
          cursor: "pointer",
          backdropFilter: "blur(12px)",
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
                width: 48,
                height: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="18" height="18" fill="none" stroke="var(--text-primary)" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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
              <img
                src={AVATAR_URL}
                alt="AI"
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "1px solid var(--border-accent)",
                }}
                onError={(e) => {
                  e.target.src = FALLBACK_AVATAR;
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "var(--text-primary)",
                  letterSpacing: "0.02em",
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


