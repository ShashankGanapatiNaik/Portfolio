import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { getProjects } from "../services/api";

const FALLBACK_PROJECTS = [
  {
    _id: "1",
    title: "AI Interview Behavior Analyzer",
    description:
      "Full-stack AI system analyzing interview behavior and emotions from recorded videos or live webcam streams using DeepFace and OpenCV for real-time facial emotion detection.",
    techStack: [
      "React.js",
      "Node.js",
      "FastAPI",
      "Python",
      "DeepFace",
      "OpenCV",
      "MongoDB Atlas",
    ],
    githubLink: "https://github.com/ShashankGanapatiNaik/Ai_Interview_Analyzer",
    liveDemo: "",
    featured: true,
  },
  {
    _id: "2",
    title: "Energy Consumption Forecasting",
    description:
      "Analyzed large-scale smart meter data using PySpark and ML models to predict electricity consumption patterns at scale using distributed computing.",
    techStack: [
      "PySpark",
      "Machine Learning",
      "Python",
      "Big Data",
      "Pandas",
      "Matplotlib",
    ],
    githubLink:
      "https://github.com/ShashankGanapatiNaik/Energy_Consumtion_Forecasting",
    liveDemo: "",
    featured: true,
  },
  {
    _id: "3",
    title: "Food Delivery Web Application",
    description:
      "Full-stack food delivery platform with authentication, payment integration, real-time order processing, cart management, and restaurant browsing.",
    techStack: [
      "React.js",
      "Node.js",
      "MongoDB",
      "Express.js",
      "JWT Auth",
      "Stripe",
    ],
    githubLink: "https://github.com/ShashankGanapatiNaik/foodie-fullstack",
    liveDemo: "",
    featured: true,
  },
  {
    _id: "4",
    title: "Movie Recommendation System",
    description:
      "ML-based recommendation system suggesting movies using content-based filtering and cosine similarity. Deployed as an interactive Streamlit web app.",
    techStack: [
      "Python",
      "Machine Learning",
      "Streamlit",
      "Scikit-learn",
      "TMDB API",
    ],
    githubLink: "https://github.com/ShashankGanapatiNaik/Movie-Recommandation",
    liveDemo: "",
    featured: false,
  },
];

const ALL_TECHS = [
  "All",
  "React.js",
  "Node.js",
  "Python",
  "Machine Learning",
  "MongoDB",
  "FastAPI",
];

function ProjectCard({ project, index }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ borderColor: "var(--border-accent)" }}
      className="card flex flex-col h-full group relative overflow-hidden"
    >
      {/* Header — folder icon and featured badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg border border-border flex items-center justify-center flex-shrink-0 text-slate">
            <svg
              className="w-5 h-5 text-slate"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"
              />
            </svg>
          </div>
          {project.featured && (
            <span className="font-mono text-[11px] text-slate border border-border px-2 py-0.5 rounded">
              ★ Featured
            </span>
          )}
        </div>
      </div>

      <h3 className="font-display font-semibold text-lightest-slate text-base mb-2">
        {project.title}
      </h3>
      <p className="text-slate text-sm leading-relaxed mb-4 flex-1">
        {project.description}
      </p>

      {/* Tech Stack */}
      <div className="flex flex-wrap gap-2 mt-auto">
        {project.techStack?.slice(0, 5).map((tech) => (
          <span
            key={tech}
            className="font-mono text-[11px] text-slate border border-border px-2 py-0.5 rounded"
          >
            {tech}
          </span>
        ))}
        {project.techStack?.length > 5 && (
          <span className="font-mono text-[11px] text-slate px-2 py-0.5">
            +{project.techStack.length - 5}
          </span>
        )}
      </div>

      {/* Footer Links */}
      {(project.githubLink || project.liveDemo) && (
        <div className="flex gap-4 mt-4 pt-3 border-t border-border/40">
          {project.githubLink && (
            <a
              href={project.githubLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate hover:text-accent transition-colors inline-flex items-center gap-0.5"
            >
              GitHub →
            </a>
          )}
          {project.liveDemo && (
            <a
              href={project.liveDemo}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate hover:text-accent transition-colors inline-flex items-center gap-0.5"
            >
              Live Demo →
            </a>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState(FALLBACK_PROJECTS);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    getProjects()
      .then((res) => {
        if (res.data?.length) setProjects(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === "All"
      ? projects
      : projects.filter((p) =>
          p.techStack?.some((t) =>
            t.toLowerCase().includes(filter.toLowerCase()),
          ),
        );

  return (
    <section id="projects" ref={ref} className="section-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <div className="section-header left">
          <span className="section-eyebrow">03. Selected Works</span>
          <h2 className="section-title">Projects</h2>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-2 mb-10"
      >
        {ALL_TECHS.map((tech) => (
          <button
            key={tech}
            onClick={() => setFilter(tech)}
            className={`px-[10px] py-[4px] font-mono text-[13px] font-medium rounded transition-all border ${
              filter === tech
                ? "border-accent text-accent"
                : "border-border text-slate hover:border-border-accent hover:text-accent"
            }`}
          >
            {tech}
          </button>
        ))}
      </motion.div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card h-64 skeleton" />
          ))}
        </div>
      ) : (
        <motion.div layout className="grid md:grid-cols-2 gap-6">
          <AnimatePresence>
            {filtered.map((project, i) => (
              <ProjectCard key={project._id} project={project} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {filtered.length === 0 && !loading && (
        <div className="text-center py-16 text-slate">
          <p className="font-mono text-sm">No projects found for "{filter}"</p>
        </div>
      )}
    </section>
  );
}
