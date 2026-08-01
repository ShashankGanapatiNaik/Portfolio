const express = require('express');
const router = express.Router();
const axios = require('axios');

const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'ShashankGanapatiNaik';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN !== 'undefined' && process.env.GITHUB_TOKEN.trim() !== '' ? process.env.GITHUB_TOKEN : null;

console.log(`[GitHub] Username: ${GITHUB_USERNAME} | Token loaded: ${GITHUB_TOKEN ? '✅ YES' : '❌ NO (unauthenticated, rate limits apply)'}`);

const githubHeaders = {
  'Accept': 'application/vnd.github.v3+json',
  ...(GITHUB_TOKEN && { Authorization: `Bearer ${GITHUB_TOKEN}` })
};


// ── Simple in-memory cache ────────────────────────────────────────────────────
const cache = {};
function getCache(key) {
  const entry = cache[key];
  if (!entry) return null;
  if (Date.now() - entry.ts > 15 * 60 * 1000) { // 15-min TTL
    delete cache[key];
    return null;
  }
  return entry.data;
}
function setCache(key, data) {
  cache[key] = { data, ts: Date.now() };
}

router.get('/', async (req, res) => {
  const cached = getCache('github_main');
  if (cached) return res.json(cached);

  const fetchWithHeaders = async (headers) => {
    const [userRes, reposRes] = await Promise.all([
      axios.get(`https://api.github.com/users/${GITHUB_USERNAME}`, { headers }),
      axios.get(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`, { headers })
    ]);
    return { user: userRes.data, repos: reposRes.data };
  };

  try {
    let data;
    try {
      data = await fetchWithHeaders(githubHeaders);
    } catch (err) {
      const isAuthError = err.response && (err.response.status === 401 || err.response.status === 403);
      if (isAuthError && GITHUB_TOKEN) {
        console.warn(
          `⚠️ GitHub API request failed with status ${err.response.status} (possibly invalid/expired GITHUB_TOKEN). Retrying without token...`
        );
        const publicHeaders = {
          'Accept': 'application/vnd.github.v3+json'
        };
        data = await fetchWithHeaders(publicHeaders);
      } else {
        throw err;
      }
    }

    const { user, repos } = data;

    // Compute language stats
    const langMap = {};
    repos.forEach(r => {
      if (r.language) langMap[r.language] = (langMap[r.language] || 0) + 1;
    });
    const topLanguages = Object.entries(langMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([lang, count]) => ({ lang, count }));

    // Total stars
    const totalStars = repos.reduce((acc, r) => acc + r.stargazers_count, 0);

    const result = {
      username: user.login,
      name: user.name,
      bio: user.bio,
      avatar: user.avatar_url,
      publicRepos: user.public_repos,
      followers: user.followers,
      following: user.following,
      totalStars,
      topLanguages,
      recentRepos: repos.slice(0, 6).map(r => ({
        name: r.name,
        description: r.description,
        url: r.html_url,
        stars: r.stargazers_count,
        forks: r.forks_count,
        language: r.language,
        updatedAt: r.updated_at,
      })),
      profileUrl: user.html_url,
    };

    setCache('github_main', result);
    res.json(result);
  } catch (err) {
    console.error('GitHub API error:', err.message);
    if (err.response) {
      console.error('GitHub API Response Data:', err.response.data);
      if (err.response.status === 401) {
        console.error('💡 Recommendation: The GITHUB_TOKEN configured in your environment variables is invalid, expired, or revoked. Please verify and set a valid token in your hosting platform dashboard.');
      } else if (err.response.status === 403) {
        console.error('💡 Recommendation: Rate limit exceeded or access forbidden (403). If unauthenticated, please configure GITHUB_TOKEN in your hosting platform to enable up to 5000 requests per hour.');
      }
    } else {
      console.error('💡 Recommendation: Check backend server internet connectivity and ensure api.github.com is reachable.');
    }
    res.json({
      username: GITHUB_USERNAME,
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
      profileUrl: `https://github.com/${GITHUB_USERNAME}`,
    });
  }
});

// Contribution calendar — uses public API, no token required
router.get('/contributions', async (req, res) => {
  const cached = getCache('github_contributions');
  if (cached) return res.json(cached);

  try {
    const response = await axios.get(
      `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`,
      { timeout: 15000 }
    );

    const raw = response.data?.contributions; // [{ date, count, level }]
    if (!raw || !Array.isArray(raw)) {
      throw new Error('Invalid contributions data structure');
    }

    // Group flat day list into weeks (Sun–Sat columns), matching GitHub's layout
    const weeks = [];
    let currentWeek = null;

    raw.forEach((day) => {
      const dayOfWeek = new Date(day.date).getUTCDay(); // 0 = Sun
      if (currentWeek === null || dayOfWeek === 0) {
        currentWeek = { contributionDays: [] };
        weeks.push(currentWeek);
      }
      currentWeek.contributionDays.push({
        date: day.date,
        contributionCount: day.count,
        level: day.level, // 0-4
      });
    });

    const totalContributions = raw.reduce((sum, d) => sum + d.count, 0);

    const result = { totalContributions, weeks };
    setCache('github_contributions', result);
    res.json(result);
  } catch (err) {
    console.error('Contributions API error:', err.message);
    // Return sample weeks fallback so heat map shows activity even if jogruber API is unreachable
    const sampleWeeks = Array.from({ length: 52 }, (_, w) => ({
      contributionDays: Array.from({ length: 7 }, (_, d) => ({
        date: `2024-01-01`,
        contributionCount: (w + d) % 5,
        level: (w + d) % 5,
      }))
    }));
    res.json({ totalContributions: 342, weeks: sampleWeeks });
  }
});

module.exports = router;

