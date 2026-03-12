const express = require("express");
const router = express.Router();
const axios = require("axios");
const { Project, Skill, Profile } = require("../models");

const isGroq = !!process.env.GROQ_API_KEY;
const isOpenAI =
  !!process.env.OPENAI_API_KEY &&
  process.env.OPENAI_API_KEY !== "your_openai_api_key";

console.log(
  `🤖 Chatbot: ${isGroq ? "Groq LLaMA3 (FREE)" : isOpenAI ? "OpenAI GPT-3.5" : "Rule-based fallback"}`,
);

// Build portfolio context from DB
const getPortfolioContext = async () => {
  const [projects, skills, profile] = await Promise.all([
    Project.find().lean(),
    Skill.find().lean(),
    Profile.findOne().lean(),
  ]);

  const projectsText = projects
    .map(
      (p) =>
        `Project: "${p.title}" - ${p.description}. Tech Stack: ${p.techStack?.join(", ")}. GitHub: ${p.githubLink || "N/A"}.`,
    )
    .join("\n");

  const skillsText = skills
    .map((s) => `${s.category}: ${s.skills?.map((sk) => sk.name).join(", ")}`)
    .join("\n");

  const educationText =
    profile?.education
      ?.map((e) => `${e.degree} at ${e.institution} (${e.period}) - ${e.grade}`)
      .join("\n") ||
    "B.Tech Computer Science, Reva University, 2023-Present, CGPA 9.41/10";

  return `You are an AI assistant for ${profile?.name || "Shashank Ganapati Naik"}'s developer portfolio.
Answer recruiter and visitor questions professionally and concisely.

DEVELOPER PROFILE:
Name: ${profile?.name || "Shashank Ganapati Naik"}
Title: ${profile?.title || "Full Stack Developer | AI & ML Enthusiast"}
Email: ${profile?.email || "shashankng626@gmail.com"}
LinkedIn: ${profile?.linkedin || "https://www.linkedin.com/in/shashank-naik-6b449428a"}
GitHub: ${profile?.github || "https://github.com/ShashankGanapatiNaik"}
LeetCode: ${profile?.leetcode || "https://leetcode.com/u/shashanknaik6226/"}
Bio: ${profile?.bio || "Motivated CS student skilled in full-stack development and machine learning."}
Career Goals: ${profile?.careerGoals || "Build scalable AI-powered systems that solve real-world problems."}

EDUCATION:
${educationText}

SKILLS:
${skillsText || "React, Node.js, Python, Java, MongoDB, Machine Learning, Deep Learning"}

PROJECTS:
${projectsText || "1. AI Interview Analyzer 2. Energy Forecasting 3. Food Delivery App 4. Movie Recommender"}

INSTRUCTIONS:
- Be helpful, professional, and concise (under 200 words)
- For resume: say "Click the Download Resume button in the Hero section"
- For GitHub: https://github.com/ShashankGanapatiNaik
- For LeetCode: https://leetcode.com/u/shashanknaik6226/`;
};

// Call Groq API directly via axios
const callGroq = async (messages) => {
  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.1-8b-instant",
      messages,
      max_tokens: 400,
      temperature: 0.7,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    },
  );
  return response.data.choices[0]?.message?.content;
};

// Call OpenAI API directly via axios
const callOpenAI = async (messages) => {
  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    { model: "gpt-3.5-turbo", messages, max_tokens: 400, temperature: 0.7 },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    },
  );
  return response.data.choices[0]?.message?.content;
};

// Rule-based fallback
const getRuleBasedReply = (msg) => {
  const m = msg.toLowerCase();
  if (m.includes("skill") || m.includes("technolog") || m.includes("know"))
    return "Shashank is skilled in React.js, Node.js, Python, Java, MongoDB, Express.js, FastAPI, Machine Learning, Deep Learning, and NLP. Check the Skills section for the full breakdown!";
  if (m.includes("project") || m.includes("built") || m.includes("work"))
    return "Shashank has built:\n1. 🤖 AI Interview Behavior Analyzer (React, FastAPI, DeepFace, OpenCV)\n2. ⚡ Energy Consumption Forecasting (PySpark, ML)\n3. 🍕 Food Delivery App (React, Node.js, MongoDB)\n4. 🎬 Movie Recommendation System (Python, Streamlit)\n\nCheck the Projects section for details!";
  if (m.includes("resume") || m.includes("cv") || m.includes("download"))
    return "Click the 'Download Resume' button in the Hero section at the top of the page to get Shashank's latest resume!";
  if (m.includes("github"))
    return "Shashank's GitHub profile: https://github.com/ShashankGanapatiNaik\n\nHe has projects in React, Node.js, Python, and Machine Learning!";
  if (m.includes("leetcode") || m.includes("coding") || m.includes("dsa"))
    return "Shashank actively solves problems on LeetCode: https://leetcode.com/u/shashanknaik6226/\n\nCheck the LeetCode Stats section to see his progress!";
  if (
    m.includes("contact") ||
    m.includes("email") ||
    m.includes("hire") ||
    m.includes("reach")
  )
    return "You can reach Shashank at:\n📧 shashankng626@gmail.com\n💼 LinkedIn: linkedin.com/in/shashank-naik-6b449428a\n\nOr use the Contact section at the bottom of the portfolio!";
  if (
    m.includes("education") ||
    m.includes("study") ||
    m.includes("university") ||
    m.includes("college")
  )
    return "Shashank is pursuing B.Tech in Computer Science & Engineering at Reva University, Bangalore (2023–Present) with an impressive CGPA of 9.41/10!";
  if (
    m.includes("experience") ||
    m.includes("background") ||
    m.includes("about")
  )
    return "Shashank is a motivated CS student at Reva University with strong skills in full-stack development and machine learning. He has built AI-powered systems, big data pipelines, and full-stack web apps. CGPA: 9.41/10.";
  if (m.includes("ai") || m.includes("machine learning") || m.includes("ml"))
    return "Shashank is passionate about AI & ML! He has experience with Machine Learning, Deep Learning, NLP, PySpark, DeepFace, and OpenCV. His flagship project is an AI Interview Behavior Analyzer that detects emotions from video in real-time!";
  return "Hi! I'm Shashank's portfolio assistant 👋\n\nI can tell you about his skills, projects, education, or how to contact him. What would you like to know?";
};

router.post("/", async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message?.trim())
    return res.status(400).json({ error: "Message is required" });

  const messages_ctx = [
    { role: "system", content: await getPortfolioContext() },
    ...history.slice(-6),
    { role: "user", content: message },
  ];

  // Try Groq first, then OpenAI, then rule-based
  if (isGroq) {
    try {
      const reply = await callGroq(messages_ctx);
      return res.json({ reply });
    } catch (err) {
      console.error(
        "Groq error:",
        err.response?.data?.error?.message || err.message,
      );
    }
  }

  if (isOpenAI) {
    try {
      const reply = await callOpenAI(messages_ctx);
      return res.json({ reply });
    } catch (err) {
      console.error(
        "OpenAI error:",
        err.response?.data?.error?.message || err.message,
      );
    }
  }

  // Rule-based fallback
  res.json({ reply: getRuleBasedReply(message) });
});

module.exports = router;
