import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import Home from './pages/Home';
import Admin from './pages/Admin';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#112240',
              color: '#ccd6f6',
              border: '1px solid #233554',
              fontFamily: '"DM Sans", sans-serif',
            },
            success: { iconTheme: { primary: '#64ffda', secondary: '#0a192f' } },
          }}
        />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
