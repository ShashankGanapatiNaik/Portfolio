import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { getSkills } from '../services/api';

const FALLBACK_SKILLS = [
  { category: 'Programming Languages', skills: [{ name: 'JavaScript', level: 90 }, { name: 'Python', level: 88 }, { name: 'Java', level: 85 }, { name: 'C', level: 75 }] },
  { category: 'Frontend Technologies', skills: [{ name: 'React.js', level: 90 }, { name: 'HTML5', level: 95 }, { name: 'CSS3', level: 88 }, { name: 'Tailwind CSS', level: 85 }] },
  { category: 'Backend Technologies', skills: [{ name: 'Node.js', level: 88 }, { name: 'Express.js', level: 87 }, { name: 'FastAPI', level: 80 }, { name: 'REST APIs', level: 90 }] },
  { category: 'Databases', skills: [{ name: 'MongoDB', level: 85 }, { name: 'MySQL', level: 80 }] },
  { category: 'AI & Data', skills: [{ name: 'Machine Learning', level: 82 }, { name: 'Deep Learning', level: 78 }, { name: 'NLP', level: 75 }, { name: 'PySpark', level: 72 }] },
  { category: 'Developer Tools', skills: [{ name: 'Git/GitHub', level: 90 }, { name: 'JWT Auth', level: 85 }, { name: 'OpenCV', level: 75 }, { name: 'DeepFace', level: 72 }] },
];

function SkillBar({ name, level, delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="mb-3">
      <div className="flex justify-between mb-1">
        <span className="text-light-slate text-sm font-body">{name}</span>
        <span className="font-mono text-xs text-accent">{level}%</span>
      </div>
      <div className="h-1.5 bg-lightest-navy rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={isInView ? { width: `${level}%` } : { width: 0 }}
          transition={{ duration: 1.2, delay: delay, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-brand-600 to-accent rounded-full"
        />
      </div>
    </div>
  );
}

export default function Skills() {
  const [skills, setSkills] = useState(FALLBACK_SKILLS);
  const [activeCategory, setActiveCategory] = useState(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    getSkills().then(res => { if (res.data?.length) setSkills(res.data); }).catch(() => {});
  }, []);

  const displayed = activeCategory
    ? skills.filter(s => s.category === activeCategory)
    : skills;

  return (
    <section id="skills" ref={ref} className="section-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <div className="section-subtitle-line">
          <h2 className="section-title whitespace-nowrap">Skills</h2>
          <div className="accent-line" />
        </div>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-2 mb-10"
      >
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-4 py-1.5 font-mono text-xs rounded-full border transition-all ${
            !activeCategory ? 'border-accent text-accent bg-accent/10' : 'border-lightest-navy text-slate hover:border-accent/50 hover:text-accent'
          }`}
        >
          All
        </button>
        {skills.map(s => (
          <button
            key={s.category}
            onClick={() => setActiveCategory(s.category === activeCategory ? null : s.category)}
            className={`px-4 py-1.5 font-mono text-xs rounded-full border transition-all ${
              activeCategory === s.category ? 'border-accent text-accent bg-accent/10' : 'border-lightest-navy text-slate hover:border-accent/50 hover:text-accent'
            }`}
          >
            {s.category}
          </button>
        ))}
      </motion.div>

      {/* Skills Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayed.map((cat, i) => (
          <motion.div
            key={cat.category}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            whileHover={{ borderColor: 'rgba(100,255,218,0.3)', y: -4 }}
            className="card"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <h3 className="font-display font-semibold text-lightest-slate text-sm">{cat.category}</h3>
            </div>
            {cat.skills?.map((skill, j) => (
              <SkillBar key={skill.name} name={skill.name} level={skill.level} delay={j * 0.1} />
            ))}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
