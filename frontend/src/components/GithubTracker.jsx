import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { getGithubData, getGithubContributions } from "../services/api";

const LEVEL_COLORS = {
  0: "var(--contrib-0)",
  1: "var(--contrib-1)",
  2: "var(--contrib-2)",
  3: "var(--contrib-3)",
  4: "var(--contrib-4)",
};

// Only show Mon / Wed / Fri labels (rows 1, 3, 5 of 0-indexed Sun-Sat)
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

const CELL = 12;   // px — cell size
const GAP  = 3;    // px — gap between cells
const STEP = CELL + GAP; // column/row pitch

function ContributionGrid({ weeks }) {
  if (!weeks || weeks.length === 0) return null;

  // ── Month label positions ──────────────────────────────────────────────────
  // Walk each week; when the first day's month changes, record it.
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
  const gridWidth  = totalWeeks * STEP - GAP;
  const gridHeight = 7 * STEP - GAP;

  const DAY_COL_W = 28; // px reserved for Mon/Wed/Fri labels
  const MONTH_ROW_H = 18; // px reserved for month labels above grid

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
      {/* ── Top-left corner (empty) ── */}
      <div />

      {/* ── Month labels row ── */}
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

      {/* ── Day-of-week labels ── */}
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

      {/* ── Heatmap cells with staggered flow animation ── */}
      <div style={{ position: "relative", width: gridWidth, height: gridHeight }}>
        {weeks.map((week, wIdx) => {
          // Pad first incomplete week so days start on the correct row
          const padCount = wIdx === 0 ? 7 - week.contributionDays.length : 0;
          return (
            <motion.div
              key={wIdx}
              initial={{ opacity: 0, scale: 0.7, y: 5 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, amount: 0 }}
              transition={{
                delay: 0.05 + (wIdx * 0.012),
                duration: 0.35,
                type: "spring",
                stiffness: 100,
                damping: 15
              }}
            >
              {week.contributionDays.map((day, dIdx) => {
                const row = padCount + dIdx;
                return (
                  <div
                    key={day.date}
                    title={`${day.date}: ${day.contributionCount} contribution${day.contributionCount !== 1 ? "s" : ""}`}
                    className="contrib-cell"
                    style={{
                      position: "absolute",
                      left: wIdx * STEP,
                      top: row * STEP,
                      width: CELL,
                      height: CELL,
                      background: LEVEL_COLORS[day.level ?? countToLevel(day.contributionCount)],
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

function countToLevel(count) {
  if (count === 0) return 0;
  if (count <= 3) return 1;
  if (count <= 6) return 2;
  if (count <= 9) return 3;
  return 4;
}

const GITHUB_FALLBACK = {
  username: "ShashankGanapatiNaik",
  name: "Shashank Ganapati Naik",
  bio: "Full Stack Developer | AI & Machine Learning Enthusiast",
  avatar: "https://github.com/ShashankGanapatiNaik.png",
  publicRepos: 18,
  followers: 12,
  following: 15,
  totalStars: 24,
  topLanguages: [
    { lang: "JavaScript", count: 8 },
    { lang: "Python", count: 5 },
    { lang: "HTML/CSS", count: 3 },
    { lang: "C++", count: 2 },
  ],
  recentRepos: [],
  profileUrl: "https://github.com/ShashankGanapatiNaik",
};

const CONTRIB_FALLBACK = (() => {
  const weeks = Array.from({ length: 52 }, (_, w) => ({
    contributionDays: Array.from({ length: 7 }, (_, d) => ({
      date: "2024-01-01",
      contributionCount: (w * 7 + d) % 5,
      level: (w * 7 + d) % 5,
    })),
  }));
  return { totalContributions: 342, weeks };
})();

export default function GithubTracker() {
  const [data, setData] = useState(null);
  const [calendar, setCalendar] = useState(null);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          getGithubData()
            .then((r) => setData(r.data))
            .catch(() => setData(GITHUB_FALLBACK)),
          getGithubContributions()
            .then((r) => setCalendar(r.data))
            .catch(() => setCalendar(CONTRIB_FALLBACK)),
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  return (
    <section ref={ref} className="section-container">
      <div className="section-header left">
        <span className="section-eyebrow">05. Open Source</span>
        <h2 className="section-title">GitHub Activity</h2>
      </div>

      {loading ? (
        <div className="card contrib-skeleton" />
      ) : (
        <div className="card contrib-card">
          {/* Header */}
          <div className="contrib-header">
            {data && (
              <div className="contrib-profile">
                {data.avatar && (
                  <img src={data.avatar} alt={data.username} className="contrib-avatar" />
                )}
                <div>
                  <p className="contrib-name">{data.name || data.username}</p>
                  <a
                    href={data.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contrib-username"
                  >
                    @{data.username}
                  </a>
                </div>
              </div>
            )}
            {calendar && (
              <span className="contrib-total">
                {calendar.totalContributions.toLocaleString()} contributions in the last year
              </span>
            )}
          </div>

          {/* Heatmap */}
          {calendar ? (
            <div className="contrib-scroll">
              <ContributionGrid weeks={calendar.weeks} />
            </div>
          ) : (
            <p className="contrib-unavailable">Contribution data unavailable.</p>
          )}

          {/* Legend */}
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
      )}
    </section>
  );
}
