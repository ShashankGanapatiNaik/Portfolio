import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getCodeforcesData } from "../services/api";

// Codeforces rank → colour mapping
const RANK_COLORS = {
  newbie:       "#808080",
  pupil:        "#008000",
  specialist:   "#03a89e",
  expert:       "#0000ff",
  "candidate master": "#aa00aa",
  master:       "#ff8c00",
  "international master": "#ff8c00",
  grandmaster:  "#ff0000",
  "international grandmaster": "#ff0000",
  "legendary grandmaster": "#ff0000",
};

const getRankColor = (rank = "") =>
  RANK_COLORS[rank.toLowerCase()] ?? "#808080";

const FALLBACK = {
  handle: "shashanknaik6226",
  rating: 1050,
  maxRating: 1200,
  rank: "newbie",
  maxRank: "pupil",
  contribution: 0,
  totalSolved: 120,
  contestsParticipated: 15,
  bestRank: 1842,
  ratingChange: 47,
  recentContests: [
    { name: "Codeforces Round 900", rating: 980,  change: -20 },
    { name: "Codeforces Round 905", rating: 1020, change: 40  },
    { name: "Codeforces Round 910", rating: 1010, change: -10 },
    { name: "Codeforces Round 920", rating: 1050, change: 40  },
    { name: "Codeforces Round 930", rating: 1100, change: 50  },
    { name: "Codeforces Round 940", rating: 1050, change: -50 },
  ],
  profileUrl: "https://codeforces.com/profile/shashanknaik6226",
};

/* ── Mini sparkline for recent rating history ─────────────────────────────── */
function RatingSparkline({ contests, color }) {
  if (!contests || contests.length < 2) return null;

  const ratings = contests.map((c) => c.rating);
  const minR = Math.min(...ratings);
  const maxR = Math.max(...ratings);
  const range = maxR - minR || 1;

  const W = 260;
  const H = 70;
  const pad = 8;

  const pts = ratings.map((r, i) => {
    const x = pad + (i / (ratings.length - 1)) * (W - pad * 2);
    const y = H - pad - ((r - minR) / range) * (H - pad * 2);
    return `${x},${y}`;
  });

  const polyline = pts.join(" ");
  const lastPt   = pts[pts.length - 1].split(",");

  return (
    <svg width={W} height={H} style={{ overflow: "visible" }}>
      {/* Gradient fill under the line */}
      <defs>
        <linearGradient id="cfGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.28} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Area polygon */}
      <polygon
        points={`${pad},${H} ${polyline} ${W - pad},${H}`}
        fill="url(#cfGrad)"
      />

      {/* Line */}
      <motion.polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 4px ${color}99)` }}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
      />

      {/* Dots */}
      {pts.map((pt, i) => {
        const [cx, cy] = pt.split(",");
        return (
          <motion.circle
            key={i}
            cx={parseFloat(cx)}
            cy={parseFloat(cy)}
            r={3}
            fill={color}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8 + i * 0.06, duration: 0.25 }}
            style={{ filter: `drop-shadow(0 0 3px ${color}cc)` }}
          />
        );
      })}

      {/* Last rating label */}
      <text
        x={parseFloat(lastPt[0]) + 6}
        y={parseFloat(lastPt[1]) + 4}
        fontSize={10}
        fill={color}
        fontFamily="var(--font-mono)"
        fontWeight="700"
      >
        {ratings[ratings.length - 1]}
      </text>
    </svg>
  );
}

/* ── Circular rating gauge ────────────────────────────────────────────────── */
function RatingGauge({ rating, maxRating, color }) {
  const maxPossible = 3500;
  const currentPct = Math.min(rating / maxPossible, 1);
  const maxPct     = Math.min(maxRating / maxPossible, 1);

  const R = 70;
  const C = 2 * Math.PI * R;

  return (
    <div style={{ position: "relative", width: 180, height: 180, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
      <svg width={180} height={180} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle cx={90} cy={90} r={R} fill="transparent" stroke="var(--border)" strokeWidth={8} opacity={0.35} />

        {/* Max rating arc (dimmed) */}
        <circle
          cx={90} cy={90} r={R}
          fill="transparent"
          stroke={color}
          strokeWidth={8}
          strokeDasharray={C}
          strokeDashoffset={C - C * maxPct}
          opacity={0.22}
          strokeLinecap="round"
        />

        {/* Current rating arc */}
        <motion.circle
          cx={90} cy={90} r={R}
          fill="transparent"
          stroke={color}
          strokeWidth={8}
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: C - C * currentPct }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 5px ${color}88)` }}
        />
      </svg>

      {/* Center text */}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", userSelect: "none" }}>
        <span style={{ fontSize: "2rem", fontWeight: "800", color: "var(--text-primary)", fontFamily: "var(--font-sans)", lineHeight: 1, letterSpacing: "-1px" }}>
          {rating}
        </span>
        <span style={{ fontSize: "9px", fontFamily: "var(--font-mono)", color: "var(--text-light)", marginTop: "4px", textTransform: "uppercase", letterSpacing: "1px" }}>
          Rating
        </span>
      </div>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────────────────────── */
export default function CodeforcesTracker() {
  const [data, setData]       = useState(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCodeforcesData()
      .then((res) => setData({ ...FALLBACK, ...res.data }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const rankColor    = getRankColor(data.rank);
  const maxRankColor = getRankColor(data.maxRank);

  const statCards = [
    { label: "Problems Solved",     value: data.totalSolved,         icon: "✅" },
    { label: "Contests Entered",    value: data.contestsParticipated, icon: "🏆" },
    { label: "Best Contest Rank",   value: data.bestRank ? `#${data.bestRank.toLocaleString()}` : "N/A", icon: "🥇" },
    {
      label: "Last Rating Change",
      value: data.ratingChange > 0
        ? `+${data.ratingChange}`
        : `${data.ratingChange}`,
      icon:  data.ratingChange >= 0 ? "📈" : "📉",
      color: data.ratingChange >= 0 ? "#00b8a3" : "#ff375f",
    },
  ];

  return (
    <section id="codeforces" className="section-container">
      <div className="section-header center">
        <span className="section-eyebrow">04. Problem Solving</span>
        <h2 className="section-title">Codeforces Activity</h2>
      </div>

      {loading ? (
        <div className="card contrib-skeleton" style={{ height: 340 }} />
      ) : (
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">

          {/* ── Left panel: gauge + rank badge ───────────────────────────── */}
          <div
            className="lg:col-span-5 card flex flex-col justify-between"
            style={{
              background: "linear-gradient(135deg, var(--bg-secondary) 0%, rgba(0,100,255,0.03) 100%)",
              position: "relative",
            }}
          >
            {/* Top accent line */}
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 2, background: `linear-gradient(90deg, transparent, ${rankColor}44, transparent)` }} />

            <div className="text-center mb-3">
              <span className="font-mono text-[11px] text-accent uppercase tracking-wider">Rating Overview</span>
              <h3 className="font-display font-semibold text-lightest-slate text-sm mt-1">Current vs. Peak</h3>
            </div>

            <RatingGauge rating={data.rating} maxRating={data.maxRating} color={rankColor} />

            {/* Rank chips */}
            <div className="flex justify-center gap-4 mt-5">
              <div className="text-center">
                <div
                  className="inline-block px-3 py-1 rounded-full font-mono text-xs font-bold uppercase tracking-wider"
                  style={{ background: `${rankColor}22`, color: rankColor, border: `1px solid ${rankColor}55` }}
                >
                  {data.rank || "newbie"}
                </div>
                <p className="font-mono text-[9px] text-slate mt-1 uppercase tracking-wider">Current</p>
              </div>
              <div className="text-center">
                <div
                  className="inline-block px-3 py-1 rounded-full font-mono text-xs font-bold uppercase tracking-wider"
                  style={{ background: `${maxRankColor}22`, color: maxRankColor, border: `1px solid ${maxRankColor}55` }}
                >
                  {data.maxRank || "newbie"}
                </div>
                <p className="font-mono text-[9px] text-slate mt-1 uppercase tracking-wider">Peak ({data.maxRating})</p>
              </div>
            </div>
          </div>

          {/* ── Right panel: stat cards + sparkline ──────────────────────── */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-6">

            {/* Stat cards 2×2 */}
            <div className="grid grid-cols-2 gap-4">
              {statCards.map((stat) => (
                <motion.div
                  key={stat.label}
                  whileHover={{ y: -4, borderColor: "var(--border-accent)" }}
                  className="card p-4 flex items-center gap-4 transition-all"
                  style={{ background: "var(--bg-secondary)", borderRadius: "8px" }}
                >
                  <div style={{ fontSize: "1.75rem", userSelect: "none" }}>{stat.icon}</div>
                  <div>
                    <p
                      className="font-display text-lg font-bold leading-none mb-1"
                      style={{ color: stat.color ?? "var(--accent)" }}
                    >
                      {stat.value}
                    </p>
                    <p className="font-mono text-[10px] text-slate uppercase tracking-wider">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Rating sparkline card */}
            <div
              className="card"
              style={{ background: "var(--bg-secondary)", borderRadius: "8px" }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[11px] text-accent uppercase tracking-wider">Rating Trend</span>
                <span className="font-mono text-[10px] text-slate">Last {data.recentContests?.length || 0} contests</span>
              </div>

              {data.recentContests && data.recentContests.length >= 2 ? (
                <div style={{ overflowX: "auto" }}>
                  <RatingSparkline contests={data.recentContests} color={rankColor} />
                </div>
              ) : (
                <p className="font-mono text-xs text-slate text-center py-4">Not enough contest data yet</p>
              )}

              {/* Mini contest labels */}
              {data.recentContests && data.recentContests.length > 0 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {data.recentContests.map((c, i) => (
                    <div
                      key={i}
                      className="flex-shrink-0 px-2 py-1 rounded font-mono text-[9px]"
                      style={{
                        background: c.change >= 0 ? "rgba(0,184,163,0.12)" : "rgba(255,55,95,0.12)",
                        color:      c.change >= 0 ? "#00b8a3" : "#ff375f",
                        border:     `1px solid ${c.change >= 0 ? "rgba(0,184,163,0.3)" : "rgba(255,55,95,0.3)"}`,
                      }}
                    >
                      {c.change >= 0 ? "+" : ""}{c.change}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="flex justify-end">
              <motion.a
                href={data.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary inline-flex items-center gap-2 text-xs"
              >
                View Codeforces Profile →
              </motion.a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
