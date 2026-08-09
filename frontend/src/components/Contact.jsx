import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { sendContact } from "../services/api";
import toast from "react-hot-toast";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await sendContact(form);
      toast.success("Message sent! I'll get back to you soon.");
      setForm({ name: "", email: "", message: "" });
    } catch {
      toast.error("Failed to send message. Try emailing directly!");
    } finally {
      setLoading(false);
    }
  };

  const contactOptions = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      label: "Email",
      value: "shashankng626@gmail.com",
      href: "mailto:shashankng626@gmail.com",
      color: "rgba(52, 211, 153, 0.15)",
      hoverGlow: "rgba(52, 211, 153, 0.35)",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
      label: "LinkedIn",
      value: "Shashank Naik",
      href: "https://www.linkedin.com/in/shashank-naik-6b449428a",
      color: "rgba(10, 102, 194, 0.15)",
      hoverGlow: "rgba(10, 102, 194, 0.35)",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      ),
      label: "GitHub",
      value: "ShashankGanapatiNaik",
      href: "https://github.com/ShashankGanapatiNaik",
      color: "rgba(245, 245, 245, 0.08)",
      hoverGlow: "rgba(245, 245, 245, 0.2)",
    },
  ];

  return (
    <section id="contact" ref={ref} className="section-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <div className="section-header center">
          <span className="section-eyebrow">06. Get in Touch</span>
          <h2 className="section-title">Contact</h2>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-12 gap-12 items-start">
        {/* Info Left */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-5 space-y-6"
        >
          <div>
            <h3 className="font-display text-2xl font-bold text-lightest-slate mb-3">
              Let's Build Something
            </h3>
            <p className="text-slate leading-relaxed text-sm">
              I'm open to internship opportunities, freelance projects, and collaborations.
              Whether you have an interesting proposal or just a quick question, feel free to drop a message!
            </p>
          </div>

          <div className="space-y-3">
            {contactOptions.map((item, i) => (
              <motion.a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.25 + i * 0.08 }}
                whileHover={{ y: -3, borderColor: "var(--border-accent)" }}
                className="flex items-center gap-4 p-4 rounded-lg border border-border transition-all group"
                style={{
                  background: "var(--bg-secondary)",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: item.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-primary)",
                  }}
                  className="transition-all duration-300 group-hover:scale-110"
                >
                  {item.icon}
                </div>
                <div>
                  <p className="font-mono text-[10px] text-slate uppercase tracking-wider">{item.label}</p>
                  <p className="text-lightest-slate text-sm font-medium group-hover:text-accent transition-colors">
                    {item.value}
                  </p>
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Form Right */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="lg:col-span-7 card p-8 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, var(--bg-secondary) 0%, rgba(52, 211, 153, 0.02) 100%)",
          }}
        >
          {/* Top subtle glow line */}
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 2, background: "linear-gradient(90deg, transparent, rgba(52, 211, 153, 0.25), transparent)" }} />

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-xs text-slate mb-1.5 block">Your Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="input-field-glow input-field"
                />
              </div>
              <div>
                <label className="font-mono text-xs text-slate mb-1.5 block">Email Address</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="input-field-glow input-field"
                />
              </div>
            </div>
            <div>
              <label className="font-mono text-xs text-slate mb-1.5 block">Message</label>
              <textarea
                rows={5}
                placeholder="Hi, I'd like to talk about..."
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                className="input-field-glow input-field resize-none"
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                padding: "0.75rem",
                background: "var(--accent-tint)",
                border: "1px solid var(--border-accent)",
              }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>Send Message</span>
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
