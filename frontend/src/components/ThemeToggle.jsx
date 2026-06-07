import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      style={{
        width: "44px",
        height: "24px",
        borderRadius: "12px",
        border: `2px solid ${isDark ? "#64ffda" : "#0d9488"}`,
        background: isDark ? "rgba(100,255,218,0.1)" : "rgba(13,148,136,0.15)",
        cursor: "pointer",
        position: "relative",
        display: "flex",
        alignItems: "center",
        padding: "2px",
        transition: "all 0.3s ease",
        flexShrink: 0,
      }}
    >
      {/* Track icons */}
      <span
        style={{
          position: "absolute",
          left: "4px",
          fontSize: "10px",
          opacity: isDark ? 0.4 : 0,
          transition: "opacity 0.3s",
        }}
      >
        🌙
      </span>
      <span
        style={{
          position: "absolute",
          right: "4px",
          fontSize: "10px",
          opacity: isDark ? 0 : 0.8,
          transition: "opacity 0.3s",
        }}
      >
        ☀️
      </span>

      {/* Thumb */}
      <motion.div
        animate={{ x: isDark ? 0 : 20 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        style={{
          width: "16px",
          height: "16px",
          borderRadius: "50%",
          background: isDark ? "#64ffda" : "#0d9488",
          flexShrink: 0,
          zIndex: 1,
        }}
      />
    </motion.button>
  );
}
