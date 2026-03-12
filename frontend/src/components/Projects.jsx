import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { getProjects } from '../services/api';

const FALLBACK_PROJECTS = [
  {
    _id: '1',
    title: 'AI Interview Behavior Analyzer',
    description: 'Full-stack AI system analyzing interview behavior and emotions from recorded videos or live webcam streams using DeepFace and OpenCV for real-time facial emotion detection.',
    techStack: ['React.js', 'Node.js', 'FastAPI', 'Python', 'DeepFace', 'OpenCV', 'MongoDB Atlas'],
    githubLink: 'https://github.com/ShashankGanapatiNaik/Ai_Interview_Analyzer',
    liveDemo: '',
    featured: true,
  },
  {
    _id: '2',
    title: 'Energy Consumption Forecasting',
    description: 'Analyzed large-scale smart meter data using PySpark and ML models to predict electricity consumption patterns at scale using distributed computing.',
    techStack: ['PySpark', 'Machine Learning', 'Python', 'Big Data', 'Pandas', 'Matplotlib'],
    githubLink: 'https://github.com/ShashankGanapatiNaik/Energy_Consumtion_Forecasting',
    liveDemo: '',
    featured: true,
  },
  {
    _id: '3',
    title: 'Food Delivery Web Application',
    description: 'Full-stack food delivery platform with authentication, payment integration, real-time order processing, cart management, and restaurant browsing.',
    techStack: ['React.js', 'Node.js', 'MongoDB', 'Express.js', 'JWT Auth', 'Stripe'],
    githubLink: 'https://github.com/ShashankGanapatiNaik/foodie-fullstack',
    liveDemo: '',
    featured: true,
  },
  {
    _id: '4',
    title: 'Movie Recommendation System',
    description: 'ML-based recommendation system suggesting movies using content-based filtering and cosine similarity. Deployed as an interactive Streamlit web app.',
    techStack: ['Python', 'Machine Learning', 'Streamlit', 'Scikit-learn', 'TMDB API'],
    githubLink: 'https://github.com/ShashankGanapatiNaik/Movie-Recommandation',
    liveDemo: '',
    featured: false,
  },
];

const ALL_TECHS = ['All', 'React.js', 'Node.js', 'Python', 'Machine Learning', 'MongoDB', 'FastAPI'];

function ProjectCard({ project, index }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -8, borderColor: 'rgba(100,255,218,0.4)' }}
      className="card flex flex-col h-full group relative overflow-hidden"
    >
      {project.featured && (
        <div className="absolute top-4 right-4">
          <span className="font-mono text-xs text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-full">
            ★ Featured
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </div>
        <div className="flex gap-3">
          {project.githubLink && (
            <a href={project.githubLink} target="_blank" rel="noopener noreferrer"
              className="text-slate hover:text-accent transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          )}
          {project.liveDemo && (
            <a href={project.liveDemo} target="_blank" rel="noopener noreferrer"
              className="text-slate hover:text-accent transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      </div>

      <h3 className="font-display font-bold text-lightest-slate text-lg mb-3 group-hover:text-accent transition-colors">
        {project.title}
      </h3>
      <p className="text-slate text-sm leading-relaxed mb-5 flex-1">{project.description}</p>

      {/* Tech Stack */}
      <div className="flex flex-wrap gap-2 mt-auto">
        {project.techStack?.slice(0, 5).map(tech => (
          <span key={tech} className="font-mono text-xs text-slate hover:text-accent transition-colors">{tech}</span>
        ))}
        {project.techStack?.length > 5 && (
          <span className="font-mono text-xs text-slate">+{project.techStack.length - 5}</span>
        )}
      </div>
    </motion.div>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState(FALLBACK_PROJECTS);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    getProjects().then(res => {
      if (res.data?.length) setProjects(res.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'All'
    ? projects
    : projects.filter(p => p.techStack?.some(t => t.toLowerCase().includes(filter.toLowerCase())));

  return (
    <section id="projects" ref={ref} className="section-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <div className="section-subtitle-line">
          <h2 className="section-title whitespace-nowrap">Projects</h2>
          <div className="accent-line" />
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-2 mb-10"
      >
        {ALL_TECHS.map(tech => (
          <button
            key={tech}
            onClick={() => setFilter(tech)}
            className={`px-4 py-1.5 font-mono text-xs rounded-full border transition-all ${
              filter === tech ? 'border-accent text-accent bg-accent/10' : 'border-lightest-navy text-slate hover:border-accent/50 hover:text-accent'
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
