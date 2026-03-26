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
      className="relative min-h-screen flex items-center grid-bg overflow-hidden"
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

      <div className="section-container w-full pt-32 pb-16">
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
            <motion.p
              variants={itemVariants}
              className="font-mono text-accent text-base mb-4"
            >
              Hi, my name is
            </motion.p>

            <motion.h1
              variants={itemVariants}
              className="font-display text-3xl sm:text-5xl md:text-7xl font-bold text-lightest-slate leading-tight mb-2"
            >
              Shashank Ganapati Naik.
            </motion.h1>

            <motion.h2
              variants={itemVariants}
              className="font-display text-xl sm:text-3xl md:text-5xl font-bold text-slate leading-tight mb-6"
            >
              I'm a{" "}
              <span className="text-accent typing-cursor">{typedText}</span>
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="font-body text-slate text-sm sm:text-lg leading-relaxed mb-10"
            >
              Motivated CS student at{" "}
              <span className="text-accent font-medium">Reva University</span>{" "}
              with CGPA <span className="text-accent font-medium">9.41/10</span>
              . Passionate about building scalable web applications and
              AI-powered solutions.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-4 mb-10"
            >
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 20px rgba(100,255,218,0.3)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowModal(true);
                  setStep("form");
                }}
                className="btn-primary flex items-center gap-2"
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
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download Resume
              </motion.button>
              <motion.a
                href="#projects"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-filled"
              >
                View Projects →
              </motion.a>
            </motion.div>

            {/* Social Links — hidden on very small screens */}
            <motion.div
              variants={itemVariants}
              className="hidden sm:flex items-center gap-6 flex-wrap"
            >
              {[
                {
                  label: "GitHub",
                  href: "https://github.com/ShashankGanapatiNaik",
                  icon: "M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z",
                },
                {
                  label: "LinkedIn",
                  href: "https://www.linkedin.com/in/shashank-naik-6b449428a",
                  icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
                },
                {
                  label: "LeetCode",
                  href: "https://leetcode.com/u/shashanknaik6226/",
                  icon: "M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z",
                },
              ].map(({ label, href, icon }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2 }}
                  className="text-slate hover:text-accent transition-colors duration-200"
                  title={label}
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d={icon} />
                  </svg>
                </motion.a>
              ))}
              <div className="h-px w-16 bg-slate/40" />
              <a
                href="mailto:shashankng626@gmail.com"
                className="font-mono text-xs text-slate hover:text-accent transition-colors"
              >
                shashankng626@gmail.com
              </a>
            </motion.div>
          </motion.div>

          {/* ── RIGHT: Profile Photo ── */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ position: "relative" }}>
              {/* Spinning gradient ring */}
              <div
                style={{
                  position: "absolute",
                  inset: "-4px",
                  borderRadius: "50%",
                  background:
                    "conic-gradient(from 0deg, #64ffda, #0d9488, #112240, #64ffda)",
                  animation: "spin 6s linear infinite",
                  zIndex: 0,
                }}
              />
              {/* White gap ring */}
              <div
                style={{
                  position: "absolute",
                  inset: "-1px",
                  borderRadius: "50%",
                  background: "#0a192f",
                  zIndex: 1,
                }}
              />
              {/* Photo */}
              <div
                style={{
                  position: "relative",
                  width: "clamp(160px, 25vw, 300px)",
                  height: "clamp(160px, 25vw, 300px)",
                  borderRadius: "50%",
                  overflow: "hidden",
                  zIndex: 2,
                  background: "#112240",
                }}
              >
                <img
                  src={`${API_BASE}/profile/photo`}
                  alt="Shashank Ganapati Naik"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center top",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.parentNode.innerHTML =
                      '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#112240,#233554);"><span style="font-family:Syne,sans-serif;font-size:5rem;font-weight:800;color:#64ffda;">SN</span></div>';
                  }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="font-mono text-xs text-slate">scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-0.5 h-8"
          style={{
            background: "linear-gradient(to bottom, #64ffda, transparent)",
          }}
        />
      </motion.div>

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
              backgroundColor: "rgba(10,25,47,0.88)",
              backdropFilter: "blur(8px)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 24 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              style={{
                backgroundColor: "#112240",
                border: "1px solid #233554",
                borderRadius: "1rem",
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
                        background: "rgba(100,255,218,0.1)",
                        border: "1px solid rgba(100,255,218,0.3)",
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
                    style={{ color: "#8892b0" }}
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
                        border: "1px solid #233554",
                        borderRadius: "0.5rem",
                        color: "#8892b0",
                        fontFamily: "JetBrains Mono, monospace",
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
                        border: "1px solid #64ffda",
                        borderRadius: "0.5rem",
                        color: "#64ffda",
                        fontFamily: "JetBrains Mono, monospace",
                        fontSize: "0.875rem",
                        backgroundColor: "rgba(100,255,218,0.1)",
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
                              border: "2px solid rgba(100,255,218,0.3)",
                              borderTopColor: "#64ffda",
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
                        border: "2px solid #233554",
                        borderTopColor: "#64ffda",
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
                      background: "rgba(100,255,218,0.05)",
                      border: "1px solid rgba(100,255,218,0.15)",
                      borderRadius: "0.75rem",
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
                      border: "1px solid #233554",
                      borderRadius: "0.5rem",
                      color: "#8892b0",
                      fontFamily: "JetBrains Mono, monospace",
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
                        background: "rgba(100,255,218,0.15)",
                        border: "2px solid #64ffda",
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
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleDownload}
                    style={{
                      width: "100%",
                      padding: "0.875rem",
                      background: "#64ffda",
                      color: "#0a192f",
                      border: "none",
                      borderRadius: "0.5rem",
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: "0.95rem",
                      fontWeight: "bold",
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
