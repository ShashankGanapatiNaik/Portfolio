import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "LeetCode", href: "#leetcode" },
  { label: "GFG", href: "#gfg" },
  { label: "GitHub", href: "#github" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      // Section highlight logic
      const sections = ["about", "skills", "projects", "leetcode", "gfg", "github", "contact"];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: scrolled ? "0.75rem 1rem" : "1.25rem 1.5rem",
        transition: "padding 0.3s ease",
      }}
    >
      <div
        style={{
          maxWidth: "72rem",
          margin: "0 auto",
          padding: "0.6rem 1.25rem",
          borderRadius: "16px",
          backgroundColor: scrolled ? "var(--navbar-bg)" : "rgba(var(--bg-secondary-rgb), 0.7)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid var(--navbar-border)",
          boxShadow: scrolled ? "0 10px 30px -10px rgba(0, 0, 0, 0.3)" : "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          transition: "all 0.3s ease",
        }}
      >
        {/* Brand Logo */}
        <motion.a
          href="#hero"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "10px",
              background: "var(--accent-tint)",
              border: "1px solid var(--border-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-sans)",
              fontWeight: 800,
              fontSize: "0.9rem",
              color: "var(--accent)",
            }}
          >
            SN
          </div>
          <span
            style={{
              fontFamily: "var(--font-sans)",
              color: "var(--text-primary)",
              fontSize: "0.95rem",
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            Shashank Naik
          </span>
        </motion.a>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = activeSection === link.href.replace("#", "");
            return (
              <a
                key={link.href}
                href={link.href}
                style={{
                  position: "relative",
                  padding: "0.45rem 0.9rem",
                  fontSize: "0.85rem",
                  fontFamily: "var(--font-sans)",
                  fontWeight: 500,
                  color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                  textDecoration: "none",
                  borderRadius: "8px",
                  transition: "color 0.2s ease, background 0.2s ease",
                }}
                className="hover:text-primary hover:bg-white/5"
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    style={{
                      position: "absolute",
                      bottom: "2px",
                      left: "30%",
                      right: "30%",
                      height: "2px",
                      borderRadius: "2px",
                      backgroundColor: "var(--accent)",
                    }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            );
          })}
        </div>

        {/* Desktop Right Side Actions */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => {
              window.dispatchEvent(
                new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true })
              );
            }}
            title="Open Command Palette (Ctrl + K)"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "0.4rem 0.75rem",
              borderRadius: "8px",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              fontSize: "0.75rem",
              fontFamily: "var(--font-mono)",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--border-accent)";
              e.currentTarget.style.color = "var(--accent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Ctrl K</span>
          </button>
          <ThemeToggle />
          <a
            href="/admin"
            className="btn-primary text-xs"
            style={{
              padding: "0.45rem 0.9rem",
              borderRadius: "8px",
              fontSize: "0.8rem",
            }}
          >
            Admin
          </a>
        </div>

        {/* Mobile controls */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle Menu"
            style={{
              padding: "8px",
              borderRadius: "8px",
              background: "var(--accent-tint)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {menuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            style={{
              maxWidth: "72rem",
              margin: "0.5rem auto 0",
              padding: "1rem",
              borderRadius: "16px",
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.4)",
            }}
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    padding: "0.6rem 1rem",
                    borderRadius: "8px",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    color: "var(--text-primary)",
                    textDecoration: "none",
                  }}
                >
                  {link.label}
                </a>
              ))}
              <div style={{ height: "1px", background: "var(--border)", margin: "0.25rem 0" }} />
              <a
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="btn-primary text-center text-xs"
                style={{ width: "100%", justifyContent: "center" }}
              >
                Admin Dashboard
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
