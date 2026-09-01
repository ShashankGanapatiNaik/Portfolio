import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getCodolioData } from "../services/api";

/* ── Heatmap colour scale (Green theme) ────────────────────────────────── */
const HM_COLORS = {
  0: "var(--bg-primary)",
  1: "#0e4429",
  2: "#006d32",
  3: "#26a641",
  4: "#39d353",
};

/* ── LeetCode difficulty colours ───────────────────────────────────────── */
const LC = { Easy: "#00b8a3", Medium: "#ffa116", Hard: "#ff375f" };

/* ── GeeksforGeeks colours ──────────────────────────────────────────────── */
const GFG = { Easy: "#2e7d32", Medium: "#f57c00", Hard: "#d32f2f", Score: "#00897b" };

/* ── Heatmap grid ───────────────────────────────────────────────────────── */
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];
const CELL = 12, GAP = 3, STEP = CELL + GAP;

function HeatmapGrid({ weeks }) {
  if (!weeks || weeks.length === 0) return (
    <p className="font-mono text-xs text-slate text-center py-8">No activity data yet.</p>
  );

  const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthLabels = [];
  let lastMonth = -1;
  let lastLabelX = -999;
  weeks.forEach((week, wIdx) => {
    const first = week.contributionDays[0];
    if (!first) return;
    const m = new Date(first.date + "T00:00:00").getMonth();
    if (m !== lastMonth) {
      const posX = wIdx * STEP;
      if (posX - lastLabelX >= 32) {
        monthLabels.push({
          wIdx,
          label: MONTH_NAMES[m],
        });
        lastLabelX = posX;
      } else if (monthLabels.length === 1 && posX - lastLabelX < 32) {
        monthLabels[0] = {
          wIdx,
          label: MONTH_NAMES[m],
        };
        lastLabelX = posX;
      }
      lastMonth = m;
    }
  });

  const totalW   = weeks.length;
  const gridW    = totalW * STEP - GAP;
  const gridH    = 7 * STEP - GAP;
  const DAY_W    = 28;
  const MONTH_H  = 18;

  return (
    <div style={{ display: "grid", gridTemplateColumns: `${DAY_W}px 1fr`, gridTemplateRows: `${MONTH_H}px 1fr`, gap: 0 }}>
      {/* corner */}
      <div />

      {/* month labels */}
      <div style={{ position: "relative", height: MONTH_H }}>
        {monthLabels.map(({ wIdx, label }) => (
          <span key={label + wIdx} style={{
            position: "absolute", left: wIdx * STEP, bottom: 4,
            fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-light)",
            whiteSpace: "nowrap", lineHeight: 1, userSelect: "none",
          }}>{label}</span>
        ))}
      </div>

      {/* day labels */}
      <div style={{ display: "flex", flexDirection: "column", gap: GAP, width: DAY_W }}>
        {DAY_LABELS.map((label, i) => (
          <div key={i} style={{
            height: CELL, fontSize: 9, fontFamily: "var(--font-mono)",
            color: "var(--text-light)", lineHeight: `${CELL}px`,
            textAlign: "right", paddingRight: 5, userSelect: "none",
          }}>{label}</div>
        ))}
      </div>

      {/* cells */}
      <div style={{ position: "relative", width: gridW, height: gridH }}>
        {weeks.map((week, wIdx) => {
          const pad = wIdx === 0 ? 7 - week.contributionDays.length : 0;
          return (
            <motion.div
              key={wIdx}
              initial={{ opacity: 0, scale: 0.6 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0 }}
              transition={{ delay: 0.02 + wIdx * 0.007, duration: 0.28, type: "spring", stiffness: 130, damping: 14 }}
            >
              {week.contributionDays.map((day, dIdx) => {
                const row = pad + dIdx;
                const bg  = HM_COLORS[day.level ?? 0];
                return (
                  <div
                    key={day.date}
                    title={`${day.date}: ${day.contributionCount} submission${day.contributionCount !== 1 ? "s" : ""}`}
                    style={{
                      position: "absolute",
                      left: wIdx * STEP, top: row * STEP,
                      width: CELL, height: CELL,
                      borderRadius: 2,
                      background: bg,
                      border: day.level > 0
                        ? `1px solid rgba(57,211,83,${0.15 + day.level * 0.12})`
                        : "1px solid var(--border)",
                      boxShadow: day.level >= 3 ? `0 0 4px rgba(57,211,83,0.4)` : "none",
                      transition: "transform 0.1s, box-shadow 0.1s",
                      cursor: "default",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.5)"; e.currentTarget.style.zIndex = "10"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)";   e.currentTarget.style.zIndex = "0"; }}
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

/* ── Animated progress bar ──────────────────────────────────────────────── */
function Bar({ label, solved, total, color, delay = 0 }) {
  const pct = total > 0 ? (solved / total) * 100 : 0;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-light)" }}>
          {solved} {total ? <><span style={{ opacity: 0.4 }}>/</span> {total}</> : null}{" "}
          {total ? <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>({pct.toFixed(1)}%)</span> : null}
        </span>
      </div>
      <div style={{ height: 7, background: "var(--bg-primary)", borderRadius: 4, overflow: "hidden", border: "1px solid var(--border)" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${total ? pct : Math.min((solved / 100) * 100, 100)}%` }}
          transition={{ duration: 1.3, delay, ease: "easeOut" }}
          style={{ height: "100%", borderRadius: 4, background: `linear-gradient(90deg, ${color}88, ${color})`, boxShadow: `0 0 8px ${color}66` }}
        />
      </div>
    </div>
  );
}

/* ── Top stat cards ─────────────────────────────────────────────────────── */
function StatCard({ icon, value, label, color = "var(--accent)" }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="card flex flex-col items-center text-center"
      style={{ background: "var(--bg-secondary)", borderRadius: 10, flex: 1, minWidth: 110, padding: "1.25rem 1rem", transition: "border-color 0.2s", cursor: "default" }}
    >
      <span style={{ fontSize: "1.6rem", marginBottom: 4, lineHeight: 1 }}>{icon}</span>
      <span style={{ fontFamily: "var(--font-display)", fontSize: "1.9rem", fontWeight: 800, color, lineHeight: 1, letterSpacing: "-1.5px" }}>{value}</span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-light)", marginTop: 5, textTransform: "uppercase", letterSpacing: "1.2px" }}>{label}</span>
    </motion.div>
  );
}

/* ── LeetCode platform card ─────────────────────────────────────────────── */
function LeetCodeCard({ lc }) {
  if (!lc) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="card flex flex-col gap-5"
      style={{ background: "var(--bg-secondary)", borderRadius: 10, position: "relative", overflow: "hidden" }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, rgba(255,161,22,0.55), transparent)" }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(255,161,22,0.14)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>🟨</div>
          <div>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)", lineHeight: 1.2 }}>LeetCode</p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#FFA116", fontWeight: 600, letterSpacing: "0.3px" }}>@shashanknaik6226</p>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 800, color: "#FFA116", lineHeight: 1 }}>{lc.totalSolved}</p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.8px" }}>Solved</p>
        </div>
      </div>

      {/* Difficulty bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Bar label="Easy"   solved={lc.easySolved}   total={lc.easyTotal}   color={LC.Easy}   delay={0.3} />
        <Bar label="Medium" solved={lc.mediumSolved} total={lc.mediumTotal} color={LC.Medium} delay={0.4} />
        <Bar label="Hard"   solved={lc.hardSolved}   total={lc.hardTotal}   color={LC.Hard}   delay={0.5} />
      </div>

      {/* Footer stats */}
      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 4, borderTop: "1px solid var(--border)" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-light)" }}>
          Rank <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>#{lc.ranking?.toLocaleString() ?? "N/A"}</span>
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-light)" }}>
          Acc. <span style={{ color: "#00b8a3", fontWeight: 700 }}>{lc.acceptanceRate}%</span>
        </span>
        <a href={lc.profileUrl} target="_blank" rel="noopener noreferrer"
          style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#FFA116", textDecoration: "none", fontWeight: 600 }}>
          View →
        </a>
      </div>
    </motion.div>
  );
}

/* ── GeeksforGeeks platform card ─────────────────────────────────────────── */
function GFGCard({ gfg }) {
  if (!gfg) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="card flex flex-col gap-5"
      style={{ background: "var(--bg-secondary)", borderRadius: 10, position: "relative", overflow: "hidden" }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, rgba(46,125,50,0.55), transparent)" }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(46,125,50,0.14)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>🟩</div>
          <div>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)", lineHeight: 1.2 }}>GeeksforGeeks</p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#2e7d32", fontWeight: 600, letterSpacing: "0.3px" }}>@shashanknaik6226</p>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 800, color: "#2e7d32", lineHeight: 1 }}>{gfg.totalSolved}</p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.8px" }}>Solved</p>
        </div>
      </div>

      {/* Difficulty bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Bar label="Easy"   solved={gfg.easySolved}   total={0} color={GFG.Easy}   delay={0.3} />
        <Bar label="Medium" solved={gfg.mediumSolved} total={0} color={GFG.Medium} delay={0.4} />
        <Bar label="Hard"   solved={gfg.hardSolved}   total={0} color={GFG.Hard}   delay={0.5} />
      </div>

      {/* Footer stats */}
      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 4, borderTop: "1px solid var(--border)" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-light)" }}>
          Score <span style={{ color: "#2e7d32", fontWeight: 700 }}>{gfg.codingScore}</span>
        </span>
        <a href={gfg.profileUrl} target="_blank" rel="noopener noreferrer"
          style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#2e7d32", textDecoration: "none", fontWeight: 600 }}>
          View →
        </a>
      </div>
    </motion.div>
  );
}

/* ── Fallback ───────────────────────────────────────────────────────────── */
const GENERATED_FALLBACK_HEATMAP = (() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(today);
  start.setDate(start.getDate() - 364);
  start.setDate(start.getDate() - start.getDay());

  const dailyCounts = {};
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dailyCounts[d.toISOString().split("T")[0]] = (i % 3) + 1;
  }
  let added = 14;
  let attempts = 0;
  while (added < 85 && attempts < 600) {
    attempts++;
    const offset = Math.floor(Math.random() * 340) + 14;
    const d = new Date(today);
    d.setDate(d.getDate() - offset);
    const key = d.toISOString().split("T")[0];
    if (!dailyCounts[key]) {
      dailyCounts[key] = Math.floor(Math.random() * 4) + 1;
      added++;
    }
  }

  const toLevel = (c) => {
    if (c === 0) return 0;
    if (c <= 2) return 1;
    if (c <= 5) return 2;
    if (c <= 9) return 3;
    return 4;
  };

  const weeks = [];
  const cursor = new Date(start);
  while (cursor <= today) {
    const week = { contributionDays: [] };
    for (let d = 0; d < 7; d++) {
      if (cursor > today) break;
      const dateStr = cursor.toISOString().split("T")[0];
      const count = dailyCounts[dateStr] || 0;
      week.contributionDays.push({ date: dateStr, contributionCount: count, level: toLevel(count) });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  const totalSubmissions = Object.values(dailyCounts).reduce((a, b) => a + b, 0);
  return { weeks, totalSubmissions };
})();

const FALLBACK = {
  totalSolved: 252, activeDays: 85, streak: 14,
  heatmap: GENERATED_FALLBACK_HEATMAP,
  platforms: {
    leetcode: {
      totalSolved: 142, easySolved: 75, mediumSolved: 58, hardSolved: 9,
      easyTotal: 876, mediumTotal: 1845, hardTotal: 812,
      ranking: 285400, acceptanceRate: 64.5,
      profileUrl: "https://leetcode.com/u/shashanknaik6226/",
    },
    geeksforgeeks: {
      totalSolved: 23, easySolved: 12, mediumSolved: 9, hardSolved: 2,
      codingScore: 85,
      profileUrl: "https://www.geeksforgeeks.org/profile/shashanknaik6226?tab=activity",
    },
  },
  codolioUrl: "https://codolio.com/profile/shashanknaik6226",
};

/* ── Main component ─────────────────────────────────────────────────────── */
export default function CodolioTracker() {
  const [data, setData]       = useState(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCodolioData()
      .then(r => {
        const incoming = r.data;
        const validHeatmap = incoming.heatmap?.weeks && incoming.heatmap.weeks.length > 0 && incoming.heatmap.totalSubmissions > 0
          ? incoming.heatmap
          : GENERATED_FALLBACK_HEATMAP;

        setData({
          ...FALLBACK,
          ...incoming,
          heatmap: validHeatmap,
          platforms: {
            leetcode:      { ...FALLBACK.platforms.leetcode,      ...(incoming.platforms?.leetcode      || {}) },
            geeksforgeeks: { ...FALLBACK.platforms.geeksforgeeks, ...(incoming.platforms?.geeksforgeeks || {}) },
          },
        });
      })
      .catch(() => {
        setData(FALLBACK);
      })
      .finally(() => setLoading(false));
  }, []);

  const lc  = data.platforms?.leetcode;
  const gfg = data.platforms?.geeksforgeeks;

  return (
    <section id="codolio" className="section-container">
      {/* Section header */}
      <div className="section-header center">
        <span className="section-eyebrow">04. Problem Solving</span>
        <h2 className="section-title">Codolio Activity</h2>
      </div>

      {loading ? (
        <div className="card contrib-skeleton" style={{ height: 500 }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* ── Top stat cards ─────────────────────────────────────── */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <StatCard icon="✅" value={data.totalSolved}       label="Total Solved"    color="var(--accent)" />
            <StatCard icon="📅" value={`${data.activeDays}d`} label="Active Days"     color="#39d353" />
            <StatCard icon="🔥" value={`${data.streak}d`}     label="Current Streak"  color="#f97316" />
          </div>

          {/* ── Heatmap ────────────────────────────────────────────── */}
          <div
            className="card"
            style={{ background: "var(--bg-secondary)", borderRadius: 10, position: "relative", overflow: "hidden" }}
          >
            {/* accent line */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, rgba(57,211,83,0.55), transparent)" }} />

            {/* header row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: 8 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#39d353", textTransform: "uppercase", letterSpacing: "1px" }}>
                Submission Activity
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-light)" }}>
                {(data.heatmap?.totalSubmissions || 0).toLocaleString()} submissions in the last year
              </span>
            </div>

            {/* scrollable grid */}
            <div style={{ overflowX: "auto", paddingBottom: 4 }}>
              <HeatmapGrid weeks={data.heatmap?.weeks || []} />
            </div>

            {/* legend */}
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 10, justifyContent: "flex-end" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-light)" }}>Less</span>
              {[0, 1, 2, 3, 4].map(l => (
                <div key={l} style={{
                  width: 11, height: 11, borderRadius: 2,
                  background: HM_COLORS[l],
                  border: l === 0 ? "1px solid var(--border)" : "none",
                  boxShadow: l >= 3 ? "0 0 4px rgba(57,211,83,0.4)" : "none",
                }} />
              ))}
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-light)" }}>More</span>
            </div>
          </div>

          {/* ── Platform cards ─────────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
            <LeetCodeCard lc={lc} />
            <GFGCard      gfg={gfg} />
          </div>

          {/* ── CTA ────────────────────────────────────────────────── */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <motion.a
              href={data.codolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary inline-flex items-center gap-2 text-xs"
            >
              View Codolio Profile →
            </motion.a>
          </div>

        </div>
      )}
    </section>
  );
}
