import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const education = [
  {
    degree: "B.Tech – Computer Science & Engineering",
    institution: "Reva University, Bangalore",
    period: "2023 – Present",
    grade: "CGPA: 9.41 / 10",
    color: "from-accent/20 to-transparent",
  },
  {
    degree: "Pre-University Course (PUC) – Science",
    institution: "Govt. PU College Idagunji, Uttara Kannada",
    period: "2021 – 2023",
    grade: "90.47%",
    color: "from-brand-600/20 to-transparent",
  },
];

const interests = [
  "AI & Machine Learning",
  "Full Stack Development",
  "System Design",
  "Competitive Programming",
  "Hackathons",
];

export default function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" ref={ref} className="section-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <div className="section-subtitle-line">
          <h2 className="section-title whitespace-nowrap">About Me</h2>
          <div className="accent-line" />
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-16 items-start">
        {/* Left – Story */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-5"
        >
          <p className="text-slate leading-relaxed text-base">
            Hey! I'm{" "}
            <span className="text-accent font-medium">
              Shashank Ganapati Naik
            </span>
            , a Computer Science student at Reva University, Bangalore, with a
            passion for turning complex problems into elegant digital solutions.
          </p>
          <p className="text-slate leading-relaxed text-base">
            My journey into tech began with curiosity about how websites worked,
            which led me down the rabbit hole of{" "}
            <span className="text-lightest-slate">full-stack development</span>.
            As I grew as a developer, I became deeply fascinated by{" "}
            <span className="text-lightest-slate">machine learning and AI</span>{" "}
            — particularly how intelligent systems can be built to understand
            human behavior.
          </p>
          <p className="text-slate leading-relaxed text-base">
            I built an{" "}
            <span className="text-accent font-medium">
              AI Interview Behavior Analyzer
            </span>{" "}
            that uses computer vision to detect emotions from video — a project
            that combines my love for both web development and AI. I enjoy
            working across the full stack and pushing the limits of what
            technology can do.
          </p>

          {/* Career Goals */}
          <div className="border-l-2 border-accent pl-4 py-1 mt-4">
            <p className="font-mono text-xs text-accent mb-1">Career Goals</p>
            <p className="text-slate text-sm leading-relaxed">
              To become a skilled software engineer specializing in full-stack
              and AI-driven applications, building scalable systems that solve
              real-world problems and contribute to innovative technology
              solutions.
            </p>
          </div>

          {/* Interests */}
          <div className="pt-4">
            <p className="font-mono text-xs text-accent mb-3">Interests</p>
            <div className="flex flex-wrap gap-2">
              {interests.map((i) => (
                <span key={i} className="tag">
                  {i}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right – Education */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="font-mono text-xs text-accent mb-6">Education</p>
          <div className="space-y-4">
            {education.map((edu, i) => (
              <motion.div
                key={i}
                whileHover={{
                  scale: 1.02,
                  borderColor: "rgba(100,255,218,0.4)",
                }}
                className="card relative overflow-hidden"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${edu.color} pointer-events-none`}
                />
                <div className="relative">
                  <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                    <h3 className="text-lightest-slate font-display font-semibold text-sm leading-tight">
                      {edu.degree}
                    </h3>
                    <span className="font-mono text-accent text-xs bg-accent/10 px-2 py-1 rounded whitespace-nowrap">
                      {edu.grade}
                    </span>
                  </div>
                  <p className="text-slate text-sm">{edu.institution}</p>
                  <p className="font-mono text-xs text-slate/60 mt-1">
                    {edu.period}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            {[
              { label: "CGPA", value: "9.41" },
              { label: "Projects", value: "4+" },
              { label: "Technologies", value: "20+" },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                whileHover={{ scale: 1.05 }}
                className="bg-light-navy border border-lightest-navy rounded-xl p-4 text-center"
              >
                <p className="font-display text-2xl font-bold text-accent">
                  {stat.value}
                </p>
                <p className="font-mono text-xs text-slate mt-1">
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
