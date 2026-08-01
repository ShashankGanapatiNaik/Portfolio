import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CommandPalette({ onOpenChat, onOpenResume }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const actions = [
    // Navigation
    { id: "nav-hero", category: "Navigation", title: "Go to Home / Hero", icon: "🏠", action: () => scrollToSection("#hero") },
    { id: "nav-about", category: "Navigation", title: "Go to About Me", icon: "👨‍💻", action: () => scrollToSection("#about") },
    { id: "nav-skills", category: "Navigation", title: "Go to Skills & Tech Stack", icon: "⚡", action: () => scrollToSection("#skills") },
    { id: "nav-projects", category: "Navigation", title: "Go to Projects", icon: "📁", action: () => scrollToSection("#projects") },
    { id: "nav-leetcode", category: "Navigation", title: "Go to LeetCode Activity", icon: "🧩", action: () => scrollToSection("#leetcode") },
    { id: "nav-github", category: "Navigation", title: "Go to GitHub Stats", icon: "🐙", action: () => scrollToSection("#github") },
    { id: "nav-contact", category: "Navigation", title: "Go to Contact", icon: "✉️", action: () => scrollToSection("#contact") },

    // Quick Actions
    {
      id: "act-ai",
      category: "Actions",
      title: "Ask AI Assistant",
      icon: "🤖",
      action: () => {
        if (onOpenChat) onOpenChat();
      },
    },
    {
      id: "act-resume",
      category: "Actions",
      title: "Download Resume",
      icon: "📄",
      action: () => {
        if (onOpenResume) onOpenResume();
      },
    },
    {
      id: "act-copy-email",
      category: "Actions",
      title: "Copy Email Address (shashankng626@gmail.com)",
      icon: "📋",
      action: () => {
        navigator.clipboard.writeText("shashankng626@gmail.com");
        alert("Email copied to clipboard!");
      },
    },

    // External Links
    { id: "link-github", category: "External Links", title: "Open GitHub Profile", icon: "🔗", action: () => window.open("https://github.com/ShashankGanapatiNaik", "_blank") },
    { id: "link-linkedin", category: "External Links", title: "Open LinkedIn Profile", icon: "🔗", action: () => window.open("https://www.linkedin.com/in/shashank-naik-6b449428a", "_blank") },
    { id: "link-leetcode", category: "External Links", title: "Open LeetCode Profile", icon: "🔗", action: () => window.open("https://leetcode.com/u/shashanknaik6226/", "_blank") },
  ];

  const scrollToSection = (id) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const filteredActions = actions.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
  );

  const togglePalette = useCallback(() => {
    setIsOpen((prev) => !prev);
    setSearch("");
    setSelectedIndex(0);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        togglePalette();
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, togglePalette]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleSelect = (action) => {
    action();
    setIsOpen(false);
  };

  const handleNavKeyDown = (e) => {
    if (!isOpen) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredActions.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % (filteredActions.length || 1));
    } else if (e.key === "Enter" && filteredActions[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredActions[selectedIndex].action);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 10000,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              paddingTop: "12vh",
              paddingLeft: "1rem",
              paddingRight: "1rem",
            }}
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0, 0, 0, 0.65)",
                backdropFilter: "blur(8px)",
              }}
            />

            {/* Dialog Window */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "600px",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-accent)",
                borderRadius: "16px",
                boxShadow: "0 25px 60px rgba(0, 0, 0, 0.5)",
                overflow: "hidden",
                zIndex: 10001,
              }}
              onKeyDown={handleNavKeyDown}
            >
              {/* Search Bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "16px 20px",
                  borderBottom: "1px solid var(--border)",
                  gap: "12px",
                }}
              >
                <svg width="20" height="20" fill="none" stroke="var(--accent)" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Type a command or search..."
                  autoFocus
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "var(--text-primary)",
                    fontSize: "1rem",
                    fontFamily: "var(--font-sans)",
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.72rem",
                    color: "var(--text-secondary)",
                    background: "var(--bg-primary)",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    padding: "3px 7px",
                  }}
                >
                  ESC
                </span>
              </div>

              {/* Results List */}
              <div style={{ maxHeight: "360px", overflowY: "auto", padding: "8px" }}>
                {filteredActions.length === 0 ? (
                  <div style={{ padding: "24px", textAlign: "center", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                    No matching commands found.
                  </div>
                ) : (
                  filteredActions.map((item, index) => {
                    const isSelected = index === selectedIndex;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelect(item.action)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "10px 14px",
                          borderRadius: "10px",
                          cursor: "pointer",
                          background: isSelected ? "var(--accent-tint)" : "transparent",
                          border: isSelected ? "1px solid var(--border-accent)" : "1px solid transparent",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
                          <div>
                            <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 500, color: isSelected ? "var(--accent)" : "var(--text-primary)" }}>
                              {item.title}
                            </p>
                          </div>
                        </div>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                          {item.category}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 18px",
                  background: "var(--bg-primary)",
                  borderTop: "1px solid var(--border)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.72rem",
                  color: "var(--text-secondary)",
                }}
              >
                <div style={{ display: "flex", gap: "12px" }}>
                  <span>↑↓ Navigate</span>
                  <span>↵ Select</span>
                </div>
                <span>Command Palette</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
