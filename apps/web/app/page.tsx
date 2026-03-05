import Navbar     from './components/Navbar';
import Hero       from './components/Hero';
import Problem    from './components/Problem';
import HowItWorks from './components/HowItWorks';
import SocialProof from './components/SocialProof';
import Features   from './components/Features';
import WaitlistCTA from './components/WaitlistCTA';
import Footer     from './components/Footer';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <SocialProof />
        <Features />
        <WaitlistCTA />
      </main>
      <Footer />
    </>
  );
}
