import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { RadialBarChart, RadialBar, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { getLeetcodeData } from '../services/api';

const FALLBACK = {
  totalSolved: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0,
  easyTotal: 876, mediumTotal: 1845, hardTotal: 812,
  ranking: 0, acceptanceRate: 0, streak: 0,
  profileUrl: 'https://leetcode.com/u/shashanknaik6226/',
};

const COLORS = { Easy: '#00b8a3', Medium: '#ffa116', Hard: '#ff375f' };

export default function LeetcodeTracker() {
  const [data, setData] = useState(FALLBACK);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    getLeetcodeData()
      .then(res => setData({ ...FALLBACK, ...res.data }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pieData = [
    { name: 'Easy', value: data.easySolved, color: COLORS.Easy },
    { name: 'Medium', value: data.mediumSolved, color: COLORS.Medium },
    { name: 'Hard', value: data.hardSolved, color: COLORS.Hard },
  ];

  const diffStats = [
    { label: 'Easy', solved: data.easySolved, total: data.easyTotal, color: COLORS.Easy },
    { label: 'Medium', solved: data.mediumSolved, total: data.mediumTotal, color: COLORS.Medium },
    { label: 'Hard', solved: data.hardSolved, total: data.hardTotal, color: COLORS.Hard },
  ];

  return (
    <section ref={ref} className="bg-light-navy/30">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="section-subtitle-line">
            <h2 className="section-title whitespace-nowrap">LeetCode Stats</h2>
            <div className="accent-line" />
          </div>
        </motion.div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <div key={i} className="card h-32 skeleton" />)}
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Donut Chart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="card flex flex-col items-center"
            >
              <div className="relative w-full h-64">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData.filter(d => d.value > 0)}
                      cx="50%" cy="50%"
                      innerRadius={70} outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#112240', border: '1px solid #233554', borderRadius: '8px', color: '#ccd6f6', fontFamily: 'JetBrains Mono' }}
                      formatter={(v, n) => [v, n]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="font-display text-3xl font-bold text-accent">{data.totalSolved}</p>
                  <p className="font-mono text-xs text-slate">Solved</p>
                </div>
              </div>

              {/* Legend */}
              <div className="flex gap-6 mt-2">
                {pieData.map(d => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                    <span className="font-mono text-xs text-slate">{d.name}: <span className="text-lightest-slate">{d.value}</span></span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-4"
            >
              {/* Top Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { label: 'Acceptance Rate', value: `${data.acceptanceRate}%` },
                  { label: 'Current Streak', value: `${data.streak} days` },
                  { label: 'Global Ranking', value: data.ranking ? `#${data.ranking.toLocaleString()}` : 'N/A' },
                  { label: 'Active Days', value: `${data.totalActiveDays}` },
                ].map(stat => (
                  <div key={stat.label} className="card py-3 px-4 text-center">
                    <p className="font-display text-xl font-bold text-accent">{stat.value}</p>
                    <p className="font-mono text-xs text-slate mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Difficulty Bars */}
              {diffStats.map(({ label, solved, total, color }) => (
                <div key={label}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono text-sm font-medium" style={{ color }}>{label}</span>
                    <span className="font-mono text-xs text-slate">{solved} / {total}</span>
                  </div>
                  <div className="h-2 bg-lightest-navy rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={isInView ? { width: total > 0 ? `${(solved / total) * 100}%` : '0%' } : { width: 0 }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: color }}
                    />
                  </div>
                </div>
              ))}

              <a
                href={data.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2 mt-4 text-xs"
              >
                View LeetCode Profile →
              </a>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}
