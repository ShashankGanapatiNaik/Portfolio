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

      <div className="grid lg:grid-cols-12 gap-10 items-start">
        {/* Left – Story (7 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-7 space-y-6"
        >
          <div className="card space-y-4" style={{ padding: "2.25rem" }}>
            <p className="text-slate leading-relaxed text-base" style={{ color: "var(--text-secondary)" }}>
              Hey there! I'm{" "}
              <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                Shashank Ganapati Naik
              </span>
              , a Computer Science Engineering student at Reva University, Bangalore, with a passion for architecting intelligent web applications and AI solutions.
            </p>

            <p className="text-slate leading-relaxed text-base" style={{ color: "var(--text-secondary)" }}>
              My core technical expertise lies in building full-stack applications with{" "}
              <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                React, Node.js, Express, and MongoDB
              </span>
              , alongside exploring machine learning models using{" "}
              <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                Python & OpenCV
              </span>
              .
            </p>

            <p className="text-slate leading-relaxed text-base" style={{ color: "var(--text-secondary)" }}>
              Recently, I developed an{" "}
              <span style={{ color: "var(--accent)", fontWeight: 600 }}>
                AI Interview Behavior Analyzer
              </span>{" "}
              that processes real-time facial expressions to deliver behavioral insights — bridging computer vision with human-centric interfaces.
            </p>

            {/* Core Mission Callout */}
            <div
              style={{
                background: "var(--accent-tint)",
                borderLeft: "3px solid var(--accent)",
                padding: "1.1rem 1.35rem",
                borderRadius: "0 10px 10px 0",
                marginTop: "1.5rem",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.72rem",
                  color: "var(--accent)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  display: "block",
                  marginBottom: "0.3rem",
                  fontWeight: 600,
                }}
              >
                Core Mission
              </span>
              <p
                style={{
                  color: "var(--text-primary)",
                  fontSize: "0.875rem",
                  lineHeight: 1.6,
                  margin: 0,
                  fontWeight: 400,
                }}
              >
                To engineer scalable, human-centered software systems and AI tools that make complex computer systems effortless and accessible to users worldwide.
              </p>
            </div>
          </div>

          {/* Interests Tags */}
          <div>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.72rem",
                color: "var(--accent)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                display: "block",
                marginBottom: "0.75rem",
                fontWeight: 600,
              }}
            >
              Focus Areas & Interests
            </span>
            <div className="flex flex-wrap gap-2.5">
              {interests.map((item) => (
                <motion.span
                  key={item}
                  whileHover={{ y: -2, borderColor: "var(--border-accent)" }}
                  style={{
                    padding: "7px 16px",
                    borderRadius: "8px",
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                    fontSize: "0.825rem",
                    fontWeight: 500,
                    fontFamily: "var(--font-sans)",
                    transition: "border-color 0.2s ease, transform 0.2s ease",
                  }}
                >
                  {item}
                </motion.span>
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
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.72rem",
              color: "var(--accent)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              display: "block",
              fontWeight: 600,
            }}
          >
            Education
          </span>

          <div className="space-y-4">
            {education.map((edu, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -3, borderColor: "var(--border-accent)" }}
                className="card relative"
                style={{
                  padding: "1.35rem",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: "14px",
                  transition: "all 0.2s ease",
                }}
              >
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h3
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      color: "var(--text-primary)",
                      lineHeight: 1.35,
                      margin: 0,
                    }}
                  >
                    {edu.degree}
                  </h3>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.65rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      padding: "3px 8px",
                      borderRadius: "6px",
                      background: "var(--accent-tint)",
                      color: "var(--accent)",
                      border: "1px solid var(--border-accent)",
                      flexShrink: 0,
                    }}
                  >
                    {edu.badge}
                  </span>
                </div>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.8rem",
                    margin: "4px 0 0 0",
                    fontWeight: 500,
                  }}
                >
                  {edu.institution}
                </p>

                <div
                  className="flex justify-between items-center mt-4 pt-3"
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                    {edu.period}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--accent)", fontWeight: 700 }}>
                    {edu.grade}
                  </span>
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
              <motion.div
                key={stat.label}
                whileHover={{ y: -2, borderColor: "var(--border-accent)" }}
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  padding: "1rem 0.5rem",
                  textAlign: "center",
                  transition: "border-color 0.2s ease",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "1.4rem",
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    margin: 0,
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.68rem",
                    color: "var(--accent)",
                    marginTop: "6px",
                    marginBottom: 0,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontWeight: 600,
                  }}
                >
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

