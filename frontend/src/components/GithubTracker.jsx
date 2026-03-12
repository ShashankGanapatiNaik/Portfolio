import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { getGithubData } from "../services/api";

const LANG_COLORS = {
  JavaScript: "#f7df1e",
  Python: "#3572A5",
  Java: "#b07219",
  TypeScript: "#2b7489",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Jupyter: "#DA5B0B",
  Shell: "#89e051",
  C: "#555555",
  Other: "#8892b0",
};

export default function GithubTracker() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    getGithubData()
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section ref={ref} className="section-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <div className="section-subtitle-line">
          <h2 className="section-title whitespace-nowrap">GitHub Activity</h2>
          <div className="accent-line" />
        </div>
      </motion.div>

      {loading ? (
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card h-24 skeleton" />
          ))}
        </div>
      ) : data ? (
        <>
          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
          >
            {[
              { label: "Public Repos", value: data.publicRepos, icon: "📦" },
              { label: "Total Stars", value: data.totalStars, icon: "⭐" },
              { label: "Followers", value: data.followers, icon: "👥" },
              { label: "Following", value: data.following, icon: "➡️" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 * i + 0.3 }}
                whileHover={{
                  scale: 1.05,
                  borderColor: "rgba(100,255,218,0.4)",
                }}
                className="card text-center py-5"
              >
                <div className="text-2xl mb-1">{stat.icon}</div>
                <p className="font-display text-2xl font-bold text-accent">
                  {stat.value}
                </p>
                <p className="font-mono text-xs text-slate mt-1">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* Top Languages Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.4 }}
              className="card"
            >
              <h3 className="font-display font-semibold text-lightest-slate mb-6">
                Top Languages
              </h3>
              <div className="h-48">
                <ResponsiveContainer>
                  <BarChart
                    data={data.topLanguages}
                    margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                  >
                    <XAxis
                      dataKey="lang"
                      tick={{
                        fill: "#8892b0",
                        fontSize: 11,
                        fontFamily: "JetBrains Mono",
                      }}
                    />
                    <YAxis tick={{ fill: "#8892b0", fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        background: "#112240",
                        border: "1px solid #233554",
                        borderRadius: "8px",
                        color: "#ccd6f6",
                        fontFamily: "JetBrains Mono",
                        fontSize: 12,
                      }}
                      cursor={{ fill: "rgba(100,255,218,0.05)" }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {data.topLanguages?.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={LANG_COLORS[entry.lang] || LANG_COLORS.Other}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Recent Repos */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.4 }}
              className="space-y-3"
            >
              <h3 className="font-display font-semibold text-lightest-slate mb-4">
                Recent Repositories
              </h3>
              {data.recentRepos?.slice(0, 4).map((repo, i) => (
                <motion.a
                  key={i}
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between bg-light-navy border border-lightest-navy rounded-lg px-4 py-3 hover:border-accent/30 transition-all block"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-lightest-slate text-sm font-medium truncate">
                      {repo.name}
                    </p>
                    {repo.description && (
                      <p className="text-slate text-xs truncate mt-0.5">
                        {repo.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    {repo.language && (
                      <div className="flex items-center gap-1">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            background: LANG_COLORS[repo.language] || "#8892b0",
                          }}
                        />
                        <span className="font-mono text-xs text-slate">
                          {repo.language}
                        </span>
                      </div>
                    )}
                    <span className="font-mono text-xs text-slate">
                      ⭐{repo.stars}
                    </span>
                  </div>
                </motion.a>
              ))}
              <a
                href={data.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2 mt-2 text-xs"
              >
                View GitHub Profile →
              </a>
            </motion.div>
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <p className="text-slate font-mono text-sm">
            GitHub data unavailable. Configure GITHUB_TOKEN in backend.
          </p>
          <a
            href="https://github.com/ShashankGanapatiNaik"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-4 inline-flex"
          >
            View GitHub Profile
          </a>
        </div>
      )}
    </section>
  );
}
