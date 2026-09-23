import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUp,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  MoreHorizontal,
  Info,
  Laugh,
  Briefcase,
  Layers,
  PartyPopper,
  UserRoundSearch,
  Mail,
  Phone,
  X
} from 'lucide-react';
import { streamChat } from '../services/api';
import RichChatMessage from './RichChatMessage';

const GithubIcon = ({ size = 14, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ size = 14, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const topicQueries = {
  Me: "Who is Atharva Gupta? Tell me about your background, career objective, and education at Allenhouse Institute of Technology.",
  Projects: "Tell me about the Surplus Food Recovery Network project and what technologies you used to build it.",
  Skills: "What are your core programming languages, web technologies, and developer tools?",
  Fun: "Tell me about your achievement in CodeFuse 2025 and your creative hobbies outside coding.",
  Contact: "How can I contact Atharva Gupta? Please share his email, phone number, and social links."
};

const quickCategories = [
  { key: "Me", color: "#329696", icon: Laugh, label: "Me" },
  { key: "Projects", color: "#3E9858", icon: Briefcase, label: "Projects" },
  { key: "Skills", color: "#856ED9", icon: Layers, label: "Skills" },
  { key: "Fun", color: "#B95F9D", icon: PartyPopper, label: "Fun" },
  { key: "Contact", color: "#C19433", icon: UserRoundSearch, label: "Contact" }
];

const allCategorizedQuestions = [
  {
    category: "About Atharva",
    icon: Laugh,
    questions: [
      "Who is Atharva Gupta? Tell me about your background.",
      "What are you pursuing at Allenhouse Institute of Technology?",
      "What is your career objective in software development?"
    ]
  },
  {
    category: "Projects",
    icon: Briefcase,
    questions: [
      "Tell me about the Surplus Food Recovery Network platform.",
      "What tech stack did you use for the Surplus Food Recovery Network?",
      "How do the role-based workflows work for donors and NGOs?"
    ]
  },
  {
    category: "Skills & Tech",
    icon: Layers,
    questions: [
      "What programming languages and web technologies do you know?",
      "What is your experience with React.js, JavaScript, and Python?",
      "What tools and platforms do you use for deployment?"
    ]
  },
  {
    category: "Achievements & Fun",
    icon: PartyPopper,
    questions: [
      "Tell me about qualifying for the CodeFuse 2025 Offline Grand Finale.",
      "What are your creative hobbies outside coding?",
      "Tell me about your video editing and photography skills."
    ]
  },
  {
    category: "Contact & Hiring",
    icon: UserRoundSearch,
    questions: [
      "How can I contact Atharva Gupta?",
      "What are your email address, phone, and LinkedIn?",
      "Are you available for full-stack developer opportunities or internships?"
    ]
  }
];

const AIChatInterface = ({ onClose, initialQuery = '', profile }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [activeTopic, setActiveTopic] = useState('Projects');

  const messagesEndRef = useRef(null);
  const hasInitializedRef = useRef(false);

  const avatarSrc = profile?.personal?.avatar || profile?.avatar || '/assets/avatar.png';
  const name = profile?.personal?.name || profile?.name || 'Atharva Gupta';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = useCallback(async (text) => {
    if (!text.trim()) return;

    const t = text.trim();
    const userMessage = { role: 'user', content: t };
    const botPlaceholder = { role: 'assistant', content: '' };

    setMessages((prev) => [...prev, userMessage, botPlaceholder]);
    setInput('');
    setIsLoading(true);

    try {
      await streamChat(t, messages, (chunk) => {
        setIsLoading(false);
        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (updated[lastIdx] && updated[lastIdx].role === 'assistant') {
            updated[lastIdx] = {
              ...updated[lastIdx],
              content: updated[lastIdx].content + chunk,
            };
          }
          return updated;
        });
      });
    } catch (err) {
      console.error(err);
      setMessages((prev) => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (updated[lastIdx] && updated[lastIdx].role === 'assistant') {
          updated[lastIdx] = {
            ...updated[lastIdx],
            content: "I'm having trouble connecting right now. You can reach Atharva directly at gatharva264@gmail.com or 9453036904!",
          };
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const handleTopicClick = (topicKey) => {
    setActiveTopic(topicKey);
    const query = topicQueries[topicKey] || `Tell me about ${topicKey}.`;
    handleSend(query);
  };

  useEffect(() => {
    if (initialQuery && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      const qLower = initialQuery.toLowerCase();
      let queryToSend = initialQuery;

      if (qLower === 'projects') queryToSend = topicQueries.Projects;
      else if (qLower === 'me') queryToSend = topicQueries.Me;
      else if (qLower === 'skills') queryToSend = topicQueries.Skills;
      else if (qLower === 'fun') queryToSend = topicQueries.Fun;
      else if (qLower === 'contact') queryToSend = topicQueries.Contact;

      setTimeout(() => {
        handleSend(queryToSend);
      }, 100);
    }
  }, [initialQuery, handleSend]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-[#0E0E10] overflow-hidden"
    >
      {/* Top Header Bar */}
      <div className="w-full px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-neutral-200/60 dark:border-neutral-800/60 flex-shrink-0 z-20">
        
        {/* Top-Left: Back Button */}
        <button
          onClick={onClose}
          aria-label="Back to home"
          className="flex items-center gap-1.5 rounded-full bg-white/60 dark:bg-neutral-900/60 px-3.5 py-1.5 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all text-xs font-medium text-neutral-800 dark:text-neutral-200 shadow-2xs active:scale-95 cursor-pointer"
        >
          <ChevronLeft size={14} className="text-neutral-500" />
          <span>Back</span>
        </button>

        {/* Center: Small round avatar */}
        <div className="flex items-center justify-center cursor-pointer" onClick={onClose}>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 p-0.5">
            <img src={avatarSrc} alt={name} className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Right: Info (i) icon */}
        <button
          onClick={() => setIsInfoOpen(true)}
          aria-label="About AI Assistant"
          className="w-8 h-8 rounded-full border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors cursor-pointer"
        >
          <Info size={16} />
        </button>
      </div>

      {/* Main Chat Conversation Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 flex flex-col items-center custom-scrollbar">
        
        {/* Welcome Empty State (Visible only before any messages) */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl my-auto flex flex-col items-center text-center px-4 py-8"
          >
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-neutral-200 dark:border-neutral-700 p-1 mb-4 shadow-md bg-white dark:bg-neutral-900">
              <img src={avatarSrc} alt={name} className="w-full h-full object-contain" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mb-2">
              Chat with Atharva
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-md mb-6 leading-relaxed">
              Ask me anything directly about my background, B.Tech at Allenhouse, Surplus Food Recovery Network project, technical skills, or how to connect!
            </p>

            {/* Quick Starter Question Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg">
              <button
                onClick={() => handleTopicClick('Projects')}
                className="p-3.5 text-left rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-all text-xs sm:text-sm font-medium text-neutral-800 dark:text-neutral-200"
              >
                🍲 Surplus Food Recovery Network
              </button>
              <button
                onClick={() => handleTopicClick('Skills')}
                className="p-3.5 text-left rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-all text-xs sm:text-sm font-medium text-neutral-800 dark:text-neutral-200"
              >
                💻 Skills in React, Python & DSA
              </button>
              <button
                onClick={() => handleTopicClick('Fun')}
                className="p-3.5 text-left rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-all text-xs sm:text-sm font-medium text-neutral-800 dark:text-neutral-200"
              >
                🏆 CodeFuse 2025 Grand Finale
              </button>
              <button
                onClick={() => handleTopicClick('Contact')}
                className="p-3.5 text-left rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-all text-xs sm:text-sm font-medium text-neutral-800 dark:text-neutral-200"
              >
                📬 How to Contact Atharva
              </button>
            </div>
          </motion.div>
        )}

        {/* Live Conversation Message Bubbles */}
        {messages.length > 0 && (
          <div className="w-full max-w-3xl space-y-5 px-2">
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              if (isUser) {
                return (
                  <div key={idx} className="flex justify-end w-full">
                    <div className="max-w-[85%] sm:max-w-[75%] px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl rounded-tr-xs bg-[#0171E3] text-white text-sm sm:text-[15px] font-normal leading-relaxed shadow-sm">
                      {msg.content}
                    </div>
                  </div>
                );
              }

              return (
                <div key={idx} className="flex justify-start w-full">
                  <RichChatMessage
                    content={msg.content}
                    isStreaming={isLoading && idx === messages.length - 1}
                    onSuggestionClick={(query) => handleSend(query)}
                    avatarSrc={avatarSrc}
                    name={name}
                  />
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}

      </div>

      {/* Bottom Interactive Area */}
      <div className="border-t border-neutral-200/70 dark:border-neutral-800/70 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl px-4 py-3 sm:py-4 flex-shrink-0 z-20">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-2.5">
          
          {/* "v Hide/Show quick questions" Toggle Button */}
          <button
            onClick={() => setShowQuickQuestions(!showQuickQuestions)}
            className="flex items-center gap-1 text-[11px] sm:text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 transition-colors cursor-pointer"
          >
            {showQuickQuestions ? (
              <>
                <ChevronDown size={14} />
                <span>Hide quick questions</span>
              </>
            ) : (
              <>
                <ChevronUp size={14} />
                <span>Show quick questions</span>
              </>
            )}
          </button>

          {/* Quick Categories Pills Row */}
          {showQuickQuestions && (
            <div className="w-full flex items-center justify-between gap-1.5 sm:gap-2 overflow-x-auto py-1 custom-scrollbar">
              {quickCategories.map((cat) => {
                const IconComp = cat.icon;
                const isActive = activeTopic === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => handleTopicClick(cat.key)}
                    className={`flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border transition-all text-xs font-medium flex-shrink-0 cursor-pointer ${
                      isActive
                        ? 'border-neutral-400 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <IconComp size={14} color={cat.color} strokeWidth={2.2} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}

              {/* "..." More Button (Opens Categorized Questions Drawer) */}
              <button
                onClick={() => setIsDrawerOpen(true)}
                aria-label="More question categories"
                className="flex items-center justify-center w-8 h-8 rounded-full border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-500 transition-colors flex-shrink-0 cursor-pointer"
              >
                <MoreHorizontal size={14} />
              </button>
            </div>
          )}

          {/* Main "Ask me anything…" Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="w-full flex items-center rounded-full border border-neutral-300/80 dark:border-neutral-700/80 bg-neutral-50 dark:bg-neutral-800/80 px-4 py-2 sm:py-2.5 transition-all shadow-xs focus-within:border-[#0171E3] focus-within:ring-2 focus-within:ring-[#0171E3]/20"
          >
            <input
              type="text"
              placeholder="Ask me anything…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full border-none bg-transparent text-sm sm:text-base text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
              className="flex items-center justify-center rounded-full bg-[#0171E3] p-2 text-white hover:bg-blue-600 disabled:opacity-40 transition-all flex-shrink-0 cursor-pointer active:scale-95"
            >
              <ArrowUp size={18} />
            </button>
          </form>

        </div>
      </div>

      {/* Categorized Questions Drawer / Modal */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-h-[85vh] bg-white dark:bg-neutral-900 rounded-t-3xl border-t border-neutral-200 dark:border-neutral-800 p-6 flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Suggested Questions
                </h3>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="overflow-y-auto py-4 space-y-6 custom-scrollbar">
                {allCategorizedQuestions.map((cat, idx) => {
                  const IconC = cat.icon;
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
                        <IconC size={14} />
                        <span>{cat.category}</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {cat.questions.map((q, qIdx) => (
                          <button
                            key={qIdx}
                            onClick={() => {
                              setIsDrawerOpen(false);
                              handleSend(q);
                            }}
                            className="p-3 text-left rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm text-neutral-800 dark:text-neutral-200 transition-colors"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Info Modal */}
      <AnimatePresence>
        {isInfoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setIsInfoOpen(false)}
                className="absolute top-5 right-5 p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-700 p-0.5">
                  <img src={avatarSrc} alt={name} className="w-full h-full object-contain" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-neutral-900 dark:text-white">
                    {name}
                  </h4>
                  <p className="text-xs text-neutral-500">
                    {profile?.personal?.role || "Full-Stack Developer"}
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                <p>
                  This AI portfolio is built to answer questions in real-time using verified data from Atharva Gupta's resume and education at Allenhouse Institute of Technology.
                </p>
                <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <Mail size={13} className="text-[#0171E3]" />
                    <span className="text-neutral-800 dark:text-neutral-200">gatharva264@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-[#0171E3]" />
                    <span className="text-neutral-800 dark:text-neutral-200">+91 9453036904</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GithubIcon size={13} className="text-[#0171E3]" />
                    <a href="https://github.com/gatharva264-eng" target="_blank" rel="noopener noreferrer" className="text-[#0171E3] hover:underline">github.com/gatharva264-eng</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <LinkedinIcon size={13} className="text-[#0171E3]" />
                    <a href="https://linkedin.com/in/atharvagupta-" target="_blank" rel="noopener noreferrer" className="text-[#0171E3] hover:underline">linkedin.com/in/atharvagupta-</a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default AIChatInterface;
