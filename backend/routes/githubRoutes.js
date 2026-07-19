const express = require('express');
const router = express.Router();
const axios = require('axios');

const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'ShashankGanapatiNaik';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN !== 'undefined' && process.env.GITHUB_TOKEN.trim() !== '' ? process.env.GITHUB_TOKEN : null;

const githubHeaders = {
  'Accept': 'application/vnd.github.v3+json',
  ...(GITHUB_TOKEN && { Authorization: `Bearer ${GITHUB_TOKEN}` })
};

router.get('/', async (req, res) => {
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

    res.json({
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
    });
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
    res.status(500).json({ error: 'Failed to fetch GitHub data' });
  }
});

// Contribution calendar — uses public API, no token required
router.get('/contributions', async (req, res) => {
  try {
    const response = await axios.get(
      `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`,
      { timeout: 10000 }
    );

    const raw = response.data?.contributions; // [{ date, count, level }]
    if (!raw || !Array.isArray(raw)) {
      return res.status(500).json({ error: 'No contribution data returned' });
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

    res.json({ totalContributions, weeks });
  } catch (err) {
    console.error('Contributions API error:', err.message);
    res.status(500).json({ error: 'Failed to fetch contributions' });
  }
});

module.exports = router;
