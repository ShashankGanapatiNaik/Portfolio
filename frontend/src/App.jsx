import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./context/ThemeContext";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import ResumeApprove from "./pages/ResumeApprove";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--bg-secondary)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              fontFamily: '"DM Sans", sans-serif',
            },
            success: {
              iconTheme: {
                primary: "var(--accent)",
                secondary: "var(--bg-primary)",
              },
            },
          }}
        />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/resume/approve/:token" element={<ResumeApprove />} />
          <Route path="/resume/reject/:token" element={<ResumeApprove />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
