import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { label: "01. About", href: "#about" },
  { label: "02. Skills", href: "#skills" },
  { label: "03. Projects", href: "#projects" },
  { label: "04. Stats", href: "#stats" },
  { label: "05. Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: scrolled ? "var(--navbar-bg)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid var(--border)" : "none",
        transition: "all 0.3s ease",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <motion.a
          href="#hero"
          whileHover={{ scale: 1.05 }}
          style={{
            fontFamily: "JetBrains Mono, monospace",
            color: "var(--accent)",
            fontSize: "1.2rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textDecoration: "none",
          }}
        >
          &lt;SGN /&gt;
        </motion.a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link, i) => (
            <motion.a
              key={link.href}
              href={link.href}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.3 }}
              className="nav-link"
            >
              {link.label}
            </motion.a>
          ))}
          <motion.a
            href="/admin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="btn-primary text-xs"
          >
            Admin
          </motion.a>
          {/* Theme Toggle */}
          <ThemeToggle />
        </div>

        {/* Mobile right side */}
        <div className="md:hidden flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "5px",
              padding: "4px",
              cursor: "pointer",
              background: "none",
              border: "none",
            }}
          >
            <motion.span
              animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              style={{
                display: "block",
                width: "22px",
                height: "2px",
                backgroundColor: "var(--accent)",
                borderRadius: "2px",
                transition: "all 0.3s",
              }}
            />
            <motion.span
              animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
              style={{
                display: "block",
                width: "22px",
                height: "2px",
                backgroundColor: "var(--accent)",
                borderRadius: "2px",
              }}
            />
            <motion.span
              animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              style={{
                display: "block",
                width: "22px",
                height: "2px",
                backgroundColor: "var(--accent)",
                borderRadius: "2px",
                transition: "all 0.3s",
              }}
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderTop: "1px solid var(--border)",
            }}
          >
            <div className="flex flex-col p-6 gap-5">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="nav-link text-base"
                >
                  {link.label}
                </a>
              ))}
              <a href="/admin" className="btn-primary text-center text-xs">
                Admin
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
