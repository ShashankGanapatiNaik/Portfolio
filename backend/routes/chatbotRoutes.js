const express = require("express");
const router = express.Router();
const axios = require("axios");
const { Project, Skill, Profile } = require("../models");

const isGroq = !!process.env.GROQ_API_KEY;
const isOpenAI =
  !!process.env.OPENAI_API_KEY &&
  process.env.OPENAI_API_KEY !== "your_openai_api_key";

console.log(
  `🤖 Chatbot: ${isGroq ? "Groq LLaMA (FREE)" : isOpenAI ? "OpenAI GPT-3.5" : "Rule-based fallback"}`,
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
- For LeetCode: https://leetcode.com/u/shashanknaik6226/
- CRITICAL: You must ONLY answer questions directly related to ${profile?.name || "Shashank Ganapati Naik"}'s profile, resume, projects, skills, education, experience, or contact information.
- CRITICAL: If a user asks you to write code, solve programming questions, explain concepts not related to Shashank, or discuss any other unrelated topics, politely refuse and state that you can only answer questions about Shashank's background, projects, skills, and portfolio.`;
};

// Groq model candidates (in order of preference)
const GROQ_MODELS = [
  "llama-3.1-8b-instant",
  "llama3-8b-8192",
  "mixtral-8x7b-32768",
  "gemma-7b-it",
];

// Call Groq API directly via axios — tries multiple models
const callGroq = async (messages) => {
  let lastError = null;

  for (const model of GROQ_MODELS) {
    try {
      console.log(`🔄 Trying Groq model: ${model}`);
      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model,
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
      const content = response.data.choices[0]?.message?.content;
      console.log(`✅ Groq success with model: ${model}`);
      return content;
    } catch (err) {
      const errMsg =
        err.response?.data?.error?.message ||
        err.response?.data?.error ||
        err.message;
      const status = err.response?.status;
      console.error(`❌ Groq model ${model} failed [${status}]:`, errMsg);
      lastError = { status, message: errMsg, model };

      // If it's an auth error, don't try other models
      if (status === 401 || status === 403) {
        console.error("🔑 Groq API key invalid or unauthorised — check GROQ_API_KEY in .env");
        throw new Error(`Groq auth error: ${errMsg}`);
      }
      // If rate limited, don't try other models
      if (status === 429) {
        console.warn("⏳ Groq rate limit hit");
        throw new Error(`Groq rate limit: ${errMsg}`);
      }
    }
  }

  throw new Error(`All Groq models failed. Last: ${JSON.stringify(lastError)}`);
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

// Comprehensive rule-based fallback
const getRuleBasedReply = (msg) => {
  const m = msg.toLowerCase();

  // Greetings
  if (
    m === "hi" || m === "hello" || m === "hey" || m === "hii" ||
    m.match(/^(hi|hello|hey|hii|howdy|sup|what's up|whats up)[!?.]*$/)
  )
    return "Hi there! 👋 I'm Shashank's portfolio assistant.\n\nI can answer questions about his:\n• 💼 Projects & tech stack\n• ⚡ Skills & technologies\n• 🎓 Education & background\n• 📄 Resume & contact info\n\nWhat would you like to know?";

  // Skills
  if (m.includes("skill") || m.includes("technolog") || m.includes("know") || m.includes("language") || m.includes("framework") || m.includes("stack"))
    return "🛠️ Shashank's Tech Stack:\n\n• **Languages**: JavaScript, Python, Java, C\n• **Frontend**: React.js, HTML5, CSS3, Tailwind CSS\n• **Backend**: Node.js, Express.js, FastAPI, REST APIs\n• **Databases**: MongoDB, MySQL\n• **AI/ML**: Machine Learning, Deep Learning, NLP, PySpark\n• **Tools**: Git, GitHub, JWT Auth, OpenCV\n• **Core CS**: DSA, OOP, OS, DBMS, Computer Networks\n\nCheck the Skills section on the portfolio for detailed proficiency levels!";

  // Projects
  if (m.includes("project") || m.includes("built") || m.includes("creat") || m.includes("develop"))
    return "🚀 Shashank's Projects:\n\n1. 🤖 **AI Interview Behavior Analyzer** — Real-time emotion & behavior analysis from video using DeepFace + OpenCV. Stack: React, FastAPI, Python, MongoDB.\n\n2. ⚡ **Energy Consumption Forecasting** — Big data ML pipeline with PySpark analyzing millions of smart meter readings.\n\n3. 🍕 **Food Delivery Web App** — Full-stack platform with auth, cart, and Stripe payments. Stack: React, Node.js, MongoDB.\n\n4. 🎬 **Movie Recommendation System** — Content-based ML recommender using cosine similarity, deployed on Streamlit.\n\nSee the Projects section for live demos & GitHub links!";

  // Resume / Download
  if (m.includes("resume") || m.includes("cv") || m.includes("download"))
    return "📄 To download Shashank's resume:\n\nClick the **\"Download Resume\"** button in the Hero section at the top of the portfolio page!\n\nFor a quick overview:\n• B.Tech CSE at Reva University — CGPA 9.41/10\n• Full Stack + AI/ML expertise\n• 4 hands-on projects\n\n📧 Alternatively reach out: shashankng626@gmail.com";

  // GitHub
  if (m.includes("github") || m.includes("git") || m.includes("repo") || m.includes("code"))
    return "💻 Shashank's GitHub Profile:\n👉 https://github.com/ShashankGanapatiNaik\n\nHe has public repos for all his major projects:\n• AI Interview Behavior Analyzer\n• Energy Consumption Forecasting\n• Food Delivery App\n• Movie Recommendation System\n\nFeel free to explore and star the repos!";

  // LeetCode / DSA / Competitive
  if (m.includes("leetcode") || m.includes("competitive") || m.includes("dsa") || m.includes("algorithm") || m.includes("data structure"))
    return "🏆 Shashank on LeetCode:\n👉 https://leetcode.com/u/shashanknaik6226/\n\nHe actively solves problems focusing on DSA (Data Structures & Algorithms).\nCheck the **LeetCode Stats** section on the portfolio to see his solve count and ratings!";

  // Contact / Hire / Email
  if (m.includes("contact") || m.includes("email") || m.includes("hire") || m.includes("reach") || m.includes("connect") || m.includes("recruit"))
    return "📬 Contact Shashank:\n\n📧 Email: shashankng626@gmail.com\n💼 LinkedIn: https://www.linkedin.com/in/shashank-naik-6b449428a\n💻 GitHub: https://github.com/ShashankGanapatiNaik\n\nOr use the **Contact form** at the bottom of the portfolio — he typically responds within 24 hours!";

  // Education / College / University
  if (m.includes("education") || m.includes("study") || m.includes("university") || m.includes("college") || m.includes("degree") || m.includes("cgpa") || m.includes("gpa") || m.includes("reva"))
    return "🎓 Shashank's Education:\n\n• **B.Tech in Computer Science & Engineering**\n  Reva University, Bangalore (2023 – Present)\n  CGPA: **9.41 / 10** 🌟\n  Focus: Full Stack Dev, AI/ML, DSA\n\n• **Pre-University (Science / PCM+CS)**\n  Government PU College Idagunji (2021–2023)\n  Score: **90.47%**";

  // Experience / Background / About
  if (m.includes("experience") || m.includes("background") || m.includes("about") || m.includes("who") || m.includes("introduce"))
    return "👨‍💻 About Shashank Ganapati Naik:\n\nMotivated Computer Science student at Reva University, Bangalore with a strong passion for full-stack development and AI/ML.\n\n**Highlights:**\n• CGPA: 9.41/10\n• Built 4 major hands-on projects\n• Expertise in React, Node.js, Python, and Machine Learning\n• Interested in AI-powered systems & scalable web apps\n\n**Goal:** To become a skilled software engineer specializing in full-stack and AI-driven applications.";

  // AI / ML
  if (m.includes("ai") || m.includes("machine learning") || m.includes("ml") || m.includes("deep learning") || m.includes("neural") || m.includes("model"))
    return "🤖 Shashank's AI/ML Expertise:\n\n• **Machine Learning** — supervised/unsupervised models\n• **Deep Learning** — neural networks, DeepFace\n• **NLP** — natural language processing\n• **Computer Vision** — OpenCV, real-time video analysis\n• **Big Data** — PySpark for distributed ML\n\nHis flagship AI project is the **AI Interview Behavior Analyzer** that detects 7 emotions from video in real-time!";

  // LinkedIn
  if (m.includes("linkedin"))
    return "💼 Shashank's LinkedIn:\n👉 https://www.linkedin.com/in/shashank-naik-6b449428a\n\nFeel free to connect with him there!";

  // Internship / job
  if (m.includes("internship") || m.includes("job") || m.includes("work") || m.includes("open to"))
    return "🌟 Shashank is open to internship and job opportunities!\n\nHe's looking for roles in:\n• Full Stack Development\n• AI/ML Engineering\n• Software Engineering\n\n📧 Reach out: shashankng626@gmail.com\n💼 LinkedIn: https://www.linkedin.com/in/shashank-naik-6b449428a";

  // Default
  return "Hi! I'm Shashank's portfolio assistant 👋\n\nI can tell you about his:\n• **Projects** — AI, full-stack & ML apps\n• **Skills** — React, Node.js, Python, AI/ML and more\n• **Education** — B.Tech CSE at Reva University (CGPA 9.41)\n• **Contact** — email, LinkedIn, GitHub\n• **Resume** — how to download it\n\nWhat would you like to know?";
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
      return res.json({ reply, source: "groq" });
    } catch (err) {
      console.error("Groq failed, trying next:", err.message);
    }
  }

  if (isOpenAI) {
    try {
      const reply = await callOpenAI(messages_ctx);
      return res.json({ reply, source: "openai" });
    } catch (err) {
      console.error(
        "OpenAI error:",
        err.response?.data?.error?.message || err.message,
      );
    }
  }

  // Rule-based fallback
  console.log("⚠️ Using rule-based fallback for:", message);
  res.json({ reply: getRuleBasedReply(message), source: "rule-based" });
});

module.exports = router;
