'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import Navbar      from './components/Navbar';
import Hero        from './components/Hero';
import Problem     from './components/Problem';
import HowItWorks  from './components/HowItWorks';
import SocialProof from './components/SocialProof';
import Features    from './components/Features';
import WaitlistCTA from './components/WaitlistCTA';
import Footer      from './components/Footer';
import AuthLoader  from './components/AuthLoader';

export default function HomePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/app');
      } else {
        setChecking(false);
      }
    });
  }, [router]);

  if (checking) return <AuthLoader />;

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
