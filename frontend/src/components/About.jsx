import { motion } from "framer-motion";

const education = [
  {
    degree: "B.Tech – Computer Science & Engineering",
    institution: "Reva University, Bangalore",
    period: "2023 – Present",
    grade: "CGPA: 9.41 / 10",
    badge: "Current",
  },
  {
    degree: "Pre-University Course (PUC) – Science",
    institution: "Govt. PU College Idagunji, Uttara Kannada",
    period: "2021 – 2023",
    grade: "90.47%",
    badge: "Completed",
  },
];

const interests = [
  "AI & Machine Learning",
  "Full Stack Development",
  "System Architecture",
  "Computer Vision",
  "Problem Solving",
];

export default function About() {
  return (
    <section id="about" className="section-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="section-header left">
          <span className="section-eyebrow">01. Profile</span>
          <h2 className="section-title">About Me</h2>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-12 gap-12 items-start">
        {/* Left – Story (7 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-7 space-y-6"
        >
          <div className="card space-y-4" style={{ padding: "2rem" }}>
            <p className="text-slate leading-relaxed text-base">
              Hey there! I'm{" "}
              <span className="text-accent font-semibold">
                Shashank Ganapati Naik
              </span>
              , a Computer Science Engineering student at Reva University, Bangalore, with a passion for architecting intelligent web applications and AI solutions.
            </p>
            <p className="text-slate leading-relaxed text-base">
              My core technical expertise lies in building full-stack applications with <span className="text-lightest-slate font-medium">React, Node.js, Express, and MongoDB</span>, alongside exploring machine learning models using <span className="text-lightest-slate font-medium">Python & OpenCV</span>.
            </p>
            <p className="text-slate leading-relaxed text-base">
              Recently, I developed an <span className="text-accent font-medium">AI Interview Behavior Analyzer</span> that processes real-time facial expressions to deliver behavioral insights — bridging computer vision with human-centric interfaces.
            </p>

            {/* Career Goals */}
            <div
              style={{
                background: "var(--accent-tint)",
                borderLeft: "3px solid var(--accent)",
                padding: "1rem 1.25rem",
                borderRadius: "0 8px 8px 0",
                marginTop: "1.5rem",
              }}
            >
              <span className="font-mono text-xs text-accent uppercase tracking-wider block mb-1 font-semibold">
                Core Mission
              </span>
              <p className="text-slate text-sm leading-relaxed" style={{ maxWidth: "none" }}>
                To engineer scalable, human-centered software systems and AI tools that make complex computer systems effortless and accessible to users worldwide.
              </p>
            </div>
          </div>

          {/* Interests */}
          <div>
            <span className="font-mono text-xs text-accent uppercase tracking-wider block mb-3 font-semibold">
              Focus Areas & Interests
            </span>
            <div className="flex flex-wrap gap-2">
              {interests.map((item) => (
                <span
                  key={item}
                  className="tag"
                  style={{
                    padding: "6px 14px",
                    borderRadius: "6px",
                    background: "var(--bg-secondary)",
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right – Education & Key Metrics (5 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-5 space-y-6"
        >
          <span className="font-mono text-xs text-accent uppercase tracking-wider block font-semibold">
            Education
          </span>

          <div className="space-y-4">
            {education.map((edu, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -3, borderColor: "var(--border-accent)" }}
                className="card relative"
                style={{ padding: "1.25rem" }}
              >
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h3 className="text-lightest-slate font-display font-semibold text-sm leading-snug">
                    {edu.degree}
                  </h3>
                  <span
                    className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded"
                    style={{
                      background: "var(--accent-tint)",
                      color: "var(--accent)",
                      border: "1px solid var(--border-accent)",
                    }}
                  >
                    {edu.badge}
                  </span>
                </div>
                <p className="text-slate text-xs font-medium">{edu.institution}</p>
                <div className="flex justify-between items-center mt-3 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
                  <span className="font-mono text-[11px] text-slate/70">{edu.period}</span>
                  <span className="font-mono text-xs text-accent font-semibold">{edu.grade}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { label: "CGPA", value: "9.41" },
              { label: "Projects", value: "4+" },
              { label: "Technologies", value: "15+" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="card text-center p-3"
                style={{ background: "var(--bg-secondary)", borderRadius: "8px" }}
              >
                <p className="font-display text-xl font-bold text-accent">
                  {stat.value}
                </p>
                <p className="font-mono text-[10px] text-slate mt-0.5 uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
