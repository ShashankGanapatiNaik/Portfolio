import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// Attach JWT for admin requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Profile
export const getProfile = () => api.get("/profile");
export const updateProfile = (data) => api.post("/profile", data);

// Projects
export const getProjects = (tech) =>
  api.get("/projects", { params: tech ? { tech } : {} });
export const createProject = (data) => api.post("/projects", data);
export const updateProject = (id, data) => api.put(`/projects/${id}`, data);
export const deleteProject = (id) => api.delete(`/projects/${id}`);

// Skills
export const getSkills = () => api.get("/skills");
export const createSkillCategory = (data) => api.post("/skills", data);
export const updateSkillCategory = (id, data) => api.put(`/skills/${id}`, data);
export const deleteSkillCategory = (id) => api.delete(`/skills/${id}`);

// Resume
export const downloadResume = () =>
  api.get("/resume", { responseType: "blob" });
export const uploadResume = (formData) =>
  api.post("/resume", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Contact
export const sendContact = (data) => api.post("/contact", data);
export const getMessages = () => api.get("/contact");
export const markMessageRead = (id) => api.patch(`/contact/${id}/read`);
export const deleteMessage = (id) => api.delete(`/contact/${id}`);

// GitHub
export const getGithubData = () => api.get("/github");

// LeetCode
export const getLeetcodeData = () => api.get("/leetcode");

// Chatbot
export const sendChatMessage = (message, history) =>
  api.post("/chat", { message, history });

// Auth
export const loginAdmin = (email, password) =>
  api.post("/auth/login", { email, password });

export default api;

// Resume approval workflow
export const requestResume = (data) => api.post("/resume/request", data);
export const checkResumeStatus = (token) => api.get(`/resume/status/${token}`);
export const getResumeDownloadUrl = (token) =>
  `${BASE_URL}/resume/download/${token}`;
