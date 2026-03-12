import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { sendContact } from '../services/api';
import toast from 'react-hot-toast';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await sendContact(form);
      toast.success('Message sent! I\'ll get back to you soon.');
      setForm({ name: '', email: '', message: '' });
    } catch {
      toast.error('Failed to send message. Try emailing directly!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" ref={ref} className="section-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <div className="section-subtitle-line">
          <h2 className="section-title whitespace-nowrap">Contact</h2>
          <div className="accent-line" />
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-16 items-start">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="font-display text-2xl font-bold text-lightest-slate mb-4">
            Let's Work Together
          </h3>
          <p className="text-slate leading-relaxed mb-8">
            I'm currently open to internship opportunities, freelance projects, and collaborations.
            Whether you have a project idea or just want to say hi, my inbox is always open!
          </p>
          <div className="space-y-4">
            {[
              { icon: '📧', label: 'Email', value: 'shashankng626@gmail.com', href: 'mailto:shashankng626@gmail.com' },
              { icon: '💼', label: 'LinkedIn', value: 'Shashank Naik', href: 'https://www.linkedin.com/in/shashank-naik-6b449428a' },
              { icon: '🐙', label: 'GitHub', value: 'ShashankGanapatiNaik', href: 'https://github.com/ShashankGanapatiNaik' },
            ].map(item => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl border border-lightest-navy hover:border-accent/40 hover:bg-accent/5 transition-all group"
              >
                <span className="text-xl">{item.icon}</span>
                <div>
                  <p className="font-mono text-xs text-slate">{item.label}</p>
                  <p className="text-lightest-slate text-sm group-hover:text-accent transition-colors">{item.value}</p>
                </div>
              </a>
            ))}
          </div>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, x: 30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="card space-y-4"
        >
          <div>
            <label className="font-mono text-xs text-slate mb-2 block">Your Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="input-field"
            />
          </div>
          <div>
            <label className="font-mono text-xs text-slate mb-2 block">Email Address</label>
            <input
              type="email"
              placeholder="john@example.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="input-field"
            />
          </div>
          <div>
            <label className="font-mono text-xs text-slate mb-2 block">Message</label>
            <textarea
              rows={5}
              placeholder="I'd love to discuss..."
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              className="input-field resize-none"
            />
          </div>
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send Message
              </>
            )}
          </motion.button>
        </motion.form>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.6 }}
        className="text-center mt-24 pt-8 border-t border-lightest-navy"
      >
        <p className="font-mono text-xs text-slate">
          Designed & Built by{' '}
          <span className="text-accent">Shashank Ganapati Naik</span>
          {' '}• {new Date().getFullYear()}
        </p>
      </motion.div>
    </section>
  );
}
