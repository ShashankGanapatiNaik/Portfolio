const express = require("express");
const router = express.Router();
const axios = require("axios");
const { Project, Skill, Profile } = require("../models");

const isGroq = !!process.env.GROQ_API_KEY;
const isOpenAI =
  !!process.env.OPENAI_API_KEY &&
  process.env.OPENAI_API_KEY !== "your_openai_api_key";

console.log(
  `🤖 Chatbot: ${isGroq ? "Groq LLaMA 3.3 (FREE)" : isOpenAI ? "OpenAI GPT-3.5" : "Rule-based fallback"}`,
);

// Build portfolio context from DB + fallback profile
const getPortfolioContext = async () => {
  let dbProjects = [], dbSkills = [], dbProfile = null;
  try {
    [dbProjects, dbSkills, dbProfile] = await Promise.all([
      Project.find().lean(),
      Skill.find().lean(),
      Profile.findOne().lean(),
    ]);
  } catch (e) {
    console.error("Chatbot DB context fetch error:", e.message);
  }

  const projectsSummary = dbProjects.length
    ? dbProjects
        .map(
          (p) =>
            `- "${p.title}": ${p.description}. Tech Stack: ${p.techStack?.join(", ")}. GitHub: ${p.githubLink || "N/A"}.`,
        )
        .join("\n")
    : `- AI Interview Behavior Analyzer: Real-time video/webcam facial emotion & behavior analysis using DeepFace & OpenCV (7 emotions). Tech: React.js, Node.js, FastAPI, Python, DeepFace, OpenCV, MongoDB Atlas. GitHub: https://github.com/ShashankGanapatiNaik/Ai_Interview_Analyzer
- Energy Consumption Forecasting: Large-scale smart meter data processing and electricity consumption forecasting using PySpark & distributed ML. Tech: PySpark, Python, Machine Learning, Big Data, Pandas, Matplotlib. GitHub: https://github.com/ShashankGanapatiNaik/Energy_Consumtion_Forecasting
- Food Delivery Web Application: Full-stack food ordering platform with JWT auth, cart management, real-time processing, and Stripe payments. Tech: React.js, Node.js, Express.js, MongoDB, JWT Auth, Stripe API. GitHub: https://github.com/ShashankGanapatiNaik/foodie-fullstack
- Movie Recommendation System: Content-based ML movie recommender using cosine similarity and TMDB API, deployed on Streamlit. Tech: Python, Machine Learning, Streamlit, Scikit-learn, TMDB API. GitHub: https://github.com/ShashankGanapatiNaik/Movie-Recommandation`;

  const skillsSummary = dbSkills.length
    ? dbSkills
        .map(
          (s) => `${s.category}: ${s.skills?.map((sk) => sk.name).join(", ")}`,
        )
        .join("\n")
    : `Languages: JavaScript, Python, Java, C, C++, SQL, HTML5, CSS3
Frontend: React.js, HTML5, CSS3, Tailwind CSS, Responsive Web Design
Backend: Node.js, Express.js, FastAPI, REST APIs, WebSockets
Databases: MongoDB, MongoDB Atlas, MySQL
AI & Machine Learning: Machine Learning, Deep Learning, DeepFace, OpenCV, PySpark, Content-Based Filtering, Cosine Similarity, Scikit-learn, Pandas, NumPy, Matplotlib
Tools & Platforms: Git, GitHub, Vercel, Render, Postman, JWT Auth, Multer, Axios
Core Computer Science: Data Structures & Algorithms (DSA), OOP, Operating Systems, DBMS, Computer Networks`;

  return `You are the helpful, intelligent AI assistant on ${dbProfile?.name || "Shashank Ganapati Naik"}'s developer portfolio website.
Answer questions from recruiters, hiring managers, developers, and visitors accurately, concisely, and professionally.

KNOWLEDGE BASE:
Name: ${dbProfile?.name || "Shashank Ganapati Naik"}
Title: ${dbProfile?.title || "Full Stack Developer | AI & Machine Learning Enthusiast"}
Email: ${dbProfile?.email || "shashankng626@gmail.com"}
Location: Bangalore, Karnataka, India
LinkedIn: ${dbProfile?.linkedin || "https://www.linkedin.com/in/shashank-naik-6b449428a"}
GitHub: ${dbProfile?.github || "https://github.com/ShashankGanapatiNaik"}
LeetCode: ${dbProfile?.leetcode || "https://leetcode.com/u/shashanknaik6226/"}
GeeksforGeeks: https://www.geeksforgeeks.org/profile/shashanknaik6226
Codolio: https://codolio.com/profile/shashanknaik6226

EDUCATION:
1. B.Tech in Computer Science & Engineering - Reva University, Bangalore (2023 – Present) | CGPA: 9.41 / 10
2. Pre-University Course (PUC) Science (PCM+CS) - Govt. PU College Idagunji, Uttara Kannada (2021 – 2023) | Grade: 90.47%

TECHNICAL SKILLS:
${skillsSummary}

FEATURED PROJECTS:
${projectsSummary}

CAREER OBJECTIVES & AVAILABILITY:
- Shashank is actively seeking internships, full-time software engineering, full-stack development, or AI/ML roles.
- He is located in Bangalore, India and open to on-site, hybrid, and remote positions worldwide.

INSTRUCTIONS:
- Answer questions clearly using polite, professional tone and markdown formatting (bullet points, bold headings).
- Keep responses concise (under 250 words) unless the user asks for a detailed explanation.
- For resume requests: tell the user to click the "Download Resume" button in the Hero section at the top of the portfolio page.
- Answer technical questions about Shashank's projects, architecture choices, and skills accurately and enthusiastically.`;
};

// Groq active model list (updated for latest 2025/2026 endpoints)
const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "gemma2-9b-it",
  "mixtral-8x7b-32768",
];

// Call Groq API directly via axios — tries multiple models
const callGroq = async (messages) => {
  require("dotenv").config();
  const apiKey = (process.env.GROQ_API_KEY || "").trim();
  if (!apiKey) throw new Error("GROQ_API_KEY is not set in environment");

  let lastError = null;

  for (const model of GROQ_MODELS) {
    try {
      console.log(`🔄 Trying Groq model: ${model} with key: ${apiKey.slice(0, 10)}...`);
      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model,
          messages,
          max_tokens: 450,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 12000,
        },
      );
      const content = response.data.choices[0]?.message?.content;
      if (content) {
        console.log(`✅ Groq success with model: ${model}`);
        return content;
      }
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
        console.error(
          "🔑 Groq API key invalid or unauthorized — check GROQ_API_KEY in .env",
        );
        throw new Error(`Groq auth error: ${errMsg}`);
      }
      // If rate limited, log warning and try next candidate
      if (status === 429) {
        console.warn(`⏳ Groq rate limit hit on ${model}, trying next...`);
      }
    }
  }

  throw new Error(
    `All Groq models failed. Last: ${JSON.stringify(lastError)}`,
  );
};

// Call OpenAI API directly via axios
const callOpenAI = async (messages) => {
  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    { model: "gpt-3.5-turbo", messages, max_tokens: 450, temperature: 0.7 },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 12000,
    },
  );
  return response.data.choices[0]?.message?.content;
};

// Comprehensive intelligent rule-based fallback
const getRuleBasedReply = (msg) => {
  const m = msg.toLowerCase().trim();

  // Project specific: AI Interview Analyzer
  if (
    m.includes("interview") ||
    m.includes("deepface") ||
    m.includes("emotion") ||
    m.includes("behavior")
  ) {
    return "🤖 **AI Interview Behavior Analyzer**\n\n• **Description**: Full-stack AI system analyzing interview behavior and emotions from live webcam streams or recorded videos using DeepFace & OpenCV for real-time 7-emotion detection.\n• **Tech Stack**: React.js, Node.js, FastAPI, Python, DeepFace, OpenCV, MongoDB Atlas\n• **GitHub Repo**: https://github.com/ShashankGanapatiNaik/Ai_Interview_Analyzer";
  }

  // Project specific: Energy Forecasting
  if (
    m.includes("energy") ||
    m.includes("forecast") ||
    m.includes("pyspark") ||
    m.includes("smart meter") ||
    m.includes("electricity")
  ) {
    return "⚡ **Energy Consumption Forecasting**\n\n• **Description**: Large-scale smart meter data processing and electricity consumption forecasting using distributed machine learning with PySpark.\n• **Tech Stack**: PySpark, Machine Learning, Python, Big Data, Pandas, Matplotlib\n• **GitHub Repo**: https://github.com/ShashankGanapatiNaik/Energy_Consumtion_Forecasting";
  }

  // Project specific: Food Delivery
  if (
    m.includes("food") ||
    m.includes("foodie") ||
    m.includes("delivery") ||
    m.includes("stripe") ||
    m.includes("order")
  ) {
    return "🍕 **Food Delivery Web Application**\n\n• **Description**: Full-stack online ordering platform featuring JWT authentication, real-time cart management, restaurant browsing, and Stripe payment integration.\n• **Tech Stack**: React.js, Node.js, Express.js, MongoDB, JWT Auth, Stripe API\n• **GitHub Repo**: https://github.com/ShashankGanapatiNaik/foodie-fullstack";
  }

  // Project specific: Movie Recommender
  if (
    m.includes("movie") ||
    m.includes("recommend") ||
    m.includes("streamlit") ||
    m.includes("cosine") ||
    m.includes("tmdb")
  ) {
    return "🎬 **Movie Recommendation System**\n\n• **Description**: ML recommendation engine suggesting movies based on content-based filtering and cosine similarity on TMDB dataset. Deployed as an interactive Streamlit web app.\n• **Tech Stack**: Python, Machine Learning, Streamlit, Scikit-learn, TMDB API\n• **GitHub Repo**: https://github.com/ShashankGanapatiNaik/Movie-Recommandation";
  }

  // General Projects
  if (
    m.includes("project") ||
    m.includes("built") ||
    m.includes("creat") ||
    m.includes("develop") ||
    m.includes("portfolio") ||
    m.includes("app")
  ) {
    return "🚀 **Shashank's Featured Projects**:\n\n1. 🤖 **AI Interview Behavior Analyzer** — DeepFace & OpenCV real-time facial expression analysis (React, FastAPI, Python, MongoDB)\n2. ⚡ **Energy Consumption Forecasting** — Big data ML pipeline with PySpark analyzing smart meter data\n3. 🍕 **Food Delivery Web App** — Full-stack platform with auth, cart management & Stripe payments\n4. 🎬 **Movie Recommendation System** — ML content-based recommender deployed on Streamlit\n\nCheck out the Projects section on the site or visit his GitHub: https://github.com/ShashankGanapatiNaik";
  }

  // Education / College / CGPA
  if (
    m.includes("education") ||
    m.includes("college") ||
    m.includes("university") ||
    m.includes("reva") ||
    m.includes("cgpa") ||
    m.includes("gpa") ||
    m.includes("study") ||
    m.includes("puc") ||
    m.includes("idagunji") ||
    m.includes("degree") ||
    m.includes("grade") ||
    m.includes("mark")
  ) {
    return "🎓 **Shashank's Education**:\n\n• **B.Tech in Computer Science & Engineering**\n  Reva University, Bangalore (2023 – Present)\n  CGPA: **9.41 / 10** 🌟\n\n• **Pre-University (Science / PCM+CS)**\n  Govt. PU College Idagunji, Uttara Kannada (2021 – 2023)\n  Score: **90.47%**";
  }

  // Core CS / Fundamentals specific
  if (
    m.includes("core cs") ||
    m.includes("core computer science") ||
    m.includes("cs fundamental") ||
    m.includes("dsa") ||
    m.includes("oop") ||
    m.includes("object oriented") ||
    m.includes("operating system") ||
    m.includes("dbms") ||
    m.includes("computer network") ||
    m.includes("system design")
  ) {
    return "🧠 **Core Computer Science Fundamentals Shashank Knows**:\n\n• **Data Structures & Algorithms (DSA)** — Arrays, Linked Lists, Trees, Graphs, Dynamic Programming, Sorting & Searching\n• **Object-Oriented Programming (OOP)** — Abstraction, Encapsulation, Inheritance, Polymorphism\n• **Database Management Systems (DBMS)** — Relational DBs (MySQL, SQL), NoSQL (MongoDB, MongoDB Atlas), Schema Design, Normalization\n• **Operating Systems (OS)** — Process Management, Multi-threading, Concurrency, Memory Management\n• **Computer Networks (CN)** — TCP/IP, HTTP/HTTPS, REST Architecture, WebSockets";
  }

  // Database specific
  if (
    m.includes("database") ||
    m.includes("db") ||
    m.includes("mongo") ||
    m.includes("mysql") ||
    m.includes("nosql")
  ) {
    return "🗄️ **Databases Shashank Knows**:\n\n• **MongoDB** & **MongoDB Atlas** (NoSQL / Document Store)\n• **MySQL** (Relational Database)\n• **SQL** (Querying & Schema Design)";
  }

  // Languages specific
  if (
    m.includes("programming language") ||
    m.includes("languages") ||
    m.includes("python") ||
    m.includes("javascript") ||
    m.includes("java") ||
    m.includes("c++")
  ) {
    return "💻 **Programming Languages Shashank Knows**:\n\n• **JavaScript** (ES6+ / Node.js / React.js)\n• **Python** (AI/ML, PySpark, FastAPI, OpenCV)\n• **Java** (Core Java, OOP)\n• **C & C++** (Data Structures & Algorithms)\n• **SQL** (Database Queries)\n• **HTML5 & CSS3** (Web Technologies)";
  }

  // Backend specific
  if (
    m.includes("backend") ||
    m.includes("server") ||
    m.includes("express") ||
    m.includes("fastapi")
  ) {
    return "⚙️ **Backend Technologies Shashank Knows**:\n\n• **Node.js** & **Express.js** (RESTful APIs, Microservices, Auth)\n• **FastAPI** (Python AI/ML API integration)\n• **REST APIs** & **WebSockets**\n• **JWT Authentication** (Secure Session Management)";
  }

  // Frontend specific
  if (
    m.includes("frontend") ||
    m.includes("react") ||
    m.includes("tailwind") ||
    m.includes("ui") ||
    m.includes("ux")
  ) {
    return "🎨 **Frontend Technologies Shashank Knows**:\n\n• **React.js** (Component-Based UI, Hooks, State Management)\n• **Tailwind CSS** & **Vanilla CSS** (Responsive UI/UX, Glassmorphism, Animations)\n• **HTML5** & **Framer Motion** (Micro-animations)";
  }

  // Location / Address / City
  if (
    m.includes("location") ||
    m.includes("city") ||
    m.includes("bangalore") ||
    m.includes("where") ||
    m.includes("address") ||
    m.includes("karnataka") ||
    m.includes("india") ||
    m.includes("place")
  ) {
    return "📍 **Location**:\n\nShashank is based in **Bangalore, Karnataka, India**. He is open to on-site, hybrid, and remote opportunities worldwide!";
  }

  // General Skills / Technologies / Stack
  if (
    m.includes("skill") ||
    m.includes("technolog") ||
    m.includes("framework") ||
    m.includes("stack")
  ) {
    return "🛠️ **Shashank's Technical Skills**:\n\n• **Languages**: JavaScript, Python, Java, C, C++, SQL, HTML5, CSS3\n• **Frontend**: React.js, Tailwind CSS, Responsive Web Design\n• **Backend**: Node.js, Express.js, FastAPI, REST APIs, WebSockets\n• **Databases**: MongoDB, MongoDB Atlas, MySQL\n• **AI / ML**: Machine Learning, Deep Learning, OpenCV, DeepFace, PySpark, Scikit-learn, Pandas, NumPy\n• **Tools**: Git, GitHub, Vercel, Render, JWT Auth, Postman";
  }

  // LeetCode / DSA / Competitive
  if (
    m.includes("leetcode") ||
    m.includes("dsa") ||
    m.includes("algorithm") ||
    m.includes("problem") ||
    m.includes("coding") ||
    m.includes("gfg") ||
    m.includes("geeksforgeeks") ||
    m.includes("codolio")
  ) {
    return "🏆 **Problem Solving & Competitive Profiles**:\n\n• **LeetCode**: https://leetcode.com/u/shashanknaik6226/ (Solves DSA problems across Easy, Medium, Hard)\n• **GeeksforGeeks**: https://www.geeksforgeeks.org/profile/shashanknaik6226\n• **Codolio Aggregator**: https://codolio.com/profile/shashanknaik6226\n\nCheck the **LeetCode Activity** section on the website for live heatmaps and stats!";
  }

  // Resume / Download
  if (
    m.includes("resume") ||
    m.includes("cv") ||
    m.includes("download") ||
    m.includes("pdf")
  ) {
    return "📄 **Shashank's Resume**:\n\nYou can request and download Shashank's resume directly by clicking the **\"Download Resume\"** button in the Hero section at the top of the page!\n\nOr feel free to reach out via email: **shashankng626@gmail.com**";
  }

  // Contact / Email / LinkedIn / GitHub / Hire / Jobs
  if (
    m.includes("contact") ||
    m.includes("email") ||
    m.includes("mail") ||
    m.includes("hire") ||
    m.includes("job") ||
    m.includes("intern") ||
    m.includes("reach") ||
    m.includes("connect") ||
    m.includes("linkedin") ||
    m.includes("github") ||
    m.includes("phone") ||
    m.includes("mobile") ||
    m.includes("number")
  ) {
    return "📬 **Contact & Connect with Shashank**:\n\n• 📧 **Email**: shashankng626@gmail.com\n• 💼 **LinkedIn**: https://www.linkedin.com/in/shashank-naik-6b449428a\n• 💻 **GitHub**: https://github.com/ShashankGanapatiNaik\n• 🧩 **LeetCode**: https://leetcode.com/u/shashanknaik6226/\n\nFeel free to send a message via the **Contact Form** at the bottom of the page!";
  }

  // About / Bio / Who / Owner
  if (
    m.includes("about") ||
    m.includes("who") ||
    m.includes("owner") ||
    m.includes("author") ||
    m.includes("creator") ||
    m.includes("summary") ||
    m.includes("bio") ||
    m.includes("background") ||
    m.includes("shashank") ||
    m.includes("naik")
  ) {
    return "👨‍💻 **About Shashank Ganapati Naik**:\n\nThe owner of this portfolio is **Shashank Ganapati Naik**, a Computer Science & Engineering student at Reva University, Bangalore (CGPA: 9.41/10). He is a passionate full-stack developer and AI/ML engineer.";
  }

  // Greeting
  if (
    m.match(
      /^(hi|hello|hey|hii|howdy|sup|whats up|what's up|good morning|good afternoon|good evening)[!?.]*$/,
    )
  ) {
    return "Hi there! 👋 I'm Shashank's AI assistant.\n\nI can answer any questions about his:\n• 🚀 **Projects** (AI Interview Analyzer, PySpark Energy Forecast, etc.)\n• 🛠️ **Skills & Tech Stack** (React, Node.js, Python, AI/ML)\n• 🎓 **Education & CGPA** (B.Tech CSE at Reva University - 9.41/10)\n• 📄 **Resume & Contact Details**\n\nWhat would you like to know?";
  }

  return "Hi! 👋 I'm Shashank's AI assistant.\n\nFeel free to ask me about:\n- His top projects (AI Interview Analyzer, PySpark Energy Forecast, Food Delivery App, Movie Recommender)\n- Technical skills & programming languages\n- Education at Reva University (CGPA 9.41/10)\n- How to download his resume or contact him!\n\nWhat would you like to know?";
};

router.post("/", async (req, res) => {
  require("dotenv").config();
  const { message, history = [] } = req.body;
  if (!message?.trim())
    return res.status(400).json({ error: "Message is required" });

  const messages_ctx = [
    { role: "system", content: await getPortfolioContext() },
    ...history.slice(-6),
    { role: "user", content: message },
  ];

  // Try Groq first, then OpenAI, then rule-based
  const currentGroqKey = (process.env.GROQ_API_KEY || "").trim();
  if (currentGroqKey && currentGroqKey !== "your_groq_api_key") {
    try {
      const reply = await callGroq(messages_ctx);
      return res.json({ reply, source: "groq" });
    } catch (err) {
      console.error("Groq failed, trying next fallback:", err.message);
    }
  }

  const currentOpenAIKey = (process.env.OPENAI_API_KEY || "").trim();
  if (currentOpenAIKey && currentOpenAIKey !== "your_openai_api_key") {
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
