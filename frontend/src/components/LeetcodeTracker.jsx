import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getLeetcodeData } from "../services/api";

const FALLBACK = {
  totalSolved: 142,
  easySolved: 75,
  mediumSolved: 58,
  hardSolved: 9,
  easyTotal: 876,
  mediumTotal: 1845,
  hardTotal: 812,
  ranking: 285400,
  acceptanceRate: 64.5,
  streak: 14,
  totalActiveDays: 85,
  profileUrl: "https://leetcode.com/u/shashanknaik6226/",
};


const COLORS = { Easy: "#00b8a3", Medium: "#ffa116", Hard: "#ff375f" };

function ConcentricProgress({ easySolved, easyTotal, mediumSolved, mediumTotal, hardSolved, hardTotal, totalSolved }) {
  const rEasy = 76;
  const rMed = 58;
  const rHard = 40;

  const cEasy = 2 * Math.PI * rEasy;
  const cMed = 2 * Math.PI * rMed;
  const cHard = 2 * Math.PI * rHard;

  const pctEasy = easyTotal > 0 ? easySolved / easyTotal : 0;
  const pctMed = mediumTotal > 0 ? mediumSolved / mediumTotal : 0;
  const pctHard = hardTotal > 0 ? hardSolved / hardTotal : 0;

  return (
    <div style={{ position: "relative", width: 220, height: 220, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
      <svg width={220} height={220} style={{ transform: "rotate(-90deg)" }}>
        {/* Background track rings */}
        <circle cx={110} cy={110} r={rEasy} fill="transparent" stroke="var(--border)" strokeWidth={7} opacity={0.4} />
        <circle cx={110} cy={110} r={rMed} fill="transparent" stroke="var(--border)" strokeWidth={7} opacity={0.4} />
        <circle cx={110} cy={110} r={rHard} fill="transparent" stroke="var(--border)" strokeWidth={7} opacity={0.4} />

        {/* Easy Ring */}
        <motion.circle
          cx={110} cy={110} r={rEasy}
          fill="transparent"
          stroke={COLORS.Easy}
          strokeWidth={7}
          strokeDasharray={cEasy}
          initial={{ strokeDashoffset: cEasy }}
          animate={{ strokeDashoffset: cEasy - (cEasy * pctEasy) }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 3px ${COLORS.Easy}66)` }}
        />

        {/* Medium Ring */}
        <motion.circle
          cx={110} cy={110} r={rMed}
          fill="transparent"
          stroke={COLORS.Medium}
          strokeWidth={7}
          strokeDasharray={cMed}
          initial={{ strokeDashoffset: cMed }}
          animate={{ strokeDashoffset: cMed - (cMed * pctMed) }}
          transition={{ duration: 1.4, delay: 0.15, ease: "easeOut" }}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 3px ${COLORS.Medium}66)` }}
        />

        {/* Hard Ring */}
        <motion.circle
          cx={110} cy={110} r={rHard}
          fill="transparent"
          stroke={COLORS.Hard}
          strokeWidth={7}
          strokeDasharray={cHard}
          initial={{ strokeDashoffset: cHard }}
          animate={{ strokeDashoffset: cHard - (cHard * pctHard) }}
          transition={{ duration: 1.4, delay: 0.3, ease: "easeOut" }}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 3px ${COLORS.Hard}66)` }}
        />
      </svg>
      {/* Center content */}
      <div style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none"
      }}>
        <span style={{ fontSize: "2.25rem", fontWeight: "800", color: "var(--text-primary)", fontFamily: "var(--font-sans)", lineHeight: 1, letterSpacing: "-1px" }}>
          {totalSolved}
        </span>
        <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--text-light)", marginTop: "4px", textTransform: "uppercase", letterSpacing: "1px" }}>
          Solved
        </span>
      </div>
    </div>
  );
}

export default function LeetcodeTracker() {
  const [data, setData] = useState(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeetcodeData()
      .then((res) => setData({ ...FALLBACK, ...res.data }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "Acceptance Rate", value: `${data.acceptanceRate}%`, icon: "🎯" },
    { label: "Current Streak", value: `${data.streak} Days`, icon: "🔥" },
    { label: "Global Ranking", value: data.ranking ? `#${data.ranking.toLocaleString()}` : "N/A", icon: "🏆" },
    { label: "Active Days", value: `${data.totalActiveDays || 0} Days`, icon: "⚡" },
  ];

  const diffStats = [
    { label: "Easy", solved: data.easySolved, total: data.easyTotal, color: COLORS.Easy },
    { label: "Medium", solved: data.mediumSolved, total: data.mediumTotal, color: COLORS.Medium },
    { label: "Hard", solved: data.hardSolved, total: data.hardTotal, color: COLORS.Hard },
  ];

  return (
    <section id="leetcode" className="section-container">
      <div className="section-header center">
        <span className="section-eyebrow">04. Problem Solving</span>
        <h2 className="section-title">LeetCode Activity</h2>
      </div>

      {loading ? (
        <div className="card contrib-skeleton" style={{ height: 320 }} />
      ) : (
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          {/* Concentric Progress Ring Ring Panel */}
          <div
            className="lg:col-span-5 card flex flex-col justify-between"
            style={{
              background: "linear-gradient(135deg, var(--bg-secondary) 0%, rgba(255, 161, 22, 0.02) 100%)",
              position: "relative"
            }}
          >
            {/* Visual top border line */}
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 2, background: "linear-gradient(90deg, transparent, rgba(255, 161, 22, 0.25), transparent)" }} />

            <div className="text-center mb-4">
              <span className="font-mono text-[11px] text-accent uppercase tracking-wider">Metrics Overview</span>
              <h3 className="font-display font-semibold text-lightest-slate text-sm mt-1">Concentric Distribution</h3>
            </div>

            <ConcentricProgress
              easySolved={data.easySolved}
              easyTotal={data.easyTotal}
              mediumSolved={data.mediumSolved}
              mediumTotal={data.mediumTotal}
              hardSolved={data.hardSolved}
              hardTotal={data.hardTotal}
              totalSolved={data.totalSolved}
            />

            {/* Concentric Legend labels */}
            <div className="flex justify-center gap-6 mt-6">
              {diffStats.map((d) => (
                <div key={d.label} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color, boxShadow: `0 0 6px ${d.color}aa` }} />
                  <span className="font-mono text-xs text-slate">
                    {d.label}: <span className="text-lightest-slate font-medium">{d.solved}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats details & progress bars */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-6">
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  whileHover={{ y: -4, borderColor: "var(--border-accent)" }}
                  className="card p-4 flex items-center gap-4 transition-all"
                  style={{ background: "var(--bg-secondary)", borderRadius: "8px" }}
                >
                  <div style={{ fontSize: "1.75rem", userSelect: "none" }}>{stat.icon}</div>
                  <div>
                    <p className="font-display text-lg font-bold text-accent leading-none mb-1">{stat.value}</p>
                    <p className="font-mono text-[10px] text-slate uppercase tracking-wider">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Custom high-end linear progress bars */}
            <div
              className="card space-y-5"
              style={{
                background: "var(--bg-secondary)",
                borderRadius: "8px"
              }}
            >
              {diffStats.map(({ label, solved, total, color }, index) => {
                const percentage = total > 0 ? (solved / total) * 100 : 0;
                return (
                  <div key={label}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-mono text-xs font-semibold uppercase tracking-wider" style={{ color }}>{label}</span>
                      <span className="font-mono text-xs text-slate">{solved} <span className="text-slate/40">/</span> {total} <span className="text-lightest-slate font-medium">({percentage.toFixed(1)}%)</span></span>
                    </div>
                    <div className="h-2.5 bg-lightest-navy rounded-full overflow-hidden relative" style={{ background: "var(--bg-primary)", border: "1px solid var(--border)" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1.2, delay: 0.3 + index * 0.1, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${color}cc, ${color})`,
                          boxShadow: `0 0 8px ${color}88`
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="flex justify-end">
              <motion.a
                href={data.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary inline-flex items-center gap-2 text-xs"
              >
                View LeetCode Profile →
              </motion.a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
