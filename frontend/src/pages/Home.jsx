import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Skills from '../components/Skills';
import Projects from '../components/Projects';
import LeetcodeTracker from '../components/LeetcodeTracker';
import GfgTracker from '../components/GfgTracker';
import GithubTracker from '../components/GithubTracker';
import Contact from '../components/Contact';
import Chatbot from '../components/Chatbot';
import CommandPalette from '../components/CommandPalette';
import BackgroundEffects from '../components/BackgroundEffects';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-navy animated-gradient">
      <BackgroundEffects />
      <Navbar />
      <main>
        <Hero />
        <hr className="section-divider" />
        <About />
        <hr className="section-divider" />
        <Skills />
        <hr className="section-divider" />
        <Projects />
        <hr className="section-divider" />
        <section id="stats">
          <LeetcodeTracker />
          <hr className="section-divider" />
          <GfgTracker />
          <hr className="section-divider" />
          <GithubTracker />
        </section>
        <hr className="section-divider" />
        <Contact />
      </main>
      <Footer />
      <Chatbot />
      <CommandPalette />
    </div>
  );
}


