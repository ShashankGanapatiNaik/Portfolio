import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { getProjects } from "../services/api";

const FALLBACK_PROJECTS = [
  {
    _id: "1",
    title: "AI Interview Behavior Analyzer",
    description:
      "Full-stack AI system analyzing interview behavior and emotions from recorded videos or live webcam streams using DeepFace and OpenCV for real-time facial emotion detection.",
    techStack: ["React.js", "Node.js", "FastAPI", "Python", "DeepFace", "OpenCV", "MongoDB Atlas"],
    githubLink: "https://github.com/ShashankGanapatiNaik/Ai_Interview_Analyzer",
    liveDemo: "",
    featured: true,
    accent: "#818cf8",
  },
  {
    _id: "2",
    title: "Energy Consumption Forecasting",
    description:
      "Analyzed large-scale smart meter data using PySpark and ML models to predict electricity consumption patterns at scale using distributed computing.",
    techStack: ["PySpark", "Machine Learning", "Python", "Big Data", "Pandas", "Matplotlib"],
    githubLink: "https://github.com/ShashankGanapatiNaik/Energy_Consumtion_Forecasting",
    liveDemo: "",
    featured: true,
    accent: "#60a5fa",
  },
  {
    _id: "3",
    title: "Food Delivery Web Application",
    description:
      "Full-stack food delivery platform with authentication, payment integration, real-time order processing, cart management, and restaurant browsing.",
    techStack: ["React.js", "Node.js", "MongoDB", "Express.js", "JWT Auth", "Stripe"],
    githubLink: "https://github.com/ShashankGanapatiNaik/foodie-fullstack",
    liveDemo: "",
    featured: true,
    accent: "#34d399",
  },
  {
    _id: "4",
    title: "Movie Recommendation System",
    description:
      "ML-based recommendation system suggesting movies using content-based filtering and cosine similarity. Deployed as an interactive Streamlit web app.",
    techStack: ["Python", "Machine Learning", "Streamlit", "Scikit-learn", "TMDB API"],
    githubLink: "https://github.com/ShashankGanapatiNaik/Movie-Recommandation",
    liveDemo: "",
    featured: false,
    accent: "#fbbf24",
  },
];

const ACCENT_POOL = ["#818cf8", "#60a5fa", "#34d399", "#fbbf24", "#f472b6", "#fb923c"];

const ALL_TECHS = ["All", "React.js", "Node.js", "Python", "Machine Learning", "MongoDB", "FastAPI"];

/* SVG Icons */
const GithubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

const ExternalIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

function ProjectCard({ project, index }) {
  const accent = project.accent || ACCENT_POOL[index % ACCENT_POOL.length];
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 32, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94, y: 12 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="proj-card"
      style={{ "--proj-accent": accent }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -6 }}
    >
      {/* Accent top bar */}
      <div className="proj-card-bar" />

      {/* Glow overlay */}
      <div className={`proj-card-glow${hovered ? " proj-card-glow--on" : ""}`} />

      {/* Header */}
      <div className="proj-card-header">
        <div className="proj-card-folder" style={{ color: accent, borderColor: `${accent}40`, background: `${accent}12` }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
          </svg>
        </div>

        <div className="proj-card-links">
          {project.liveDemo && (
            <motion.a
              href={project.liveDemo}
              target="_blank"
              rel="noopener noreferrer"
              className="proj-icon-btn"
              whileHover={{ scale: 1.15 }}
              title="Live Demo"
            >
              <ExternalIcon />
            </motion.a>
          )}
          {project.githubLink && (
            <motion.a
              href={project.githubLink}
              target="_blank"
              rel="noopener noreferrer"
              className="proj-icon-btn"
              whileHover={{ scale: 1.15 }}
              title="GitHub"
            >
              <GithubIcon />
            </motion.a>
          )}
        </div>
      </div>

      {/* Featured badge */}
      {project.featured && (
        <div className="proj-featured-badge" style={{ color: accent, borderColor: `${accent}40`, background: `${accent}12` }}>
          ✦ Featured
        </div>
      )}

      {/* Title & description */}
      <h3 className="proj-title">{project.title}</h3>
      <p className="proj-desc">{project.description}</p>

      {/* Tech chips */}
      <div className="proj-chips">
        {project.techStack?.slice(0, 5).map((tech) => (
          <span key={tech} className="proj-chip" style={{ "--chip-color": accent }}>
            {tech}
          </span>
        ))}
        {project.techStack?.length > 5 && (
          <span className="proj-chip-more">+{project.techStack.length - 5}</span>
        )}
      </div>

      {/* Bottom CTA */}
      {project.githubLink && (
        <div className="proj-footer">
          <a
            href={project.githubLink}
            target="_blank"
            rel="noopener noreferrer"
            className="proj-cta"
            style={{ color: accent }}
          >
            View on GitHub
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
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
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    getProjects()
      .then((res) => { if (res.data?.length) setProjects(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === "All"
      ? projects
      : projects.filter((p) => p.techStack?.some((t) => t.toLowerCase().includes(filter.toLowerCase())));

  return (
    <section id="projects" ref={ref} className="section-container">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="section-header left"
      >
        <span className="section-eyebrow">03. Selected Works</span>
        <h2 className="section-title">Projects</h2>
        <p className="proj-subtitle">
          Things I've built — spanning AI, full-stack web, and data engineering.
        </p>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="proj-stats"
      >
        <div className="proj-stat">
          <span className="proj-stat-num">{projects.length}</span>
          <span className="proj-stat-label">Projects</span>
        </div>
        <div className="proj-stat-divider" />
        <div className="proj-stat">
          <span className="proj-stat-num">{projects.filter(p => p.featured).length}</span>
          <span className="proj-stat-label">Featured</span>
        </div>
        <div className="proj-stat-divider" />
        <div className="proj-stat">
          <span className="proj-stat-num">{[...new Set(projects.flatMap(p => p.techStack || []))].length}</span>
          <span className="proj-stat-label">Technologies</span>
        </div>
      </motion.div>

      {/* Filter chips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.25 }}
        className="proj-filters"
      >
        {ALL_TECHS.map((tech) => (
          <button
            key={tech}
            onClick={() => setFilter(tech)}
            className={`proj-filter-btn${filter === tech ? " proj-filter-btn--active" : ""}`}
          >
            {tech}
          </button>
        ))}
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="proj-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="proj-skeleton" />
          ))}
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.div layout className="proj-grid">
            {filtered.map((project, i) => (
              <ProjectCard key={project._id} project={project} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {filtered.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="proj-empty"
        >
          <span>No projects found for "{filter}"</span>
        </motion.div>
      )}
    </section>
  );
}
