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
        <div className="section-header center">
          <span className="section-eyebrow">02. Expertise</span>
          <h2 className="section-title">Skills & Technologies</h2>
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
          className={`px-[10px] py-[4px] font-mono text-[13px] font-medium rounded border transition-all ${
            !activeCategory ? 'border-accent text-accent' : 'border-border text-slate hover:border-border-accent hover:text-accent'
          }`}
        >
          All
        </button>
        {skills.map(s => (
          <button
            key={s.category}
            onClick={() => setActiveCategory(s.category === activeCategory ? null : s.category)}
            className={`px-[10px] py-[4px] font-mono text-[13px] font-medium rounded border transition-all ${
              activeCategory === s.category ? 'border-accent text-accent' : 'border-border text-slate hover:border-border-accent hover:text-accent'
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
            whileHover={{ borderColor: 'var(--border-accent)' }}
            className="card flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <h3 className="font-display font-semibold text-lightest-slate text-sm">{cat.category}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {cat.skills?.map((skill, j) => (
                  <motion.span
                    key={skill.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.3, delay: j * 0.05 }}
                    className="tag hover:border-accent hover:text-accent cursor-default"
                  >
                    {skill.name}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
