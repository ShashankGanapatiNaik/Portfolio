import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { getSkills } from '../services/api';

/* ── Category metadata ── */
const CATEGORY_META = {
  'Programming Languages': { icon: '⌨️', color: '#818cf8', light: 'rgba(129,140,248,0.12)' },
  'Frontend Technologies':  { icon: '🎨', color: '#f472b6', light: 'rgba(244,114,182,0.12)' },
  'Backend Technologies':   { icon: '⚙️', color: '#34d399', light: 'rgba(52,211,153,0.12)'  },
  'Databases':              { icon: '🗄️', color: '#fbbf24', light: 'rgba(251,191,36,0.12)'  },
  'AI & Data':              { icon: '🤖', color: '#60a5fa', light: 'rgba(96,165,250,0.12)'  },
  'Developer Tools':        { icon: '🛠️', color: '#fb923c', light: 'rgba(251,146,60,0.12)'  },
};

const DEFAULT_META = { icon: '💡', color: '#34d399', light: 'rgba(52,211,153,0.12)' };

const FALLBACK_SKILLS = [
  { category: 'Programming Languages', skills: [{ name: 'JavaScript' }, { name: 'Python' }, { name: 'Java' }, { name: 'C' }] },
  { category: 'Frontend Technologies',  skills: [{ name: 'React.js' }, { name: 'HTML5' }, { name: 'CSS3' }, { name: 'Tailwind CSS' }] },
  { category: 'Backend Technologies',   skills: [{ name: 'Node.js' }, { name: 'Express.js' }, { name: 'FastAPI' }, { name: 'REST APIs' }] },
  { category: 'Databases',              skills: [{ name: 'MongoDB' }, { name: 'MySQL' }] },
  { category: 'AI & Data',              skills: [{ name: 'Machine Learning' }, { name: 'Deep Learning' }, { name: 'NLP' }, { name: 'PySpark' }] },
  { category: 'Developer Tools',        skills: [{ name: 'Git/GitHub' }, { name: 'JWT Auth' }, { name: 'OpenCV' }, { name: 'DeepFace' }] },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  show:   { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

const chipVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  show:   { opacity: 1, scale: 1, transition: { duration: 0.25, ease: 'backOut' } },
};

export default function Skills() {
  const [skills, setSkills] = useState(FALLBACK_SKILLS);
  const [activeTab, setActiveTab] = useState('All');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  useEffect(() => {
    getSkills().then(res => { if (res.data?.length) setSkills(res.data); }).catch(() => {});
  }, []);

  const tabs = ['All', ...skills.map(s => s.category)];
  const displayed = activeTab === 'All' ? skills : skills.filter(s => s.category === activeTab);

  return (
    <section id="skills" ref={ref} className="section-container">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="section-header center"
      >
        <span className="section-eyebrow">02. Expertise</span>
        <h2 className="section-title">Skills &amp; Technologies</h2>
        <p className="skills-subtitle">
          A curated stack I've built projects with — from frontend polish to backend infrastructure.
        </p>
      </motion.div>

      {/* Tab strip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="skills-tabs"
      >
        {tabs.map(tab => {
          const meta = tab === 'All' ? { icon: '✦', color: '#34d399' } : (CATEGORY_META[tab] || DEFAULT_META);
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="skills-tab"
              style={{
                '--tab-color': meta.color,
                borderColor:   active ? meta.color : 'transparent',
                color:         active ? meta.color : 'var(--text-secondary)',
                background:    active ? `${meta.color}14` : 'transparent',
              }}
            >
              <span className="skills-tab-icon">{meta.icon}</span>
              <span className="skills-tab-label">
                {tab === 'All' ? 'All' : tab.replace(' Technologies', '').replace(' & Data', ' & AI')}
              </span>
            </button>
          );
        })}
      </motion.div>

      {/* Card grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="skills-grid"
        >
          {displayed.map((cat) => {
            const meta = CATEGORY_META[cat.category] || DEFAULT_META;
            return (
              <motion.div
                key={cat.category}
                variants={cardVariants}
                className="skills-card"
                style={{ '--card-color': meta.color, '--card-bg': meta.light }}
                whileHover="hovered"
              >
                {/* Card glow border on hover */}
                <div className="skills-card-glow" />

                {/* Card header */}
                <div className="skills-card-header">
                  <div className="skills-card-icon" style={{ background: meta.light, color: meta.color }}>
                    {meta.icon}
                  </div>
                  <div>
                    <h3 className="skills-card-title">{cat.category}</h3>
                    <p className="skills-card-count">{cat.skills?.length} skills</p>
                  </div>
                </div>

                {/* Divider */}
                <div className="skills-card-divider" style={{ background: `linear-gradient(90deg, ${meta.color}50, transparent)` }} />

                {/* Skill chips */}
                <motion.div
                  className="skills-chips"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                >
                  {cat.skills?.map((skill) => (
                    <motion.span
                      key={skill.name}
                      variants={chipVariants}
                      className="skills-chip"
                      style={{ '--chip-color': meta.color }}
                      whileHover={{ scale: 1.06, y: -2 }}
                    >
                      {skill.name}
                    </motion.span>
                  ))}
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
