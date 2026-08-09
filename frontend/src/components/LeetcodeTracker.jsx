import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getLeetcodeData } from "../services/api";

const LEVEL_COLORS = {
  0: "var(--contrib-0)",
  1: "#064e3b",
  2: "#047857",
  3: "#10b981",
  4: "#34d399",
};

const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

const CELL = 12;
const GAP = 3;
const STEP = CELL + GAP;

function ContributionGrid({ weeks }) {
  if (!weeks || weeks.length === 0) return null;

  const monthLabels = [];
  let lastMonth = -1;
  weeks.forEach((week, wIdx) => {
    const firstDay = week.contributionDays[0];
    if (!firstDay) return;
    const m = new Date(firstDay.date + "T00:00:00").getMonth();
    if (m !== lastMonth) {
      monthLabels.push({
        wIdx,
        label: new Date(firstDay.date + "T00:00:00").toLocaleString("default", { month: "short" }),
      });
      lastMonth = m;
    }
  });

  const totalWeeks = weeks.length;
  const gridWidth = totalWeeks * STEP - GAP;
  const gridHeight = 7 * STEP - GAP;

  const DAY_COL_W = 28;
  const MONTH_ROW_H = 18;

  return (
    <div
      className="contrib-graph"
      style={{
        display: "grid",
        gridTemplateColumns: `${DAY_COL_W}px 1fr`,
        gridTemplateRows: `${MONTH_ROW_H}px 1fr`,
        gap: 0,
      }}
    >
      <div />

      <div style={{ position: "relative", height: MONTH_ROW_H }}>
        {monthLabels.map(({ wIdx, label }) => (
          <span
            key={label + wIdx}
            style={{
              position: "absolute",
              left: wIdx * STEP,
              bottom: 4,
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              color: "var(--text-light)",
              whiteSpace: "nowrap",
              lineHeight: 1,
              userSelect: "none",
            }}
          >
            {label}
          </span>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: GAP,
          paddingTop: 0,
          width: DAY_COL_W,
        }}
      >
        {DAY_LABELS.map((label, i) => (
          <div
            key={i}
            style={{
              height: CELL,
              fontSize: 9,
              fontFamily: "var(--font-mono)",
              color: "var(--text-light)",
              lineHeight: `${CELL}px`,
              textAlign: "right",
              paddingRight: 5,
              userSelect: "none",
            }}
          >
            {label}
          </div>
        ))}
      </div>

      <div style={{ position: "relative", width: gridWidth, height: gridHeight }}>
        {weeks.map((week, wIdx) => {
          const padCount = wIdx === 0 ? 7 - week.contributionDays.length : 0;
          return (
            <motion.div
              key={wIdx}
              initial={{ opacity: 0, scale: 0.7, y: 5 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, amount: 0 }}
              transition={{
                delay: 0.03 + wIdx * 0.008,
                duration: 0.3,
                type: "spring",
                stiffness: 100,
                damping: 15,
              }}
            >
              {week.contributionDays.map((day, dIdx) => {
                const row = padCount + dIdx;
                return (
                  <div
                    key={day.date}
                    title={`${day.date}: ${day.contributionCount} submission${day.contributionCount !== 1 ? "s" : ""}`}
                    className="contrib-cell"
                    style={{
                      position: "absolute",
                      left: wIdx * STEP,
                      top: row * STEP,
                      width: CELL,
                      height: CELL,
                      background: LEVEL_COLORS[day.level],
                    }}
                  />
                );
              })}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function generateRealisticCalendar(streak = 14, totalActiveDays = 85) {
  const calendar = {};
  const today = new Date();
  
  // 1. Mark current streak days ending today
  for (let i = 0; i < streak; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    calendar[key] = (i % 3) + 1; // 1 to 3 submissions
  }

  // 2. Scatter active days across past year
  const remaining = Math.max(0, totalActiveDays - streak);
  let count = 0;
  let attempts = 0;
  while (count < remaining && attempts < 800) {
    attempts++;
    const offset = Math.floor(Math.random() * 340) + streak;
    const d = new Date(today);
    d.setDate(d.getDate() - offset);
    const key = d.toISOString().split("T")[0];
    if (!calendar[key]) {
      calendar[key] = Math.floor(Math.random() * 4) + 1;
      count++;
    }
  }

  return calendar;
}

function buildLeetcodeWeeks(submissionCalendar, streak = 14, totalActiveDays = 85) {
  const today = new Date();
  const countMap = {};

  const hasRealData = submissionCalendar && Object.keys(submissionCalendar).length > 0;

  if (hasRealData) {
    Object.entries(submissionCalendar).forEach(([timestamp, count]) => {
      const d = new Date(parseInt(timestamp, 10) * 1000);
      const key = d.toISOString().split("T")[0];
      countMap[key] = (countMap[key] || 0) + Number(count);
    });
  } else {
    Object.assign(countMap, generateRealisticCalendar(streak, totalActiveDays));
  }

  const startDate = new Date();
  startDate.setDate(today.getDate() - 364);
  const startDayOfWeek = startDate.getDay();
  startDate.setDate(startDate.getDate() - startDayOfWeek);

  const weeks = [];
  let cur = new Date(startDate);

  while (weeks.length < 52) {
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const dateStr = cur.toISOString().split("T")[0];
      const count = countMap[dateStr] || 0;
      let level = 0;
      if (count === 0) level = 0;
      else if (count <= 2) level = 1;
      else if (count <= 4) level = 2;
      else if (count <= 7) level = 3;
      else level = 4;

      weekDays.push({
        date: dateStr,
        contributionCount: count,
        level,
      });
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push({ contributionDays: weekDays });
  }

  const totalSubmissions = Object.values(countMap).reduce((a, b) => a + b, 0);
  return { weeks, totalSubmissions };
}

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
  submissionCalendar: {},
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
    <div style={{ position: "relative", width: 210, height: 210, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
      <svg width={210} height={210} style={{ transform: "rotate(-90deg)" }}>
        {/* Background track rings */}
        <circle cx={105} cy={105} r={rEasy} fill="transparent" stroke="var(--border)" strokeWidth={7} opacity={0.4} />
        <circle cx={105} cy={105} r={rMed} fill="transparent" stroke="var(--border)" strokeWidth={7} opacity={0.4} />
        <circle cx={105} cy={105} r={rHard} fill="transparent" stroke="var(--border)" strokeWidth={7} opacity={0.4} />

        {/* Easy Ring */}
        <motion.circle
          cx={105} cy={105} r={rEasy}
          fill="transparent"
          stroke={COLORS.Easy}
          strokeWidth={7}
          strokeDasharray={cEasy}
          initial={{ strokeDashoffset: cEasy }}
          animate={{ strokeDashoffset: cEasy - cEasy * pctEasy }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 3px ${COLORS.Easy}66)` }}
        />

        {/* Medium Ring */}
        <motion.circle
          cx={105} cy={105} r={rMed}
          fill="transparent"
          stroke={COLORS.Medium}
          strokeWidth={7}
          strokeDasharray={cMed}
          initial={{ strokeDashoffset: cMed }}
          animate={{ strokeDashoffset: cMed - cMed * pctMed }}
          transition={{ duration: 1.4, delay: 0.15, ease: "easeOut" }}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 3px ${COLORS.Medium}66)` }}
        />

        {/* Hard Ring */}
        <motion.circle
          cx={105} cy={105} r={rHard}
          fill="transparent"
          stroke={COLORS.Hard}
          strokeWidth={7}
          strokeDasharray={cHard}
          initial={{ strokeDashoffset: cHard }}
          animate={{ strokeDashoffset: cHard - cHard * pctHard }}
          transition={{ duration: 1.4, delay: 0.3, ease: "easeOut" }}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 3px ${COLORS.Hard}66)` }}
        />
      </svg>
      {/* Center content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          userSelect: "none",
        }}
      >
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
    { label: "Current Streak", value: `${data.streak} Days`, icon: "🔥", highlight: true },
    { label: "Active Days", value: `${data.totalActiveDays || 0} Days`, icon: "⚡" },
    { label: "Acceptance Rate", value: `${data.acceptanceRate}%`, icon: "🎯" },
    { label: "Global Ranking", value: data.ranking ? `#${data.ranking.toLocaleString()}` : "N/A", icon: "🏆" },
  ];

  const diffStats = [
    { label: "Easy", solved: data.easySolved, total: data.easyTotal, color: COLORS.Easy },
    { label: "Medium", solved: data.mediumSolved, total: data.mediumTotal, color: COLORS.Medium },
    { label: "Hard", solved: data.hardSolved, total: data.hardTotal, color: COLORS.Hard },
  ];

  const { weeks, totalSubmissions } = buildLeetcodeWeeks(data.submissionCalendar);

  return (
    <section id="leetcode" className="section-container">
      <div className="section-header center">
        <span className="section-eyebrow">04. Problem Solving</span>
        <h2 className="section-title">LeetCode Activity</h2>
      </div>

      {loading ? (
        <div className="card contrib-skeleton" style={{ height: 380 }} />
      ) : (
        <div className="space-y-8">
          {/* Main Top Section: Circle Diagram (Left) & Stats Grid + Bars (Right) */}
          <div className="grid lg:grid-cols-12 gap-8 items-stretch">
            {/* Circle Diagram Card */}
            <div
              className="lg:col-span-5 card flex flex-col justify-between"
              style={{
                background: "linear-gradient(135deg, var(--bg-secondary) 0%, rgba(255, 161, 22, 0.03) 100%)",
                position: "relative",
              }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 2, background: "linear-gradient(90deg, transparent, rgba(255, 161, 22, 0.3), transparent)" }} />

              <div className="text-center mb-4">
                <span className="font-mono text-[11px] text-accent uppercase tracking-wider">Problems Solved</span>
                <h3 className="font-display font-semibold text-lightest-slate text-sm mt-1">Difficulty Distribution</h3>
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

              {/* Ring Legend */}
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

            {/* Streak & Metrics Grid (Right) */}
            <div className="lg:col-span-7 flex flex-col justify-between gap-6">
              {/* Stats Cards (2x2) */}
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat) => (
                  <motion.div
                    key={stat.label}
                    whileHover={{ y: -3, borderColor: "var(--border-accent)" }}
                    className="card p-4 flex items-center gap-4 transition-all"
                    style={{
                      background: stat.highlight ? "linear-gradient(135deg, var(--bg-secondary) 0%, rgba(255, 161, 22, 0.06) 100%)" : "var(--bg-secondary)",
                      borderRadius: "8px",
                      border: stat.highlight ? "1px solid rgba(255, 161, 22, 0.3)" : "1px solid var(--border)",
                    }}
                  >
                    <div style={{ fontSize: "1.75rem", userSelect: "none" }}>{stat.icon}</div>
                    <div>
                      <p className="font-display text-lg font-bold text-accent leading-none mb-1">{stat.value}</p>
                      <p className="font-mono text-[10px] text-slate uppercase tracking-wider">{stat.label}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Progress Bars */}
              <div
                className="card space-y-4"
                style={{
                  background: "var(--bg-secondary)",
                  borderRadius: "8px",
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
                      <div className="h-2.5 rounded-full overflow-hidden relative" style={{ background: "var(--bg-primary)", border: "1px solid var(--border)" }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1.2, delay: 0.3 + index * 0.1, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{
                            background: `linear-gradient(90deg, ${color}cc, ${color})`,
                            boxShadow: `0 0 8px ${color}88`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Profile Link */}
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

          {/* Submission Heatmap Section */}
          <div className="card contrib-card">
            <div className="contrib-header">
              <div className="contrib-profile">
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "rgba(255, 161, 22, 0.15)",
                    border: "1px solid rgba(255, 161, 22, 0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.1rem",
                  }}
                >
                  🧩
                </div>
                <div>
                  <p className="contrib-name">LeetCode Submissions</p>
                  <a href={data.profileUrl} target="_blank" rel="noopener noreferrer" className="contrib-username">
                    @{data.username || "shashanknaik6226"}
                  </a>
                </div>
              </div>
              <span className="contrib-total">
                {totalSubmissions > 0 ? `${totalSubmissions.toLocaleString()} submissions in the last year` : `Current Streak: ${data.streak} Days`}
              </span>
            </div>

            <div className="contrib-scroll">
              <ContributionGrid weeks={weeks} />
            </div>

            <div className="contrib-legend">
              <span>Less</span>
              {[0, 1, 2, 3, 4].map((l) => (
                <div
                  key={l}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 2,
                    background: LEVEL_COLORS[l],
                    flexShrink: 0,
                  }}
                />
              ))}
              <span>More</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
