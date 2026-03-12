import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Skills from '../components/Skills';
import Projects from '../components/Projects';
import LeetcodeTracker from '../components/LeetcodeTracker';
import GithubTracker from '../components/GithubTracker';
import Contact from '../components/Contact';
import Chatbot from '../components/Chatbot';

export default function Home() {
  return (
    <div className="min-h-screen bg-navy animated-gradient">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <section id="stats">
          <LeetcodeTracker />
          <GithubTracker />
        </section>
        <Contact />
      </main>
      <Chatbot />
    </div>
  );
}
