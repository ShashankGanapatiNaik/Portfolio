import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
const API_BASE = import.meta.env.VITE_API_URL || "/api";

import {
  loginAdmin, getProjects, createProject, updateProject, deleteProject,
  getSkills, createSkillCategory, deleteSkillCategory,
  getMessages, markMessageRead, deleteMessage, uploadResume,
} from "../services/api";
import toast from "react-hot-toast";

/* ─── SVG Icons ─────────────────────────────────────────────────────────── */
const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ICONS = {
  projects: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2",
  skills:   "M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18",
  messages: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  resume:   "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  logout:   "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
  edit:     "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  trash:    "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  check:    "M5 13l4 4L19 7",
  plus:     "M12 4v16m8-8H4",
  back:     "M10 19l-7-7m0 0l7-7m-7 7h18",
};

/* ─── Login Page ─────────────────────────────────────────────────────────── */
function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

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
    <div className="adm-login-bg">
      {/* Animated background orbs */}
      <div className="adm-orb adm-orb-1" />
      <div className="adm-orb adm-orb-2" />

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="adm-login-card"
      >
        {/* Logo area */}
        <div className="adm-login-logo">
          <div className="adm-login-logo-icon" style={{ overflow: "hidden", padding: 0 }}>
            <img
              src={`${API_BASE}/profile/photo`}
              alt="Shashank Naik"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentNode.innerHTML = '<span style="font-size:1.1rem;font-weight:700;color:var(--accent)">SN</span>';
              }}
            />
          </div>
          <div>
            <p className="adm-login-eyebrow">Admin Portal</p>
            <h1 className="adm-login-title">Portfolio Dashboard</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="adm-login-form">
          <div className="adm-field">
            <label className="adm-label">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="adm-input"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div className="adm-field">
            <label className="adm-label">Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="adm-input"
                placeholder="••••••••"
                required
                style={{ paddingRight: "2.5rem" }}
              />
              <button type="button" className="adm-pw-toggle" onClick={() => setShowPw(v => !v)}>
                {showPw ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="adm-btn-primary">
            {loading ? (
              <span className="adm-spinner" />
            ) : (
              <>Sign in <span style={{ marginLeft: 4 }}>→</span></>
            )}
          </button>
        </form>

        <p className="adm-login-hint">Secure admin access only</p>
      </motion.div>
    </div>
  );
}

/* ─── Sidebar Nav ────────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { id: "Projects", icon: ICONS.projects, label: "Projects" },
  { id: "Skills",   icon: ICONS.skills,   label: "Skills"   },
  { id: "Messages", icon: ICONS.messages, label: "Messages" },
  { id: "Resume",   icon: ICONS.resume,   label: "Files"    },
];

/* ─── Stat Card ──────────────────────────────────────────────────────────── */
function StatCard({ label, value, color, icon }) {
  return (
    <div className="adm-stat-card" style={{ "--stat-color": color }}>
      <div className="adm-stat-icon">{icon}</div>
      <div className="adm-stat-val">{value}</div>
      <div className="adm-stat-label">{label}</div>
    </div>
  );
}

/* ─── Main Admin ─────────────────────────────────────────────────────────── */
export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem("adminToken"));
  const [activeTab, setActiveTab] = useState("Projects");
  const [projects, setProjects] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [projectForm, setProjectForm] = useState({
    title: "", description: "", techStack: "", githubLink: "", liveDemo: "", featured: false,
  });
  const [skills, setSkills] = useState([]);
  const [messages, setMessages] = useState([]);

  const loadData = async () => {
    try {
      const [projRes, skillRes, msgRes] = await Promise.all([
        getProjects(), getSkills(), getMessages(),
      ]);
      setProjects(projRes.data);
      setSkills(skillRes.data);
      setMessages(msgRes.data);
    } catch {
      toast.error("Failed to load data.");
    }
  };

  useEffect(() => { if (token) loadData(); }, [token]);

  if (!token) return <LoginForm onLogin={setToken} />;

  /* handlers */
  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...projectForm, techStack: projectForm.techStack.split(",").map(t => t.trim()) };
    try {
      if (editingProject) { await updateProject(editingProject._id, payload); toast.success("Project updated!"); }
      else { await createProject(payload); toast.success("Project created!"); }
      setProjectForm({ title: "", description: "", techStack: "", githubLink: "", liveDemo: "", featured: false });
      setEditingProject(null);
      loadData();
    } catch { toast.error("Failed to save project"); }
  };

  const handleDeleteProject = async (id) => {
    if (!confirm("Delete this project?")) return;
    try { await deleteProject(id); toast.success("Deleted!"); loadData(); }
    catch { toast.error("Failed to delete"); }
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setProjectForm({ ...project, techStack: project.techStack?.join(", ") || "" });
  };

  const handleMarkRead  = async (id) => { await markMessageRead(id); loadData(); };
  const handleDeleteMsg = async (id) => {
    if (!confirm("Delete message?")) return;
    await deleteMessage(id); loadData();
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const fd = new FormData(); fd.append("resume", file);
    try { await uploadResume(fd); toast.success("Resume uploaded!"); }
    catch (err) { toast.error(`Upload failed: ${err.response?.data?.error || err.message}`); }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const fd = new FormData(); fd.append("photo", file);
    try {
      await import("../services/api").then(api => api.default.post("/profile/photo", fd, { headers: { "Content-Type": "multipart/form-data" } }));
      toast.success("Profile photo uploaded!");
    } catch (err) { toast.error(`Photo upload failed: ${err.response?.data?.error || err.message}`); }
  };

  const unread = messages.filter(m => !m.read).length;

  return (
    <div className="adm-shell">
      {/* ── Sidebar ── */}
      <aside className="adm-sidebar">
        <div className="adm-sidebar-logo">
          <div className="adm-sidebar-logo-icon" style={{ overflow: "hidden", padding: 0, borderRadius: "50%" }}>
            <img
              src={`${API_BASE}/profile/photo`}
              alt="Shashank Naik"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentNode.innerHTML = '<span style="font-size:0.85rem;font-weight:700;color:var(--accent)">SN</span>';
              }}
            />
          </div>
          <span className="adm-sidebar-logo-text">Shashank Naik</span>
        </div>

        <nav className="adm-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`adm-nav-item${activeTab === item.id ? " adm-nav-item--active" : ""}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {item.icon.split(" M").map((seg, i) => (
                  <path key={i} d={i === 0 ? seg : "M" + seg} />
                ))}
              </svg>
              <span>{item.label}</span>
              {item.id === "Messages" && unread > 0 && (
                <span className="adm-badge">{unread}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="adm-sidebar-footer">
          <a href="/" className="adm-nav-item" style={{ textDecoration: "none" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Portfolio</span>
          </a>
          <button className="adm-nav-item adm-nav-logout"
            onClick={() => { localStorage.removeItem("adminToken"); setToken(null); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="adm-main">
        {/* Top header */}
        <header className="adm-header">
          <div>
            <h1 className="adm-header-title">{activeTab}</h1>
            <p className="adm-header-sub">
              {activeTab === "Projects" && `${projects.length} projects total`}
              {activeTab === "Messages" && `${unread} unread · ${messages.length} total`}
              {activeTab === "Skills"   && `${skills.length} categories`}
              {activeTab === "Resume"   && "Manage files & media"}
            </p>
          </div>

          {/* Stat pills */}
          <div className="adm-header-stats">
            <div className="adm-mini-stat"><span className="adm-mini-num">{projects.length}</span> Projects</div>
            <div className="adm-mini-stat"><span className="adm-mini-num" style={{ color: "#f472b6" }}>{unread}</span> Unread</div>
            <div className="adm-mini-stat"><span className="adm-mini-num" style={{ color: "#60a5fa" }}>{skills.length}</span> Skills</div>
          </div>
        </header>

        <div className="adm-content">
          <AnimatePresence mode="wait">
            {/* ══ PROJECTS ══ */}
            {activeTab === "Projects" && (
              <motion.div key="projects"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}
                className="adm-tab-body">

                {/* Form card */}
                <div className="adm-card">
                  <div className="adm-card-header">
                    <h2 className="adm-card-title">
                      {editingProject ? "✏️ Edit Project" : "➕ Add New Project"}
                    </h2>
                    {editingProject && (
                      <button className="adm-btn-ghost"
                        onClick={() => { setEditingProject(null); setProjectForm({ title: "", description: "", techStack: "", githubLink: "", liveDemo: "", featured: false }); }}>
                        Cancel
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleProjectSubmit} className="adm-form-grid">
                    <div className="adm-field adm-col-2">
                      <label className="adm-label">Project Title *</label>
                      <input value={projectForm.title}
                        onChange={e => setProjectForm(f => ({ ...f, title: e.target.value }))}
                        className="adm-input" placeholder="My Awesome Project" required />
                    </div>

                    <div className="adm-field adm-col-2">
                      <label className="adm-label">Description *</label>
                      <textarea rows={3} value={projectForm.description}
                        onChange={e => setProjectForm(f => ({ ...f, description: e.target.value }))}
                        className="adm-input adm-textarea" placeholder="Describe what this project does..." required />
                    </div>

                    <div className="adm-field adm-col-2">
                      <label className="adm-label">Tech Stack <span className="adm-label-hint">(comma-separated)</span></label>
                      <input value={projectForm.techStack}
                        onChange={e => setProjectForm(f => ({ ...f, techStack: e.target.value }))}
                        className="adm-input" placeholder="React.js, Node.js, MongoDB" />
                    </div>

                    <div className="adm-field">
                      <label className="adm-label">GitHub URL</label>
                      <input value={projectForm.githubLink}
                        onChange={e => setProjectForm(f => ({ ...f, githubLink: e.target.value }))}
                        className="adm-input" placeholder="https://github.com/..." />
                    </div>

                    <div className="adm-field">
                      <label className="adm-label">Live Demo URL</label>
                      <input value={projectForm.liveDemo}
                        onChange={e => setProjectForm(f => ({ ...f, liveDemo: e.target.value }))}
                        className="adm-input" placeholder="https://..." />
                    </div>

                    <div className="adm-field adm-col-2">
                      <label className="adm-toggle-label">
                        <div className={`adm-toggle${projectForm.featured ? " adm-toggle--on" : ""}`}
                          onClick={() => setProjectForm(f => ({ ...f, featured: !f.featured }))}>
                          <div className="adm-toggle-thumb" />
                        </div>
                        <span>Mark as Featured Project</span>
                      </label>
                    </div>

                    <div className="adm-field adm-col-2">
                      <button type="submit" className="adm-btn-primary" style={{ width: "fit-content" }}>
                        {editingProject ? "Update Project" : "Create Project"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Project list */}
                <div className="adm-list">
                  {projects.map((p, i) => (
                    <motion.div key={p._id}
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="adm-list-item">
                      <div className="adm-list-item-accent" />
                      <div className="adm-list-item-body">
                        <div className="adm-list-item-top">
                          <div>
                            <div className="adm-list-item-title-row">
                              <h3 className="adm-list-item-title">{p.title}</h3>
                              {p.featured && <span className="adm-featured-pill">✦ Featured</span>}
                            </div>
                            <p className="adm-list-item-desc">{p.description}</p>
                            <div className="adm-list-chips">
                              {p.techStack?.slice(0, 5).map(t => (
                                <span key={t} className="adm-chip">{t}</span>
                              ))}
                            </div>
                          </div>
                          <div className="adm-list-item-actions">
                            <button onClick={() => handleEditProject(p)} className="adm-action-btn adm-action-edit">
                              Edit
                            </button>
                            <button onClick={() => handleDeleteProject(p._id)} className="adm-action-btn adm-action-delete">
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ══ MESSAGES ══ */}
            {activeTab === "Messages" && (
              <motion.div key="messages"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}
                className="adm-tab-body">

                {messages.length === 0 ? (
                  <div className="adm-empty">
                    <div className="adm-empty-icon">💬</div>
                    <p>No messages yet</p>
                  </div>
                ) : (
                  <div className="adm-list">
                    {messages.map((msg, i) => (
                      <motion.div key={msg._id}
                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className={`adm-msg-card${!msg.read ? " adm-msg-card--unread" : ""}`}>
                        <div className="adm-msg-top">
                          <div className="adm-msg-avatar">
                            {msg.name?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div className="adm-msg-meta">
                            <div className="adm-msg-name-row">
                              <span className="adm-msg-name">{msg.name}</span>
                              {!msg.read && <span className="adm-unread-dot" />}
                              <span className="adm-msg-date">
                                {new Date(msg.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </span>
                            </div>
                            <a href={`mailto:${msg.email}`} className="adm-msg-email">{msg.email}</a>
                          </div>
                          <div className="adm-list-item-actions">
                            {!msg.read && (
                              <button onClick={() => handleMarkRead(msg._id)} className="adm-action-btn adm-action-edit">
                                Mark Read
                              </button>
                            )}
                            <button onClick={() => handleDeleteMsg(msg._id)} className="adm-action-btn adm-action-delete">
                              Delete
                            </button>
                          </div>
                        </div>
                        <p className="adm-msg-body">{msg.message}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ══ RESUME / FILES ══ */}
            {activeTab === "Resume" && (
              <motion.div key="resume"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}
                className="adm-tab-body adm-files-grid">

                {/* Resume */}
                <div className="adm-card">
                  <div className="adm-card-header">
                    <h2 className="adm-card-title">📄 Resume</h2>
                  </div>
                  <p className="adm-card-desc">Upload a PDF — replaces the current active resume.</p>
                  <label className="adm-dropzone">
                    <div className="adm-dropzone-icon">📄</div>
                    <p className="adm-dropzone-title">Click to upload PDF</p>
                    <p className="adm-dropzone-hint">PDF files only</p>
                    <input type="file" accept=".pdf" onChange={handleResumeUpload} className="hidden" />
                  </label>
                </div>

                {/* Photo */}
                <div className="adm-card">
                  <div className="adm-card-header">
                    <h2 className="adm-card-title">🖼️ Profile Photo</h2>
                  </div>
                  <p className="adm-card-desc">Appears in the Hero section of your portfolio.</p>

                  <div className="adm-photo-preview">
                    <div className="adm-photo-avatar">
                      <img
                        src={`${API_BASE}/profile/photo`}
                        alt="Profile"
                        onError={e => {
                          e.target.style.display = "none";
                          e.target.parentNode.innerHTML = '<span style="font-size:1.5rem;font-weight:700;color:var(--accent)">SN</span>';
                        }}
                      />
                    </div>
                    <div>
                      <p className="adm-photo-name">Current Photo</p>
                      <p className="adm-photo-hint">Max 5MB · JPG, PNG, WEBP</p>
                    </div>
                  </div>

                  <label className="adm-dropzone">
                    <div className="adm-dropzone-icon">🖼️</div>
                    <p className="adm-dropzone-title">Click to upload new photo</p>
                    <p className="adm-dropzone-hint">JPG, PNG, WEBP accepted</p>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>
              </motion.div>
            )}

            {/* ══ SKILLS ══ */}
            {activeTab === "Skills" && (
              <motion.div key="skills"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}
                className="adm-tab-body">
                <div className="adm-list">
                  {skills.map((s, i) => (
                    <motion.div key={s._id}
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="adm-list-item">
                      <div className="adm-list-item-accent" />
                      <div className="adm-list-item-body">
                        <div className="adm-list-item-top">
                          <div>
                            <h3 className="adm-list-item-title">{s.category}</h3>
                            <div className="adm-list-chips" style={{ marginTop: 6 }}>
                              {s.skills?.map(sk => (
                                <span key={sk.name} className="adm-chip">{sk.name}</span>
                              ))}
                            </div>
                          </div>
                          <div className="adm-list-item-actions">
                            <button onClick={async () => { await deleteSkillCategory(s._id); loadData(); }}
                              className="adm-action-btn adm-action-delete">Delete</button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
