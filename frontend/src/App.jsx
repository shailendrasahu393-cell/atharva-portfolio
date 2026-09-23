import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { profile as initialProfile } from './data/profile';
import { fetchProfile } from './services/api';
import { initFluidSimulation } from './utils/fluidSimulation';

import Hero from './sections/Hero';
import AIChatInterface from './components/AIChatInterface';

function App() {
  const [profile, setProfile] = useState(initialProfile);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState('');
  const canvasRef = useRef(null);

  // Initialize interactive WebGL fluid background
  useEffect(() => {
    if (canvasRef.current) {
      const cleanup = initFluidSimulation(canvasRef.current);
      return cleanup;
    }
  }, []);

  // Sync profile data from backend if available
  useEffect(() => {
    fetchProfile()
      .then((data) => {
        if (data) setProfile(data);
      })
      .catch((err) => {
        console.warn('Using local profile data fallback:', err);
      });
  }, []);

  const openChatWithQuery = (query = '') => {
    setInitialQuery(query);
    setIsChatOpen(true);
  };

  const watermarkText = profile?.personal?.watermark || profile?.name?.split(' ')[0]?.toUpperCase() || "ATHARVA";

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center overflow-x-hidden overflow-y-auto selection:bg-[#0171E3]/20 selection:text-[#0171E3] pb-20 sm:pb-28">
      
      {/* Interactive WebGL Fluid Canvas Background */}
      <canvas
        ref={canvasRef}
        id="fluid"
        className="fixed inset-0 w-screen h-screen pointer-events-none z-0"
      />

      {/* Subtle Massive Watermark anchored behind hero at bottom matching reference */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center overflow-hidden z-0">
        <div
          className="hidden sm:block bg-gradient-to-b from-neutral-500/10 to-neutral-500/0 bg-clip-text text-[10rem] lg:text-[16rem] leading-none font-black text-transparent select-none uppercase tracking-wider"
          style={{ marginBottom: '-2.5rem' }}
        >
          {watermarkText}
        </div>
      </div>

      {/* Main Single Page Hero View with full card visibility & comfortable scrolling space */}
      <main className="relative z-10 w-full flex-1 flex flex-col items-center justify-center px-4 pt-16 sm:pt-14 pb-8 sm:pb-12">
        <Hero profile={profile} onOpenChat={openChatWithQuery} />
      </main>

      {/* AI Chat Interface Modal / Overlay */}
      <AnimatePresence>
        {isChatOpen && (
          <AIChatInterface
            onClose={() => setIsChatOpen(false)}
            initialQuery={initialQuery}
            profile={profile}
          />
        )}
      </AnimatePresence>

    </div>
  );
}

export default App;
