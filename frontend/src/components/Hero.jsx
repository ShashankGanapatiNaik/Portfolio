import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  requestResume,
  checkResumeStatus,
  getResumeDownloadUrl,
} from "../services/api";

const API_BASE = import.meta.env.VITE_API_URL || "/api";
import toast from "react-hot-toast";

const TYPED_STRINGS = [
  "Full Stack Developer",
  "AI & ML Enthusiast",
  "Problem Solver",
  "Open Source Contributor",
];

// Steps: 'idle' | 'form' | 'pending' | 'approved'
export default function Hero() {
  const [typedText, setTypedText] = useState("");
  const [strIndex, setStrIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState("form"); // 'form' | 'pending' | 'approved'
  const [form, setForm] = useState({ name: "", email: "", reason: "" });
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const pollRef = useRef(null);
  const [photoError, setPhotoError] = useState(false);
  const [photoKey, setPhotoKey] = useState(0);
  const retryCount = useRef(0);
  const [isPopped, setIsPopped] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const triggerPop = () => {
    setIsPopped(true);
    setTimeout(() => setIsPopped(false), 500);
  };

  // Close photo modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowPhotoModal(false);
      }
    };
    if (showPhotoModal) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showPhotoModal]);

  // Typewriter effect
  useEffect(() => {
    const current = TYPED_STRINGS[strIndex];
    const timeout = setTimeout(
      () => {
        if (!deleting) {
          if (charIndex < current.length) {
            setTypedText(current.slice(0, charIndex + 1));
            setCharIndex((c) => c + 1);
          } else setTimeout(() => setDeleting(true), 1500);
        } else {
          if (charIndex > 0) {
            setTypedText(current.slice(0, charIndex - 1));
            setCharIndex((c) => c - 1);
          } else {
            setDeleting(false);
            setStrIndex((s) => (s + 1) % TYPED_STRINGS.length);
          }
        }
      },
      deleting ? 60 : 100,
    );
    return () => clearTimeout(timeout);
  }, [charIndex, deleting, strIndex]);

  // Poll for approval status
  useEffect(() => {
    if (step === "pending" && token) {
      pollRef.current = setInterval(async () => {
        try {
          const res = await checkResumeStatus(token);
          if (res.data.status === "approved") {
            clearInterval(pollRef.current);
            setStep("approved");
            toast.success("✅ Approved! Downloading your resume now...");
            // Auto-trigger download after short delay so toast shows first
            setTimeout(() => {
              const link = document.createElement("a");
              link.href = getResumeDownloadUrl(token);
              link.setAttribute(
                "download",
                "Shashank_Ganapati_Naik_Resume.pdf",
              );
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }, 800);
          } else if (res.data.status === "expired") {
            clearInterval(pollRef.current);
            toast.error("Request expired. Please try again.");
            handleClose();
          }
        } catch {}
      }, 5000);
    }
    return () => clearInterval(pollRef.current);
  }, [step, token]);

  const handleClose = () => {
    clearInterval(pollRef.current);
    setShowModal(false);
    setStep("form");
    setForm({ name: "", email: "", reason: "" });
    setToken(null);
  };

  const handleRequest = async () => {
    if (!form.name.trim()) return toast.error("Please enter your name");
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return toast.error("Please enter a valid email");

    setLoading(true);
    try {
      const res = await requestResume(form);
      setToken(res.data.token);
      setStep("pending");
      toast.success("Request sent to Shashank!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send request");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!token) return;
    const link = document.createElement("a");
    link.href = getResumeDownloadUrl(token);
    link.setAttribute("download", "Shashank_Ganapati_Naik_Resume.pdf");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(handleClose, 1000);
  };

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section
      id="hero"
      className="relative min-h-[calc(100vh-64px)] md:min-h-screen flex items-center grid-bg overflow-hidden"
    >
      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div
        className="absolute bottom-1/3 left-1/4 w-96 h-96"
        style={{
          background: "rgba(13,115,119,0.07)",
          borderRadius: "50%",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      <div className="section-container" style={{ paddingTop: "4.5rem", paddingBottom: "2rem" }}>
        {/* Two column layout: text LEFT, photo RIGHT — always side by side */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "2rem",
            flexWrap: "nowrap",
          }}
        >
          {/* ── LEFT: Text Content ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ flex: "1", minWidth: 0, maxWidth: "600px" }}
          >
            {/* Greeting badge */}
            <motion.div
              variants={itemVariants}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "var(--accent-tint)",
                border: "1px solid var(--border-accent)",
                borderRadius: "99px",
                padding: "4px 12px 4px 8px",
                marginBottom: "0.85rem",
              }}
            >
              <span style={{
                width: "8px", height: "8px", borderRadius: "50%",
                background: "var(--accent)",
                boxShadow: "0 0 8px var(--accent)",
                display: "inline-block",
                animation: "blink 2s ease-in-out infinite",
              }} />
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                color: "var(--accent)",
                fontWeight: 500,
                letterSpacing: "0.04em",
              }}>
                Available for opportunities
              </span>
            </motion.div>

            {/* Greeting line */}
            <motion.p
              variants={itemVariants}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
                marginBottom: "0.25rem",
                letterSpacing: "0.02em",
              }}
            >
              Hi there, I'm
            </motion.p>

            {/* Name */}
            <motion.h1
              variants={itemVariants}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "clamp(2.2rem, 5.5vw, 4.2rem)",
                fontWeight: 800,
                lineHeight: 1.08,
                letterSpacing: "-0.03em",
                marginBottom: "0.35rem",
                color: "var(--text-primary)",
              }}
            >
              Shashank{" "}
              <br />
              <span style={{
                background: "linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Ganapati Naik.
              </span>
            </motion.h1>

            {/* Typed subtitle */}
            <motion.h2
              variants={itemVariants}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "clamp(1.05rem, 2.2vw, 1.5rem)",
                fontWeight: 500,
                color: "var(--text-secondary)",
                lineHeight: 1.35,
                letterSpacing: "-0.01em",
                marginBottom: "0.85rem",
              }}
            >
              I build{" "}
              <span className="text-accent typing-cursor">{typedText}</span>
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="font-body text-slate text-sm sm:text-base leading-relaxed mb-5"
              style={{ maxWidth: "500px" }}
            >
              CS student at{" "}
              <span className="text-lightest-slate font-medium">Reva University, Bangalore</span>{" "}
              · CGPA <span className="text-accent font-semibold">9.41/10</span>
              . I craft full-stack web apps and AI-powered tools that solve real problems.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "2rem" }}
            >
              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setShowModal(true); setStep("form"); }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "0.65rem 1.4rem",
                  borderRadius: "10px",
                  background: "var(--text-primary)",
                  color: "var(--bg-primary)",
                  fontFamily: "var(--font-sans)",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  border: "1px solid var(--text-primary)",
                  cursor: "pointer",
                }}
              >
                <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Resume
              </motion.button>

              <motion.a
                href="#projects"
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "0.65rem 1.4rem",
                  borderRadius: "10px",
                  background: "transparent",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-sans)",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  border: "1px solid var(--border-accent)",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                View Projects
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </motion.a>
            </motion.div>

            {/* Social row */}
            <motion.div
              variants={itemVariants}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                flexWrap: "wrap",
              }}
            >
              {[
                { label: "GitHub", href: "https://github.com/ShashankGanapatiNaik", icon: "M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" },
                { label: "LinkedIn", href: "https://www.linkedin.com/in/shashank-naik-6b449428a", icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
                { label: "LeetCode", href: "https://leetcode.com/u/shashanknaik6226/", icon: "M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" },
              ].map(({ label, href, icon }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -2, borderColor: "var(--border-accent)" }}
                  title={label}
                  style={{
                    color: "var(--text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    background: "var(--bg-secondary)",
                    transition: "color 0.2s ease, border-color 0.2s ease",
                    flexShrink: 0,
                  }}
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d={icon} />
                  </svg>
                </motion.a>
              ))}

              <div style={{ width: "1px", height: "24px", background: "var(--border)", flexShrink: 0 }} />

              <a
                href="mailto:shashankng626@gmail.com"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.73rem",
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                  letterSpacing: "0.01em",
                  transition: "color 0.2s ease",
                }}
                className="hover:text-accent"
              >
                shashankng626@gmail.com
              </a>
            </motion.div>
          </motion.div>

          {/* ── RIGHT: Profile Photo with Dynamic Pop Animation ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            {/* Pop Ring Pulse Effect */}
            <AnimatePresence>
              {isPopped && (
                <motion.div
                  initial={{ scale: 1, opacity: 0.8 }}
                  animate={{ scale: 1.4, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    border: "2px solid var(--accent)",
                    boxShadow: "0 0 25px var(--accent)",
                    pointerEvents: "none",
                  }}
                />
              )}
            </AnimatePresence>

            <motion.div
              onClick={() => {
                triggerPop();
                setShowPhotoModal(true);
              }}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.92 }}
              animate={
                isPopped
                  ? {
                      scale: [1, 1.25, 0.92, 1.08, 1],
                      rotate: [0, -3, 3, -1, 0],
                    }
                  : { scale: 1, rotate: 0 }
              }
              transition={{
                duration: 0.45,
                ease: [0.175, 0.885, 0.32, 1.275],
              }}
              style={{
                position: "relative",
                width: "clamp(160px, 25vw, 300px)",
                height: "clamp(160px, 25vw, 300px)",
                cursor: "pointer",
                borderRadius: "50%",
                border: "2px solid var(--border-accent)",
                padding: "6px",
                background: "var(--bg-secondary)",
                boxShadow: isPopped
                  ? "0 0 35px var(--accent-tint), 0 12px 35px rgba(0,0,0,0.3)"
                  : "0 10px 30px rgba(0,0,0,0.2)",
                transition: "box-shadow 0.3s ease, border-color 0.3s ease",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  overflow: "hidden",
                  background: "var(--bg-tertiary)",
                }}
              >
                {!photoError ? (
                  <img
                    key={photoKey}
                    src={`${API_BASE}/profile/photo?t=${photoKey}`}
                    alt="Shashank Ganapati Naik"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center top",
                    }}
                    onError={() => {
                      if (retryCount.current < 3) {
                        retryCount.current += 1;
                        setTimeout(() => setPhotoKey((k) => k + 1), 1500);
                      } else {
                        setPhotoError(true);
                      }
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "var(--bg-tertiary)",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "Outfit,sans-serif",
                        fontSize: "3.5rem",
                        fontWeight: "700",
                        color: "var(--text-primary)",
                      }}
                    >
                      SN
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ── Profile Photo Popup Modal ── */}
      <AnimatePresence>
        {showPhotoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setShowPhotoModal(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0, 0, 0, 0.82)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              padding: "1.5rem",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.65, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.65, y: 30 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "relative",
                maxWidth: "420px",
                width: "100%",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-accent)",
                borderRadius: "24px",
                padding: "2rem 1.5rem 1.75rem",
                boxShadow: "0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(16,185,129,0.15)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowPhotoModal(false)}
                title="Close (Esc)"
                style={{
                  position: "absolute",
                  top: "14px",
                  right: "14px",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  zIndex: 10,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--text-primary)";
                  e.currentTarget.style.borderColor = "var(--border-accent)";
                  e.currentTarget.style.transform = "scale(1.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-secondary)";
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>

              {/* Photo Frame */}
              <div
                style={{
                  width: "clamp(220px, 65vw, 320px)",
                  height: "clamp(220px, 65vw, 320px)",
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "3px solid var(--accent)",
                  boxShadow: "0 0 35px var(--accent-tint), 0 10px 30px rgba(0,0,0,0.4)",
                  background: "var(--bg-tertiary)",
                  marginBottom: "1.25rem",
                }}
              >
                {!photoError ? (
                  <img
                    src={`${API_BASE}/profile/photo?t=${photoKey}`}
                    alt="Shashank Ganapati Naik"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center top",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "var(--bg-tertiary)",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "Outfit,sans-serif",
                        fontSize: "4.5rem",
                        fontWeight: "700",
                        color: "var(--text-primary)",
                      }}
                    >
                      SN
                    </span>
                  </div>
                )}
              </div>

              {/* Caption */}
              <h3
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "1.3rem",
                  fontWeight: "700",
                  color: "var(--text-primary)",
                  letterSpacing: "-0.02em",
                  marginBottom: "0.2rem",
                }}
              >
                Shashank Ganapati Naik
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.825rem",
                  color: "var(--accent)",
                  fontWeight: "500",
                  letterSpacing: "0.02em",
                }}
              >
                Full Stack & AI Engineer
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) handleClose();
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              backgroundColor: "var(--navbar-bg)",
              backdropFilter: "blur(8px)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 24 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              style={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                borderRadius: "0.5rem",
                padding: "2rem",
                width: "100%",
                maxWidth: "440px",
              }}
            >
              {/* ── STEP: FORM ── */}
              {step === "form" && (
                <>
                  <div className="flex justify-center mb-5">
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        background: "var(--accent-tint)",
                        border: "1px solid var(--border-accent)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <svg
                        className="w-6 h-6 text-accent"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                    </div>
                  </div>

                  <h3 className="font-display text-xl font-bold text-lightest-slate text-center mb-1">
                    Request Resume
                  </h3>
                  <p className="font-mono text-xs text-slate text-center mb-6">
                    Shashank will approve your request and send you a download
                    link
                  </p>

                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="font-mono text-xs text-slate mb-1 block">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, name: e.target.value }))
                        }
                        placeholder="John Doe"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="font-mono text-xs text-slate mb-1 block">
                        Your Email *
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, email: e.target.value }))
                        }
                        placeholder="john@company.com"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="font-mono text-xs text-slate mb-1 block">
                        Reason (optional)
                      </label>
                      <input
                        type="text"
                        value={form.reason}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, reason: e.target.value }))
                        }
                        placeholder="e.g. Job opportunity at Acme Corp"
                        className="input-field"
                      />
                    </div>
                  </div>

                  <p
                    className="font-mono text-xs text-center mb-5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    📬 Your request will be sent to Shashank's Gmail for
                    approval
                  </p>

                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      onClick={handleClose}
                      style={{
                        flex: 1,
                        padding: "0.75rem",
                        border: "1px solid var(--border)",
                        borderRadius: "0.375rem",
                        color: "var(--text-secondary)",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.875rem",
                        backgroundColor: "transparent",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleRequest}
                      disabled={loading}
                      style={{
                        flex: 1,
                        padding: "0.75rem",
                        border: "1px solid var(--border-accent)",
                        borderRadius: "0.375rem",
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.875rem",
                        backgroundColor: "var(--accent-tint)",
                        cursor: loading ? "not-allowed" : "pointer",
                        opacity: loading ? 0.6 : 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                      }}
                    >
                      {loading ? (
                        <>
                          <div
                            style={{
                              width: 14,
                              height: 14,
                              border: "2px solid var(--border)",
                              borderTopColor: "var(--accent)",
                              borderRadius: "50%",
                              animation: "spin 0.8s linear infinite",
                            }}
                          />{" "}
                          Sending...
                        </>
                      ) : (
                        "📨 Send Request"
                      )}
                    </motion.button>
                  </div>
                </>
              )}

              {/* ── STEP: PENDING ── */}
              {step === "pending" && (
                <div className="text-center py-4">
                  <div className="flex justify-center mb-5">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        border: "2px solid var(--border)",
                        borderTopColor: "var(--accent)",
                      }}
                    />
                  </div>
                  <h3 className="font-display text-xl font-bold text-lightest-slate mb-2">
                    Waiting for Approval
                  </h3>
                  <p className="text-slate text-sm mb-1">
                    Your request has been sent to Shashank's Gmail.
                  </p>
                  <p className="text-slate text-sm mb-6">
                    Once he approves, you'll receive a download link at{" "}
                    <span className="text-accent">{form.email}</span>
                  </p>
                  <div
                    style={{
                      background: "var(--accent-tint)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.375rem",
                      padding: "1rem",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <p className="font-mono text-xs text-slate">
                      🔄 Checking for approval every 5 seconds...
                    </p>
                    <p className="font-mono text-xs text-slate mt-1">
                      ⏰ Request expires in 24 hours
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    style={{
                      padding: "0.5rem 1.5rem",
                      border: "1px solid var(--border)",
                      borderRadius: "0.5rem",
                      color: "var(--text-secondary)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.8rem",
                      backgroundColor: "transparent",
                      cursor: "pointer",
                    }}
                  >
                    Close (you'll get an email)
                  </button>
                </div>
              )}

              {/* ── STEP: APPROVED ── */}
              {step === "approved" && (
                <div className="text-center py-4">
                  <div className="flex justify-center mb-5">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        background: "var(--accent-tint)",
                        border: "2px solid var(--border-accent)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.75rem",
                      }}
                    >
                      ✅
                    </motion.div>
                  </div>
                  <h3 className="font-display text-xl font-bold text-accent mb-2">
                    Approved!
                  </h3>
                  <p className="text-slate text-sm mb-6">
                    Shashank approved your request! Click below to download his
                    resume.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDownload}
                    style={{
                      width: "100%",
                      padding: "0.875rem",
                      background: "var(--accent)",
                      color: "var(--bg-primary)",
                      border: "none",
                      borderRadius: "0.375rem",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.95rem",
                      fontWeight: "500",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    <svg
                      style={{ width: 18, height: 18 }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download Resume PDF
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </section>
  );
}
