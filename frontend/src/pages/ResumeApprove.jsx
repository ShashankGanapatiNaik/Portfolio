import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import api from "../services/api";

export default function ResumeApprove() {
  const { token } = useParams();
  const location = useLocation();
  // Detect action from the URL path: /resume/reject/:token or /resume/approve/:token
  const action = location.pathname.includes("/reject/") ? "reject" : "approve";

  const [status, setStatus] = useState("loading"); // loading | approved | rejected | error | expired | already_done
  const [data, setData] = useState(null);

  useEffect(() => {
    const run = async () => {
      try {
        const endpoint =
          action === "reject"
            ? `/resume/reject/${token}`
            : `/resume/approve/${token}`;

        const res = await api.get(endpoint);
        // Backend returns JSON for these actions now
        setData(res.data);
        setStatus(action === "reject" ? "rejected" : "approved");
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Unknown error";

        if (err.response?.status === 410 || msg.toLowerCase().includes("expired")) {
          setStatus("expired");
        } else if (msg.toLowerCase().includes("already")) {
          setStatus("already_done");
        } else {
          setStatus("error");
        }
        setData({ error: msg });
      }
    };
    run();
  }, [token, action]);

  const config = {
    loading: {
      icon: "⏳",
      title: "Processing...",
      color: "#64ffda",
      msg: "Please wait while we process your request.",
    },
    approved: {
      icon: "✅",
      title: "Resume Approved!",
      color: "#64ffda",
      msg: data?.emailSent
        ? `Download link has been sent to ${data?.email}.`
        : `Approval recorded. ${data?.emailError ? "Email delivery failed — share the link manually." : ""}`,
    },
    rejected: {
      icon: "❌",
      title: "Request Rejected",
      color: "#ff6b6b",
      msg: `The resume request has been rejected.`,
    },
    expired: {
      icon: "⏰",
      title: "Link Expired",
      color: "#ffa116",
      msg: "This approval link has expired (24h limit). Ask the visitor to submit a new request.",
    },
    already_done: {
      icon: "ℹ️",
      title: "Already Processed",
      color: "#8892b0",
      msg: "This request has already been approved or rejected.",
    },
    error: {
      icon: "⚠️",
      title: "Something Went Wrong",
      color: "#ff6b6b",
      msg: data?.error || "An unexpected error occurred.",
    },
  };

  const c = config[status] || config.error;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a192f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial, sans-serif",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          background: "#112240",
          border: "1px solid #233554",
          borderRadius: "16px",
          padding: "48px 40px",
          maxWidth: "520px",
          width: "100%",
          textAlign: "center",
        }}
      >
        {/* Spinner while loading */}
        {status === "loading" ? (
          <div
            style={{
              width: "56px",
              height: "56px",
              border: "4px solid #233554",
              borderTop: "4px solid #64ffda",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 24px",
            }}
          />
        ) : (
          <div style={{ fontSize: "56px", marginBottom: "16px" }}>{c.icon}</div>
        )}

        <h1 style={{ color: c.color, margin: "0 0 12px", fontSize: "24px" }}>
          {c.title}
        </h1>
        <p style={{ color: "#8892b0", lineHeight: "1.7", margin: "0 0 24px" }}>
          {c.msg}
        </p>

        {/* Show download link if available and email failed */}
        {status === "approved" && data?.downloadUrl && !data?.emailSent && (
          <div
            style={{
              background: "#0a192f",
              border: "1px solid #64ffda33",
              borderRadius: "8px",
              padding: "14px",
              marginBottom: "24px",
              wordBreak: "break-all",
              fontSize: "12px",
              color: "#64ffda",
              textAlign: "left",
            }}
          >
            {data.downloadUrl}
          </div>
        )}

        {status === "approved" && data?.downloadUrl && !data?.emailSent && (
          <a
            href={data.downloadUrl}
            style={{
              display: "inline-block",
              padding: "12px 28px",
              background: "#64ffda",
              color: "#0a192f",
              textDecoration: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              fontSize: "14px",
              marginBottom: "24px",
            }}
          >
            📄 Download Resume
          </a>
        )}

        <br />
        <a
          href="/"
          style={{
            color: "#64ffda",
            fontSize: "13px",
            textDecoration: "none",
          }}
        >
          ← Back to Portfolio
        </a>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
