import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Laugh, Briefcase, Layers, PartyPopper, UserRoundSearch } from 'lucide-react';

const navButtons = [
  { id: 'Me', label: 'Me', color: '#329696', icon: Laugh },
  { id: 'Projects', label: 'Projects', color: '#3E9858', icon: Briefcase },
  { id: 'Skills', label: 'Skills', color: '#856ED9', icon: Layers },
  { id: 'Fun', label: 'Fun', color: '#B95F9D', icon: PartyPopper },
  { id: 'Contact', label: 'Contact', color: '#C19433', icon: UserRoundSearch }
];

const Hero = ({ profile, onOpenChat }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onOpenChat(inputValue.trim());
      setInputValue('');
    }
  };

  const name = profile?.personal?.name || profile?.name || 'Atharva';
  const role = profile?.personal?.role || profile?.role || 'Software Engineer';
  const headline = profile?.personal?.headline || profile?.headline || `Hey, I'm ${name.split(' ')[0]} 👋`;
  const avatarSrc = profile?.personal?.avatar || profile?.avatar || '/assets/avatar.png';

  return (
    <section className="relative flex flex-col items-center justify-center w-full text-center select-none max-w-4xl mx-auto py-1 sm:py-2">

      {/* Title Area */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: -20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
        }}
        initial="hidden"
        animate="visible"
        className="z-10 mt-1 mb-1 sm:mb-2 flex flex-col items-center text-center"
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-black dark:text-white mb-2">
          {headline}
        </h2>
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {role}
        </h1>
      </motion.div>

      {/* Avatar Container: Smooth fade-in and zoom-in on landing */}
      <motion.div
        initial={{ opacity: 0, scale: 0.82 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.85, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mt-2 sm:mt-3 mb-4 sm:mb-6 h-48 w-48 sm:h-60 sm:w-60 md:h-72 md:w-72 flex items-center justify-center overflow-visible"
      >
        <img
          src={avatarSrc}
          alt={name}
          className="w-full h-full object-contain select-none"
        />
      </motion.div>

      {/* "Ask me anything…" Input with ultra-translucent frosted glass matching reference */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2, ease: "easeOut" } }
        }}
        initial="hidden"
        animate="visible"
        className="z-10 mt-2 sm:mt-3 w-full max-w-lg px-2 sm:px-4"
      >
        <form onSubmit={handleSubmit} className="relative w-full group">
          <div className="mx-auto flex items-center rounded-full border border-neutral-200/80 dark:border-neutral-700/80 bg-white/30 dark:bg-neutral-800/40 py-2.5 sm:py-3 pr-2.5 pl-6 backdrop-blur-lg transition-all duration-300 hover:border-neutral-300 dark:hover:border-neutral-600 hover:bg-white/40 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] focus-within:border-[#0171E3] focus-within:ring-4 focus-within:ring-[#0171E3]/20">
            <input
              type="text"
              placeholder="Ask me anything…"
              className="w-full border-none bg-transparent text-sm sm:text-base text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              aria-label="Submit question"
              className="flex items-center justify-center rounded-full bg-[#0171E3] p-2 sm:p-2.5 text-white transition-all hover:bg-blue-600 disabled:opacity-50 active:scale-95 flex-shrink-0 cursor-pointer shadow-sm"
            >
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </form>
      </motion.div>

      {/* 5 Quick Cards Grid directly below the input with 100% complete square visibility & translucent glass */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-3 sm:mt-4 grid w-full max-w-2xl grid-cols-5 gap-2 sm:gap-3.5 px-2 sm:px-4 z-10"
      >
        {navButtons.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onOpenChat && onOpenChat(item.id)}
              className="aspect-square w-full cursor-pointer rounded-2xl border border-neutral-200/80 dark:border-neutral-700/60 bg-white/30 dark:bg-white/5 backdrop-blur-lg hover:bg-white/50 dark:hover:bg-white/10 hover:border-neutral-300 dark:hover:border-neutral-500 active:scale-95 transition-all duration-300 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] group flex flex-col items-center justify-center p-2 sm:p-4"
            >
              <div className="flex h-full flex-col items-center justify-center gap-1 sm:gap-1.5 text-neutral-700 dark:text-neutral-200">
                <IconComponent
                  size={22}
                  stroke={item.color}
                  strokeWidth={2}
                  className="transition-transform duration-300 group-hover:scale-110"
                />
                <span className="text-[11px] sm:text-xs md:text-sm font-medium">
                  {item.label}
                </span>
              </div>
            </button>
          );
        })}
      </motion.div>

    </section>
  );
};

export default Hero;
