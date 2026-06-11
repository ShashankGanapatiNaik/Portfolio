const express = require('express');
const router = express.Router();
const axios = require('axios');

const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'ShashankGanapatiNaik';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

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
    }
    res.status(500).json({ error: 'Failed to fetch GitHub data' });
  }
});

module.exports = router;
