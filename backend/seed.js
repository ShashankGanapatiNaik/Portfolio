require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Project, Skill, Profile, Admin } = require('./models');

const connectDB = require('./config/db');

const seed = async () => {
  await connectDB();

  // Clear existing
  await Promise.all([Project.deleteMany(), Skill.deleteMany(), Profile.deleteMany(), Admin.deleteMany()]);

  // Profile
  await Profile.create({
    name: 'Shashank Ganapati Naik',
    title: 'Full Stack Developer | AI & Machine Learning Enthusiast',
    email: 'shashankng626@gmail.com',
    linkedin: 'https://www.linkedin.com/in/shashank-naik-6b449428a',
    github: 'https://github.com/ShashankGanapatiNaik',
    leetcode: 'https://leetcode.com/u/shashanknaik6226/',
    bio: 'Motivated Computer Science and Engineering student with strong skills in full-stack development, data structures, and machine learning. Experienced in building scalable web applications using React.js, Node.js, and MongoDB. Passionate about developing AI-powered solutions and solving real-world problems through technology.',
    careerGoals: 'To become a skilled software engineer specializing in full-stack and AI-driven applications, building scalable systems that solve real-world problems and contribute to innovative technology solutions.',
    education: [
      {
        degree: 'Bachelor of Technology (B.Tech) – Computer Science and Engineering',
        institution: 'Reva University, Bangalore',
        period: '2023 – Present',
        grade: 'CGPA: 9.41 / 10',
        description: 'Specializing in Full Stack Development, AI/ML, Data Structures and Algorithms.',
      },
      {
        degree: 'Pre-University Course (PUC) – Science',
        institution: 'Government PU College Idagunji, Uttara Kannada',
        period: '2021 – 2023',
        grade: 'Percentage: 90.47%',
        description: 'Physics, Chemistry, Mathematics & Computer Science.',
      },
    ],
    interests: ['AI & Machine Learning', 'Open Source', 'System Design', 'Competitive Programming', 'Hackathons'],
  });

  // Skills
  await Skill.insertMany([
    { category: 'Programming Languages', order: 1, skills: [
      { name: 'Java', level: 85 }, { name: 'JavaScript', level: 90 },
      { name: 'Python', level: 88 }, { name: 'C', level: 75 },
    ]},
    { category: 'Frontend Technologies', order: 2, skills: [
      { name: 'React.js', level: 90 }, { name: 'HTML5', level: 95 },
      { name: 'CSS3', level: 88 }, { name: 'Tailwind CSS', level: 85 },
    ]},
    { category: 'Backend Technologies', order: 3, skills: [
      { name: 'Node.js', level: 88 }, { name: 'Express.js', level: 87 },
      { name: 'FastAPI', level: 80 }, { name: 'REST APIs', level: 90 },
    ]},
    { category: 'Databases', order: 4, skills: [
      { name: 'MongoDB', level: 85 }, { name: 'MySQL', level: 80 },
    ]},
    { category: 'AI & Data', order: 5, skills: [
      { name: 'Machine Learning', level: 82 }, { name: 'Deep Learning', level: 78 },
      { name: 'NLP', level: 75 }, { name: 'PySpark', level: 72 },
    ]},
    { category: 'Developer Tools', order: 6, skills: [
      { name: 'Git', level: 90 }, { name: 'GitHub', level: 90 },
      { name: 'JWT Auth', level: 85 }, { name: 'OpenCV', level: 75 },
    ]},
    { category: 'Core CS', order: 7, skills: [
      { name: 'DSA', level: 88 }, { name: 'OOP', level: 90 },
      { name: 'OS', level: 80 }, { name: 'DBMS', level: 82 },
      { name: 'Computer Networks', level: 78 },
    ]},
  ]);

  // Projects
  await Project.insertMany([
    {
      title: 'AI Interview Behavior Analyzer',
      description: 'Developed a full-stack AI system that analyzes interview behavior and emotions from recorded videos or live webcam streams. Uses DeepFace for facial emotion detection and OpenCV for video processing, providing real-time behavioral insights to help candidates improve their interview performance.',
      techStack: ['React.js', 'Node.js', 'Express.js', 'FastAPI', 'Python', 'DeepFace', 'OpenCV', 'MongoDB Atlas'],
      githubLink: 'https://github.com/ShashankGanapatiNaik/Ai_Interview_Analyzer',
      liveDemo: '',
      featured: true,
      order: 1,
    },
    {
      title: 'Energy Consumption Forecasting',
      description: 'Analyzed large-scale smart meter data using PySpark and built machine learning models to predict electricity consumption patterns. Processed millions of data points using distributed computing to generate accurate energy usage forecasts.',
      techStack: ['PySpark', 'Machine Learning', 'Python', 'Big Data', 'Pandas', 'Matplotlib'],
      githubLink: 'https://github.com/ShashankGanapatiNaik/Energy_Consumtion_Forecasting',
      liveDemo: '',
      featured: true,
      order: 2,
    },
    {
      title: 'Food Delivery Web Application',
      description: 'Built a full-stack food delivery platform with authentication, payment integration, and real-time order processing. Features include user registration/login, restaurant browsing, cart management, and order tracking.',
      techStack: ['React.js', 'Node.js', 'MongoDB', 'Express.js', 'JWT Authentication', 'Stripe'],
      githubLink: 'https://github.com/ShashankGanapatiNaik/foodie-fullstack',
      liveDemo: '',
      featured: true,
      order: 3,
    },
    {
      title: 'Movie Recommendation System',
      description: 'Created a machine learning-based recommendation system that suggests movies based on similarity and user preferences using content-based filtering and cosine similarity. Deployed as an interactive Streamlit web app.',
      techStack: ['Python', 'Machine Learning', 'Streamlit', 'Pandas', 'Scikit-learn', 'TMDB API'],
      githubLink: 'https://github.com/ShashankGanapatiNaik/Movie-Recommandation',
      liveDemo: '',
      featured: false,
      order: 4,
    },
  ]);

  // Admin
  const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 12);
  await Admin.create({ email: process.env.ADMIN_EMAIL || 'shashankng626@gmail.com', password: hashed });

  console.log('✅ Database seeded successfully!');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
