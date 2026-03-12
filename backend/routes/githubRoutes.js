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
  try {
    const [userRes, reposRes] = await Promise.all([
      axios.get(`https://api.github.com/users/${GITHUB_USERNAME}`, { headers: githubHeaders }),
      axios.get(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`, { headers: githubHeaders })
    ]);

    const user = userRes.data;
    const repos = reposRes.data;

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
    res.status(500).json({ error: 'Failed to fetch GitHub data' });
  }
});

module.exports = router;
