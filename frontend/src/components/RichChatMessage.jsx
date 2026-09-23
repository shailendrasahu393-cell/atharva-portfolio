import React, { useState, useMemo } from 'react';
import {
  Copy,
  Check,
  ExternalLink,
  Mail,
  Phone,
  Sparkles,
  BadgeCheck,
  ChevronRight,
  Terminal
} from 'lucide-react';

const GithubIcon = ({ size = 13, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ size = 13, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

// Map of recognized technologies for interactive tech badges
const techBadgeStyles = {
  'react.js': 'bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/30',
  'react': 'bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/30',
  'javascript': 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
  'javascript (es6+)': 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
  'python': 'bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/30',
  'firebase': 'bg-orange-500/10 text-orange-600 dark:text-orange-300 border-orange-500/30',
  'c++': 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/30',
  'c': 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/30',
  'dsa': 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/30',
  'data structures and algorithms (dsa)': 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/30',
  'data structures & algorithms (dsa)': 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/30',
  'git': 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/30',
  'github': 'bg-neutral-500/10 text-neutral-800 dark:text-neutral-200 border-neutral-500/30',
  'netlify': 'bg-teal-500/10 text-teal-600 dark:text-teal-300 border-teal-500/30',
  'render': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
  'html5': 'bg-red-500/10 text-red-600 dark:text-red-300 border-red-500/30',
  'css3': 'bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/30',
  'vs code': 'bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/30',
  'rest apis': 'bg-violet-500/10 text-violet-600 dark:text-violet-300 border-violet-500/30',
};

// Parses inline markdown: **bold / tech pills**, `code`, links, emails, phone numbers, urls
const renderInlineContent = (text) => {
  if (!text) return null;

  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|https?:\/\/[^\s)]+|[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}|(?:\+91[\s-]?)?[6-9]\d{9})/g;
  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (!part) return null;

    // Bold text **word**
    if (part.startsWith('**') && part.endsWith('**')) {
      const cleanWord = part.slice(2, -2).trim();
      const lower = cleanWord.toLowerCase();

      // Check if it matches a known technology for interactive pill styling
      if (techBadgeStyles[lower]) {
        return (
          <span
            key={i}
            className={`inline-flex items-center gap-1 mx-0.5 px-2 py-0.5 rounded-full text-xs font-medium border transition-transform hover:scale-105 select-none ${techBadgeStyles[lower]}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
            <span>{cleanWord}</span>
          </span>
        );
      }

      return (
        <strong key={i} className="font-semibold text-neutral-900 dark:text-neutral-100">
          {cleanWord}
        </strong>
      );
    }

    // Inline Code `code`
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="mx-0.5 px-1.5 py-0.5 rounded-md text-xs font-mono font-medium bg-neutral-100 dark:bg-neutral-800 text-[#0171E3] dark:text-blue-400 border border-neutral-200/80 dark:border-neutral-700/80"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Markdown link [Title](url)
    const mdLinkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (mdLinkMatch) {
      const title = mdLinkMatch[1];
      const url = mdLinkMatch[2];
      const isEmail = url.startsWith('mailto:');
      const isTel = url.startsWith('tel:');
      const isGithub = url.includes('github.com');
      const isLinkedin = url.includes('linkedin.com');

      return (
        <a
          key={i}
          href={url}
          target={isEmail || isTel ? undefined : "_blank"}
          rel={isEmail || isTel ? undefined : "noopener noreferrer"}
          className="inline-flex items-center gap-1 font-medium text-[#0171E3] dark:text-blue-400 hover:underline cursor-pointer"
        >
          {isEmail ? <Mail size={12} /> : isTel ? <Phone size={12} /> : isGithub ? <GithubIcon size={12} /> : isLinkedin ? <LinkedinIcon size={12} /> : null}
          <span>{title}</span>
          {!isEmail && !isTel && <ExternalLink size={10} className="opacity-70" />}
        </a>
      );
    }

    // Direct Email
    if (/^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(part)) {
      return (
        <a
          key={i}
          href={`mailto:${part}`}
          className="inline-flex items-center gap-1 font-medium text-[#0171E3] dark:text-blue-400 hover:underline"
        >
          <Mail size={12} className="inline opacity-80" />
          <span>{part}</span>
        </a>
      );
    }

    // Direct Phone (+91 Indian mobile)
    if (/^(?:\+91[\s-]?)?[6-9]\d{9}$/.test(part.trim())) {
      const cleanNum = part.replace(/\D/g, '');
      return (
        <a
          key={i}
          href={`tel:+91${cleanNum.slice(-10)}`}
          className="inline-flex items-center gap-1 font-medium text-[#0171E3] dark:text-blue-400 hover:underline"
        >
          <Phone size={12} className="inline opacity-80" />
          <span>{part}</span>
        </a>
      );
    }

    // Raw URL
    if (part.startsWith('http://') || part.startsWith('https://')) {
      const isGithub = part.includes('github.com');
      const isLinkedin = part.includes('linkedin.com');
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-[#0171E3] dark:text-blue-400 hover:underline break-all"
        >
          {isGithub ? <GithubIcon size={12} /> : isLinkedin ? <LinkedinIcon size={12} /> : <ExternalLink size={11} />}
          <span>{part.replace(/^https?:\/\/(www\.)?/, '')}</span>
        </a>
      );
    }

    return <span key={i}>{part}</span>;
  });
};

// Generates dynamic follow-up chips based on topic and language
const getSmartSuggestions = (content) => {
  const c = (content || '').toLowerCase();
  const suggestions = [];

  const isHindi = /(namaste|hai|hain|kya|kaise|kahan|padhai|karta|karte|batao|bataiye|shukriya|karo|banao|ke baare|ke bare)/i.test(c);

  if (c.includes('food') || c.includes('surplus') || c.includes('recovery')) {
    if (isHindi) {
      suggestions.push({ label: 'Tech Stack kya hai?', query: 'Surplus Food Recovery Network ka complete tech stack kya hai?' });
      suggestions.push({ label: 'Donors & NGOs workflows?', query: 'Surplus Food Recovery Network me donors aur NGOs ke workflows kaise kaam karte hain?' });
    } else {
      suggestions.push({ label: 'Tech Stack & Architecture', query: 'What is the full technical architecture of Surplus Food Recovery Network?' });
      suggestions.push({ label: 'Role-based workflows?', query: 'How do role-based dashboards work for donors and NGOs in Food Recovery?' });
    }
  } else if (c.includes('skill') || c.includes('react') || c.includes('python') || c.includes('dsa')) {
    if (isHindi) {
      suggestions.push({ label: 'Flagship Project dekhna hai', query: 'Atharva ke flagship project Surplus Food Recovery Network ke baare me batao.' });
      suggestions.push({ label: 'DSA & C++ experience?', query: 'Atharva ka C/C++ aur Data Structures & Algorithms me kya experience hai?' });
    } else {
      suggestions.push({ label: 'Surplus Food Recovery Project', query: 'Tell me about Atharva’s flagship project Surplus Food Recovery Network.' });
      suggestions.push({ label: 'DSA & C++ Problem Solving', query: 'What is your background in C/C++ and Data Structures & Algorithms?' });
    }
  } else if (c.includes('contact') || c.includes('email') || c.includes('phone') || c.includes('sampark') || c.includes('hire')) {
    if (isHindi) {
      suggestions.push({ label: 'Internships ke liye available?', query: 'Kya Atharva full-stack developer internships ya roles ke liye available hai?' });
      suggestions.push({ label: 'GitHub projects dekhna hai', query: 'Atharva ke GitHub par aur kaun se projects hain?' });
    } else {
      suggestions.push({ label: 'Available for Internships?', query: 'Are you available for full-stack developer internships or roles?' });
      suggestions.push({ label: 'View GitHub Projects', query: 'What other projects are on Atharva’s GitHub profile?' });
    }
  } else if (c.includes('allenhouse') || c.includes('education') || c.includes('college') || c.includes('b.tech')) {
    if (isHindi) {
      suggestions.push({ label: 'Core Technical Skills', query: 'Atharva ki core programming languages aur web skills kya hain?' });
      suggestions.push({ label: 'CodeFuse 2025 Achievement', query: 'CodeFuse 2025 Offline Grand Finale me Atharva ne kya achieve kiya?' });
    } else {
      suggestions.push({ label: 'Core Technical Skills', query: 'What are your core programming languages and web technologies?' });
      suggestions.push({ label: 'CodeFuse 2025 Grand Finale', query: 'Tell me about qualifying for the CodeFuse 2025 Offline Grand Finale!' });
    }
  } else {
    if (isHindi) {
      suggestions.push({ label: 'Surplus Food Recovery Project', query: 'Surplus Food Recovery Network project ke baare me batao.' });
      suggestions.push({ label: 'Core Skills & Tools', query: 'Atharva ke technical skills aur developer tools kya hain?' });
    } else {
      suggestions.push({ label: 'Surplus Food Recovery Network', query: 'Tell me about the Surplus Food Recovery Network project.' });
      suggestions.push({ label: 'Core Skills & Tech Stack', query: 'What are your core technical skills and tools?' });
    }
  }

  return suggestions.slice(0, 2);
};

export const RichChatMessage = ({
  content,
  isStreaming = false,
  onSuggestionClick,
  avatarSrc = '/assets/avatar.png',
  name = 'Atharva Gupta'
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const cleanText = (content || '')
      .replace(/###?\s+/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    navigator.clipboard.writeText(cleanText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Detect context-aware action buttons
  const detectedContacts = useMemo(() => {
    if (!content) return [];
    const list = [];
    const c = content.toLowerCase();

    if (c.includes('gatharva264@gmail.com') || c.includes('email') || c.includes('contact') || c.includes('reach out') || c.includes('sampark')) {
      list.push({
        type: 'email',
        label: 'Email Atharva',
        href: 'mailto:gatharva264@gmail.com',
        icon: Mail,
        className: 'border-blue-200 dark:border-blue-800/80 bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50'
      });
    }

    if (c.includes('9453036904') || c.includes('phone') || c.includes('whatsapp') || c.includes('contact') || c.includes('sampark')) {
      list.push({
        type: 'whatsapp',
        label: 'WhatsApp / Call',
        href: 'https://wa.me/919453036904',
        icon: Phone,
        className: 'border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
      });
    }

    if (c.includes('surplus') || c.includes('food recovery') || c.includes('github') || c.includes('repo')) {
      list.push({
        type: 'github',
        label: 'GitHub Repo',
        href: 'https://github.com/gatharva264-eng',
        icon: GithubIcon,
        className: 'border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700'
      });
    }

    if (c.includes('linkedin') || c.includes('internship') || c.includes('hire') || c.includes('connect')) {
      list.push({
        type: 'linkedin',
        label: 'LinkedIn',
        href: 'https://linkedin.com/in/atharvagupta-',
        icon: LinkedinIcon,
        className: 'border-sky-200 dark:border-sky-800/80 bg-sky-50/80 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/50'
      });
    }

    return list.slice(0, 4);
  }, [content]);

  // Parse structured blocks: headings, lists, paragraphs, code blocks
  const parsedBlocks = useMemo(() => {
    if (!content) return [];

    const lines = content.split('\n');
    const blocks = [];
    let currentList = [];

    const flushList = () => {
      if (currentList.length > 0) {
        blocks.push({ type: 'list', items: [...currentList] });
        currentList = [];
      }
    };

    let inCodeBlock = false;
    let codeBuffer = [];
    let codeLanguage = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Handle Code Blocks ```lang
      if (trimmed.startsWith('```')) {
        if (inCodeBlock) {
          blocks.push({
            type: 'code',
            language: codeLanguage,
            code: codeBuffer.join('\n')
          });
          codeBuffer = [];
          codeLanguage = '';
          inCodeBlock = false;
        } else {
          flushList();
          inCodeBlock = true;
          codeLanguage = trimmed.slice(3).trim() || 'javascript';
        }
        continue;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        continue;
      }

      // Empty line
      if (!trimmed) {
        flushList();
        continue;
      }

      // Markdown Headings
      if (trimmed.startsWith('### ') || trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
        flushList();
        const level = trimmed.startsWith('### ') ? 3 : trimmed.startsWith('## ') ? 2 : 1;
        const text = trimmed.replace(/^#{1,3}\s+/, '');
        blocks.push({ type: 'heading', level, text });
        continue;
      }

      // Bullet List items: starts with * , - , or 1.
      const bulletMatch = trimmed.match(/^(\*|-|\d+\.)\s+(.+)$/);
      if (bulletMatch) {
        const rawItem = bulletMatch[2];

        // Format: **Title:** Description
        const titledMatch = rawItem.match(/^\*\*([^*]+)\*\*[:\s]*(.*)$/);
        if (titledMatch) {
          currentList.push({
            hasTitle: true,
            title: titledMatch[1].trim(),
            description: titledMatch[2].trim()
          });
        } else {
          currentList.push({
            hasTitle: false,
            content: rawItem
          });
        }
        continue;
      }

      // Regular conversational paragraph
      flushList();
      blocks.push({ type: 'paragraph', text: trimmed });
    }

    // Flush any leftover
    flushList();
    if (inCodeBlock && codeBuffer.length > 0) {
      blocks.push({
        type: 'code',
        language: codeLanguage,
        code: codeBuffer.join('\n')
      });
    }

    return blocks;
  }, [content]);

  const suggestions = useMemo(() => {
    if (isStreaming || !content || content.length < 30) return [];
    return getSmartSuggestions(content);
  }, [content, isStreaming]);

  return (
    <div className="w-full max-w-2xl bg-white/95 dark:bg-[#131416]/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.25)] overflow-hidden transition-all text-neutral-900 dark:text-neutral-100">
      
      {/* Top Header: Identity, Online Pulse & Copy Button */}
      <div className="px-4 sm:px-5 py-2.5 sm:py-3 border-b border-neutral-100 dark:border-neutral-800/70 bg-neutral-50/70 dark:bg-neutral-900/50 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative w-6 h-6 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-white">
            <img src={avatarSrc} alt={name} className="w-full h-full object-contain" />
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-neutral-900" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs sm:text-[13px] font-semibold text-neutral-900 dark:text-neutral-100">
              {name || "Atharva Gupta"}
            </span>
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
              <BadgeCheck size={11} className="text-emerald-600 dark:text-emerald-400" />
              <span>Verified</span>
            </span>
          </div>
        </div>

        {/* Copy Button */}
        {content && (
          <button
            onClick={handleCopy}
            aria-label="Copy reply"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-all cursor-pointer"
            title="Copy message"
          >
            {copied ? (
              <>
                <Check size={12} className="text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span className="text-[11px] hidden sm:inline">Copy</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Message Body Content with Rich Interactive Components */}
      <div className="p-4 sm:p-5 space-y-3.5 text-[14px] sm:text-[15px] leading-relaxed text-neutral-800 dark:text-neutral-200">
        
        {/* Thinking State */}
        {!content && isStreaming && (
          <div className="flex items-center gap-2.5 py-3 text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#0171E3] animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 rounded-full bg-[#0171E3] animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 rounded-full bg-[#0171E3] animate-bounce" />
            </div>
            <span className="font-medium text-neutral-600 dark:text-neutral-300">Atharva is typing…</span>
          </div>
        )}

        {/* Render Structured Blocks */}
        {parsedBlocks.map((block, idx) => {
          if (block.type === 'heading') {
            return (
              <div key={idx} className="pt-2 pb-0.5">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-100/90 dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700/60 text-neutral-900 dark:text-neutral-100 font-bold text-xs sm:text-sm tracking-wide shadow-2xs">
                  <Sparkles size={13} className="text-[#0171E3] dark:text-blue-400 flex-shrink-0" />
                  <span>{block.text}</span>
                </div>
              </div>
            );
          }

          if (block.type === 'list') {
            return (
              <div key={idx} className="grid grid-cols-1 gap-2 pt-1">
                {block.items.map((item, itemIdx) => {
                  if (item.hasTitle) {
                    return (
                      <div
                        key={itemIdx}
                        className="group flex items-start gap-3 p-3 rounded-xl border border-neutral-200/70 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50 hover:bg-white dark:hover:bg-neutral-800/80 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-xs transition-all"
                      >
                        <div className="w-2 h-2 rounded-full bg-[#0171E3] dark:bg-blue-400 mt-2 flex-shrink-0 group-hover:scale-125 transition-transform" />
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm mr-1.5">
                            {item.title}:
                          </span>
                          <span className="text-neutral-600 dark:text-neutral-300 text-xs sm:text-sm leading-relaxed">
                            {renderInlineContent(item.description)}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={itemIdx}
                      className="flex items-start gap-2.5 px-2 py-1 text-neutral-700 dark:text-neutral-300 text-xs sm:text-sm"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500 mt-2 flex-shrink-0" />
                      <div className="flex-1 leading-relaxed">
                        {renderInlineContent(item.content)}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          }

          if (block.type === 'code') {
            return (
              <div key={idx} className="rounded-xl overflow-hidden border border-neutral-800 bg-[#0d1117] text-neutral-100 font-mono text-xs my-2">
                <div className="px-3 py-1.5 bg-[#161b22] border-b border-neutral-800 flex items-center justify-between text-neutral-400 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <Terminal size={12} />
                    <span>{block.language || 'code'}</span>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(block.code)}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
                <pre className="p-3.5 overflow-x-auto text-[12px] leading-relaxed custom-scrollbar">
                  <code>{block.code}</code>
                </pre>
              </div>
            );
          }

          return (
            <p key={idx} className="leading-relaxed">
              {renderInlineContent(block.text)}
            </p>
          );
        })}

        {/* Live typing cursor during response generation */}
        {isStreaming && content && (
          <span className="inline-block w-2 h-4 bg-[#0171E3] animate-pulse rounded-xs align-middle ml-1" />
        )}
      </div>

      {/* Interactive Contact / Action Buttons Bar */}
      {detectedContacts.length > 0 && !isStreaming && (
        <div className="px-4 sm:px-5 py-3 border-t border-neutral-100 dark:border-neutral-800/70 bg-neutral-50/50 dark:bg-neutral-900/30 flex flex-wrap items-center gap-2">
          <span className="text-[10px] sm:text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mr-1">
            Quick Actions:
          </span>
          {detectedContacts.map((contact, i) => {
            const IconComp = contact.icon;
            return (
              <a
                key={i}
                href={contact.href}
                target={contact.href.startsWith('http') ? '_blank' : undefined}
                rel={contact.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all shadow-2xs hover:scale-102 active:scale-98 cursor-pointer ${contact.className}`}
              >
                <IconComp size={13} />
                <span>{contact.label}</span>
                {contact.href.startsWith('http') && <ExternalLink size={10} className="opacity-60" />}
              </a>
            );
          })}
        </div>
      )}

      {/* Smart Contextual Follow-up Chips */}
      {suggestions.length > 0 && !isStreaming && onSuggestionClick && (
        <div className="px-4 sm:px-5 py-3 border-t border-neutral-100 dark:border-neutral-800/70 bg-white dark:bg-[#131416] flex flex-col gap-1.5">
          <div className="text-[11px] font-medium text-neutral-400 flex items-center gap-1">
            <span>Suggested follow-ups:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((sugg, i) => (
              <button
                key={i}
                onClick={() => onSuggestionClick(sugg.query)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800/90 text-neutral-700 dark:text-neutral-300 hover:bg-[#0171E3] hover:text-white dark:hover:bg-[#0171E3] dark:hover:text-white border border-neutral-200/70 dark:border-neutral-700 transition-all cursor-pointer group"
              >
                <span>{sugg.label}</span>
                <ChevronRight size={12} className="opacity-50 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default RichChatMessage;
