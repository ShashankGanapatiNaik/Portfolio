const express = require('express');
const router = express.Router();
const axios = require('axios');

const LEETCODE_USERNAME = process.env.LEETCODE_USERNAME || 'shashanknaik6226';

router.get('/', async (req, res) => {
  try {
    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          username
          submitStats: submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
              submissions
            }
          }
          profile {
            ranking
            reputation
            starRating
          }
          streak: userCalendar {
            streak
            totalActiveDays
          }
        }
        allQuestionsCount {
          difficulty
          count
        }
      }
    `;

    const response = await axios.post(
      'https://leetcode.com/graphql',
      { query, variables: { username: LEETCODE_USERNAME } },
      {
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://leetcode.com',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );

    const data = response.data?.data;
    const user = data?.matchedUser;
    const allQuestions = data?.allQuestionsCount;

    if (!user) return res.status(404).json({ error: 'LeetCode user not found' });

    const stats = user.submitStats?.acSubmissionNum || [];
    const getCount = (diff) => stats.find(s => s.difficulty === diff)?.count || 0;
    const getTotal = (diff) => allQuestions?.find(q => q.difficulty === diff)?.count || 0;

    const totalSolved = getCount('All');
    const easySolved = getCount('Easy');
    const mediumSolved = getCount('Medium');
    const hardSolved = getCount('Hard');

    const totalSubmissions = stats.find(s => s.difficulty === 'All')?.submissions || 0;
    const acceptanceRate = totalSubmissions > 0
      ? ((totalSolved / totalSubmissions) * 100).toFixed(1)
      : 0;

    res.json({
      username: LEETCODE_USERNAME,
      totalSolved,
      easySolved,
      mediumSolved,
      hardSolved,
      easyTotal: getTotal('Easy'),
      mediumTotal: getTotal('Medium'),
      hardTotal: getTotal('Hard'),
      ranking: user.profile?.ranking || 0,
      acceptanceRate: parseFloat(acceptanceRate),
      streak: user.streak?.streak || 0,
      totalActiveDays: user.streak?.totalActiveDays || 0,
      profileUrl: `https://leetcode.com/u/${LEETCODE_USERNAME}/`,
    });
  } catch (err) {
    console.error('LeetCode API error:', err.message);
    // Return fallback data if API fails
    res.json({
      username: LEETCODE_USERNAME,
      totalSolved: 0,
      easySolved: 0,
      mediumSolved: 0,
      hardSolved: 0,
      easyTotal: 876,
      mediumTotal: 1845,
      hardTotal: 812,
      ranking: 0,
      acceptanceRate: 0,
      streak: 0,
      totalActiveDays: 0,
      profileUrl: `https://leetcode.com/u/${LEETCODE_USERNAME}/`,
      error: 'Could not fetch live data',
    });
  }
});

module.exports = router;
