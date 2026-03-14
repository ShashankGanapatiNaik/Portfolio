import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
const API_BASE = import.meta.env.VITE_API_URL || "/api";

import {
  loginAdmin,
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getSkills,
  createSkillCategory,
  deleteSkillCategory,
  getMessages,
  markMessageRead,
  deleteMessage,
  uploadResume,
} from "../services/api";
import toast from "react-hot-toast";

// ─── Login ────────────────────────────────────────────────────────────────────
function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginAdmin(email, password);
      localStorage.setItem("adminToken", res.data.token);
      onLogin(res.data.token);
      toast.success("Welcome back!");
    } catch {
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card w-full max-w-md"
      >
        <div className="text-center mb-8">
          <p className="font-mono text-accent text-sm mb-2">Admin Portal</p>
          <h1 className="font-display text-2xl font-bold text-lightest-slate">
            Portfolio Dashboard
          </h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-mono text-xs text-slate mb-2 block">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="font-mono text-xs text-slate mb-2 block">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login →"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = ["Projects", "Skills", "Messages", "Resume"];

// ─── Main Admin Dashboard ─────────────────────────────────────────────────────
export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem("adminToken"));
  const [activeTab, setActiveTab] = useState("Projects");

  // Projects state
  const [projects, setProjects] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    techStack: "",
    githubLink: "",
    liveDemo: "",
    featured: false,
  });

  // Skills state
  const [skills, setSkills] = useState([]);

  // Messages state
  const [messages, setMessages] = useState([]);

  const loadData = async () => {
    try {
      const [projRes, skillRes, msgRes] = await Promise.all([
        getProjects(),
        getSkills(),
        getMessages(),
      ]);
      setProjects(projRes.data);
      setSkills(skillRes.data);
      setMessages(msgRes.data);
    } catch (err) {
      toast.error("Failed to load data. Make sure you're logged in.");
    }
  };

  useEffect(() => {
    if (token) loadData();
  }, [token]);

  if (!token) return <LoginForm onLogin={setToken} />;

  // ── Project Handlers ───────────────────────────────────────────────────────
  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...projectForm,
      techStack: projectForm.techStack.split(",").map((t) => t.trim()),
    };
    try {
      if (editingProject) {
        await updateProject(editingProject._id, payload);
        toast.success("Project updated!");
      } else {
        await createProject(payload);
        toast.success("Project created!");
      }
      setProjectForm({
        title: "",
        description: "",
        techStack: "",
        githubLink: "",
        liveDemo: "",
        featured: false,
      });
      setEditingProject(null);
      loadData();
    } catch {
      toast.error("Failed to save project");
    }
  };

  const handleDeleteProject = async (id) => {
    if (!confirm("Delete this project?")) return;
    try {
      await deleteProject(id);
      toast.success("Deleted!");
      loadData();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setProjectForm({
      ...project,
      techStack: project.techStack?.join(", ") || "",
    });
  };

  // ── Message Handlers ───────────────────────────────────────────────────────
  const handleMarkRead = async (id) => {
    await markMessageRead(id);
    loadData();
  };
  const handleDeleteMsg = async (id) => {
    if (!confirm("Delete message?")) return;
    await deleteMessage(id);
    loadData();
  };

  // ── Resume Upload ──────────────────────────────────────────────────────────
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("resume", file);
    try {
      await uploadResume(fd);
      toast.success("Resume uploaded!");
    } catch {
      toast.error("Upload failed");
    }
  };

  // ── Profile Photo Upload ────────────────────────────────────────────────────
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("photo", file);
    try {
      await import("../services/api").then((api) =>
        api.default.post("/profile/photo", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        }),
      );
      toast.success("Profile photo uploaded! Refresh portfolio to see it.");
      // Force reload the preview
      const img = document.querySelector(
        "img[src={`${API_BASE}/profile/photo`}]",
      );
      if (img) img.src = `/api/profile/photo?t=${Date.now()}`;
    } catch {
      toast.error("Photo upload failed");
    }
  };

  return (
    <div className="min-h-screen bg-navy">
      {/* Header */}
      <div className="bg-light-navy border-b border-lightest-navy px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/" className="font-mono text-accent text-sm hover:underline">
            ← Portfolio
          </a>
          <span className="text-lightest-navy">|</span>
          <h1 className="font-display font-bold text-lightest-slate">
            Admin Dashboard
          </h1>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem("adminToken");
            setToken(null);
          }}
          className="font-mono text-xs text-slate hover:text-accent transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-light-navy rounded-xl p-1 border border-lightest-navy">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 rounded-lg font-mono text-sm transition-all ${
                activeTab === tab
                  ? "bg-accent text-navy font-bold"
                  : "text-slate hover:text-lightest-slate"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── PROJECTS TAB ── */}
        {activeTab === "Projects" && (
          <div className="space-y-8">
            {/* Form */}
            <div className="card">
              <h2 className="font-display font-semibold text-lightest-slate mb-6">
                {editingProject ? "Edit Project" : "Add New Project"}
              </h2>
              <form
                onSubmit={handleProjectSubmit}
                className="grid md:grid-cols-2 gap-4"
              >
                <div className="md:col-span-2">
                  <label className="font-mono text-xs text-slate mb-1 block">
                    Title *
                  </label>
                  <input
                    value={projectForm.title}
                    onChange={(e) =>
                      setProjectForm((f) => ({ ...f, title: e.target.value }))
                    }
                    className="input-field"
                    placeholder="Project Title"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="font-mono text-xs text-slate mb-1 block">
                    Description *
                  </label>
                  <textarea
                    rows={3}
                    value={projectForm.description}
                    onChange={(e) =>
                      setProjectForm((f) => ({
                        ...f,
                        description: e.target.value,
                      }))
                    }
                    className="input-field resize-none"
                    placeholder="Project description..."
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="font-mono text-xs text-slate mb-1 block">
                    Tech Stack (comma-separated)
                  </label>
                  <input
                    value={projectForm.techStack}
                    onChange={(e) =>
                      setProjectForm((f) => ({
                        ...f,
                        techStack: e.target.value,
                      }))
                    }
                    className="input-field"
                    placeholder="React.js, Node.js, MongoDB"
                  />
                </div>
                <div>
                  <label className="font-mono text-xs text-slate mb-1 block">
                    GitHub Link
                  </label>
                  <input
                    value={projectForm.githubLink}
                    onChange={(e) =>
                      setProjectForm((f) => ({
                        ...f,
                        githubLink: e.target.value,
                      }))
                    }
                    className="input-field"
                    placeholder="https://github.com/..."
                  />
                </div>
                <div>
                  <label className="font-mono text-xs text-slate mb-1 block">
                    Live Demo
                  </label>
                  <input
                    value={projectForm.liveDemo}
                    onChange={(e) =>
                      setProjectForm((f) => ({
                        ...f,
                        liveDemo: e.target.value,
                      }))
                    }
                    className="input-field"
                    placeholder="https://..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={projectForm.featured}
                    onChange={(e) =>
                      setProjectForm((f) => ({
                        ...f,
                        featured: e.target.checked,
                      }))
                    }
                    className="accent-accent"
                  />
                  <label
                    htmlFor="featured"
                    className="font-mono text-xs text-slate cursor-pointer"
                  >
                    Featured Project
                  </label>
                </div>
                <div className="md:col-span-2 flex gap-3">
                  <button type="submit" className="btn-primary">
                    {editingProject ? "Update" : "Create"} Project
                  </button>
                  {editingProject && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProject(null);
                        setProjectForm({
                          title: "",
                          description: "",
                          techStack: "",
                          githubLink: "",
                          liveDemo: "",
                          featured: false,
                        });
                      }}
                      className="font-mono text-sm text-slate hover:text-lightest-slate transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* List */}
            <div className="space-y-3">
              {projects.map((p) => (
                <div
                  key={p._id}
                  className="card flex items-start justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display font-semibold text-lightest-slate">
                        {p.title}
                      </h3>
                      {p.featured && (
                        <span className="tag text-xs">Featured</span>
                      )}
                    </div>
                    <p className="text-slate text-sm line-clamp-2">
                      {p.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {p.techStack?.slice(0, 4).map((t) => (
                        <span
                          key={t}
                          className="font-mono text-xs text-slate/70"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEditProject(p)}
                      className="font-mono text-xs text-accent hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProject(p._id)}
                      className="font-mono text-xs text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MESSAGES TAB ── */}
        {activeTab === "Messages" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-lightest-slate">
                Contact Messages{" "}
                <span className="text-accent">
                  ({messages.filter((m) => !m.read).length} unread)
                </span>
              </h2>
            </div>
            {messages.length === 0 ? (
              <p className="text-slate font-mono text-sm text-center py-12">
                No messages yet.
              </p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`card transition-all ${!msg.read ? "border-accent/30" : ""}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-display font-semibold text-lightest-slate">
                          {msg.name}
                        </span>
                        {!msg.read && (
                          <span className="w-2 h-2 rounded-full bg-accent inline-block" />
                        )}
                        <span className="font-mono text-xs text-slate">
                          {new Date(msg.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <a
                        href={`mailto:${msg.email}`}
                        className="font-mono text-xs text-accent hover:underline"
                      >
                        {msg.email}
                      </a>
                      <p className="text-slate text-sm mt-2">{msg.message}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {!msg.read && (
                        <button
                          onClick={() => handleMarkRead(msg._id)}
                          className="font-mono text-xs text-accent hover:underline"
                        >
                          Mark Read
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteMsg(msg._id)}
                        className="font-mono text-xs text-red-400 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── RESUME TAB ── */}
        {activeTab === "Resume" && (
          <div className="space-y-6">
            {/* Resume Upload */}
            <div className="card max-w-md">
              <h2 className="font-display font-semibold text-lightest-slate mb-4">
                Upload Resume
              </h2>
              <p className="text-slate text-sm mb-6">
                Upload a PDF resume. This will replace the current active
                resume.
              </p>
              <label className="block border-2 border-dashed border-lightest-navy hover:border-accent/50 rounded-xl p-10 text-center cursor-pointer transition-colors group">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                  📄
                </div>
                <p className="font-mono text-sm text-slate group-hover:text-accent transition-colors">
                  Click to upload PDF
                </p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleResumeUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Profile Photo Upload */}
            <div className="card max-w-md">
              <h2 className="font-display font-semibold text-lightest-slate mb-4">
                Profile Photo
              </h2>
              <p className="text-slate text-sm mb-6">
                Upload your profile photo. It will appear in the Hero section of
                your portfolio.
              </p>

              {/* Preview current photo */}
              <div className="flex items-center gap-4 mb-6">
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "2px solid #64ffda",
                    background: "#233554",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={`${API_BASE}/profile/photo`}
                    alt="Current profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentNode.innerHTML =
                        '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#64ffda;font-family:Syne;font-size:1.5rem;font-weight:800;">SN</div>';
                    }}
                  />
                </div>
                <div>
                  <p className="text-lightest-slate text-sm font-medium">
                    Current Photo
                  </p>
                  <p className="text-slate text-xs mt-1">
                    Max 5MB • JPG, PNG, WEBP
                  </p>
                </div>
              </div>

              <label className="block border-2 border-dashed border-lightest-navy hover:border-accent/50 rounded-xl p-8 text-center cursor-pointer transition-colors group">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                  🖼️
                </div>
                <p className="font-mono text-sm text-slate group-hover:text-accent transition-colors">
                  Click to upload new photo
                </p>
                <p className="font-mono text-xs text-slate/50 mt-1">
                  JPG, PNG, WEBP accepted
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {/* ── SKILLS TAB ── */}
        {activeTab === "Skills" && (
          <div className="space-y-4">
            <h2 className="font-display font-semibold text-lightest-slate mb-6">
              Skills Categories
            </h2>
            {skills.map((s) => (
              <div
                key={s._id}
                className="card flex items-center justify-between"
              >
                <div>
                  <h3 className="font-display font-semibold text-lightest-slate">
                    {s.category}
                  </h3>
                  <p className="font-mono text-xs text-slate mt-1">
                    {s.skills?.map((sk) => sk.name).join(", ")}
                  </p>
                </div>
                <button
                  onClick={async () => {
                    await deleteSkillCategory(s._id);
                    loadData();
                  }}
                  className="font-mono text-xs text-red-400 hover:underline"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
