import { profile as defaultProfile } from '../data/profile';

let rawBase = import.meta.env.VITE_API_BASE_URL || '/api';

// Normalize hostname/protocol for production deployment on Render
if (rawBase && !rawBase.startsWith('http://') && !rawBase.startsWith('https://') && !rawBase.startsWith('/')) {
  rawBase = `https://${rawBase}`;
}
rawBase = rawBase.replace(/\/+$/, '');
if (!rawBase.endsWith('/api') && rawBase !== '') {
  rawBase = `${rawBase}/api`;
}

const API_BASE_URL = rawBase;

export const fetchProfile = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/profile`);
    if (!res.ok) throw new Error('Failed to fetch profile from API');
    const data = await res.json();
    return { ...defaultProfile, ...data };
  } catch (err) {
    // Graceful fallback to rich local profile data
    console.warn('Backend API unavailable, using local profile data:', err.message);
    return defaultProfile;
  }
};

export const fetchProjects = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/projects`);
    if (!res.ok) throw new Error('Failed to fetch projects');
    return await res.json();
  } catch {
    return defaultProfile.projects;
  }
};

export const fetchSkills = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/skills`);
    if (!res.ok) throw new Error('Failed to fetch skills');
    return await res.json();
  } catch {
    return defaultProfile.skills;
  }
};

// Generates an intelligent streaming response for the UI when backend is offline or delayed
const fallbackChatStream = async (message, onChunk) => {
  const q = (message || '').toLowerCase();
  let responseText = '';

  const isHindi = /(kaun|kya|kaise|kahan|padhai|karta|karte|batao|bataiye|namaste|shukriya|karo|banao|hai|hain|ke baare|ke bare)/i.test(q);

  if (q.includes('project') || q.includes('surplus') || q.includes('food') || q.includes('recovery') || q.includes('banaya') || q.includes('kya banaya')) {
    const proj = defaultProfile.projects[0];
    if (isHindi) {
      responseText = `Maine apna flagship full-stack project **${proj.title}** banaya hai!\n\n` +
        `Yeh ek impactful platform hai jo restaurants, caterers aur food donors ko NGOs aur volunteers se connect karta hai taaki food waste ko eliminate kiya ja sake.\n\n` +
        `* **Tech Stack:** **React.js**, **JavaScript**, **Python**, aur **Firebase** (Realtime DB & Authentication).\n` +
        `* **Role-Based Dashboards:** Donors, NGOs, aur delivery partners ke liye alag workflows aur tracking.\n` +
        `* **Real-Time Sync:** Donations aur pickups ke real-time status updates.\n` +
        `* **GitHub Repository:** [https://github.com/gatharva264-eng](https://github.com/gatharva264-eng)\n\n` +
        `Aap iske tech stack ya specific features ke baare mein aur pooch sakte hain!`;
    } else {
      responseText = `Here is my flagship project: **${proj.title}**.\n\n` +
        `A full-stack web application designed to minimize food waste by connecting food donors (restaurants, caterers, banquet halls), NGOs, and delivery volunteers.\n\n` +
        `* **Tech Stack:** Built with **React.js**, **JavaScript**, **Python**, and **Firebase** (Auth & Realtime Database).\n` +
        `* **Key Workflows:** Role-based dashboards for donation postings, NGO coordination, and volunteer pickup tracking.\n` +
        `* **Real-Time Updates:** Live notifications and synchronized pickup statuses.\n` +
        `* **Codebase:** [https://github.com/gatharva264-eng](https://github.com/gatharva264-eng)\n\n` +
        `Feel free to ask about its technical architecture or role-based authorization workflows!`;
    }
  } else if (q.includes('skill') || q.includes('language') || q.includes('technolog') || q.includes('react') || q.includes('python') || q.includes('dsa') || q.includes('seekha') || q.includes('toolkit')) {
    if (isHindi) {
      responseText = `Meri core technical skills aur developer toolkit yeh hain:\n\n` +
        `* **Programming Languages:** **C**, **C++**, **Python**, aur **DSA** (Data Structures & Algorithms).\n` +
        `* **Frontend Development:** **React.js**, **JavaScript (ES6+)**, **HTML5**, **CSS3**, aur modern responsive UI design.\n` +
        `* **Backend & Cloud:** **Python**, **Firebase** (Authentication & Realtime DB), aur REST APIs.\n` +
        `* **Developer Tools:** **Git**, **GitHub**, **Netlify**, **Render**, aur **VS Code**.\n` +
        `* **Creative Skills:** **Video Editing**, **Photography**, aur Visual Content Creation.\n\n` +
        `Main actively scalable web apps aur efficient algorithms par kaam karta hoon!`;
    } else {
      responseText = `Here is an overview of my technical skills and developer toolkit:\n\n` +
        `* **Programming Languages:** **C**, **C++**, **Python**, **Data Structures & Algorithms (DSA)**.\n` +
        `* **Frontend:** **React.js**, **JavaScript (ES6+)**, **HTML5**, **CSS3**, responsive layouts.\n` +
        `* **Backend & Cloud:** **Python**, **Firebase** (Auth & Realtime DB), REST API integration.\n` +
        `* **Tools & Platforms:** **Git**, **GitHub**, **Netlify**, **Render**, **VS Code**.\n` +
        `* **Creative Toolkit:** **Photography**, **Video Editing**, visual content design.\n\n` +
        `I am dedicated to writing clean, maintainable code and building high-performance web experiences!`;
    }
  } else if (q.includes('education') || q.includes('college') || q.includes('allenhouse') || q.includes('padhai') || q.includes('degree') || q.includes('school') || q.includes('10th') || q.includes('12th')) {
    if (isHindi) {
      responseText = `Meri education background ki details yeh hain:\n\n` +
        `* **College / B.Tech:** Abhi main **Allenhouse Institute of Technology** se **Bachelor of Technology (B.Tech) in Computer Science** (2025–2028) pursue kar raha hoon.\n` +
        `* **Class XII (PCM):** J.N.P.N Inter College, UP Board (70.2%, 2025).\n` +
        `* **Class X (Science):** Shivaji Inter College, UP Board (82%, 2023).\n\n` +
        `Main computer science fundamentals, full-stack web development, aur problem-solving par focus kar raha hoon!`;
    } else {
      responseText = `Here is a summary of my educational background:\n\n` +
        `* **Current Degree:** Pursuing **B.Tech in Computer Science** (2025–2028) at **Allenhouse Institute of Technology**.\n` +
        `* **Class XII (PCM):** J.N.P.N Inter College, UP Board (70.2%, 2025).\n` +
        `* **Class X (Science):** Shivaji Inter College, UP Board (82%, 2023).\n\n` +
        `My academic focus is on core computer science foundations, algorithms, and practical full-stack software development.`;
    }
  } else if (q.includes('contact') || q.includes('reach') || q.includes('email') || q.includes('phone') || q.includes('number') || q.includes('whatsapp') || q.includes('sampark') || q.includes('hire') || q.includes('internship') || q.includes('instagram') || q.includes('insta') || q.includes('social') || q.includes('exe.athrvv')) {
    if (isHindi) {
      responseText = `Aap mujhe directly in channels ke through contact kar sakte hain:\n\n` +
        `* **Email:** [gatharva264@gmail.com](mailto:gatharva264@gmail.com)\n` +
        `* **Phone / WhatsApp:** [+91 9453036904](tel:+919453036904)\n` +
        `* **LinkedIn:** [linkedin.com/in/atharvagupta-](https://linkedin.com/in/atharvagupta-)\n` +
        `* **GitHub:** [github.com/gatharva264-eng](https://github.com/gatharva264-eng)\n` +
        `* **Instagram:** [@exe.athrvv](https://instagram.com/exe.athrvv)\n\n` +
        `Main actively **full-stack developer internships**, junior developer roles, aur collaborative software projects ke liye available hoon!`;
    } else {
      responseText = `I would love to connect! You can reach me directly via:\n\n` +
        `* **Email:** [gatharva264@gmail.com](mailto:gatharva264@gmail.com)\n` +
        `* **Phone / WhatsApp:** [+91 9453036904](tel:+919453036904)\n` +
        `* **LinkedIn:** [https://linkedin.com/in/atharvagupta-](https://linkedin.com/in/atharvagupta-)\n` +
        `* **GitHub:** [https://github.com/gatharva264-eng](https://github.com/gatharva264-eng)\n` +
        `* **Instagram:** [@exe.athrvv](https://instagram.com/exe.athrvv)\n\n` +
        `I am actively open for **full-stack internships**, junior developer roles, and exciting software collaborations!`;
    }
  } else if (q.includes('codefuse') || q.includes('achievement') || q.includes('award') || q.includes('hobby') || q.includes('creative') || q.includes('photo') || q.includes('video')) {
    if (isHindi) {
      responseText = `Mere notable achievements aur creative interests yeh hain:\n\n` +
        `* **CodeFuse 2025:** 600+ participants me se Round 1 qualify karke Offline Grand Finale me participate kiya aur Certificate of Appreciation receive kiya!\n` +
        `* **Creative Hobbies:** Coding ke alawa mujhe **Photography**, **Video Editing**, aur visual content creation ka shauk hai.\n\n` +
        `Technology aur creative storytelling dono me mujhe naye ideas explore karna pasand hai!`;
    } else {
      responseText = `Here are my notable achievements and creative interests:\n\n` +
        `* **CodeFuse 2025:** Qualified Round 1 out of 600+ participants and competed in the Offline Grand Finale, awarded a Certificate of Appreciation.\n` +
        `* **Creative Pursuits:** Beyond coding, I am an enthusiastic creator with skills in **Photography**, **Video Editing**, and digital media.\n\n` +
        `I love blending analytical problem-solving with creative design and visuals!`;
    }
  } else if (q.includes('who are you') || q.includes('kaun ho') || q.includes('about') || q.includes('atharva') || q.includes('intro') || q.includes('namaste') || q.includes('hello') || q.includes('hi')) {
    if (isHindi) {
      responseText = `Namaste! Main **Atharva Gupta** hoon, ek aspiring **Full-Stack Developer**.\n\n` +
        `Abhi main **Allenhouse Institute of Technology** se B.Tech Computer Science (2025–2028) pursue kar raha hoon. ` +
        `Main **React.js**, **JavaScript**, **Python**, aur **Firebase** se real-world web applications build karta hoon jaise mera flagship project **Surplus Food Recovery Network**.\n\n` +
        `Aap mere projects, skills, education, ya collaboration ke baare mein kuch bhi pooch sakte hain!`;
    } else {
      responseText = `Hey there! I'm **Atharva Gupta**, an aspiring **Full-Stack Developer**.\n\n` +
        `I am currently pursuing my B.Tech in Computer Science (2025–2028) at **Allenhouse Institute of Technology**.\n\n` +
        `I specialize in **React.js**, **JavaScript**, **Python**, and **Firebase**, and recently built the **Surplus Food Recovery Network** to eliminate community food waste.\n\n` +
        `Feel free to ask me anything about my projects, technical stack, or getting in touch!`;
    }
  } else {
    if (isHindi) {
      responseText = `Poochne ke liye shukriya! Main **Atharva Gupta** hoon.\n\n` +
        `Main Full-Stack Developer hoon (**React.js**, **Python**, **Firebase**, **C++**, **DSA**). Aap mujhse directly pooch sakte hain:\n\n` +
        `* 🍲 **Surplus Food Recovery Network** project ke baare mein\n` +
        `* 💻 Meri **technical skills** aur tools ke baare mein\n` +
        `* 🎓 **Allenhouse** me meri B.Tech padhai ke baare mein\n` +
        `* 📬 Mujhse **direct contact** ya internship opportunities ke baare mein!`;
    } else {
      responseText = `Thanks for asking! I'm **Atharva Gupta**, an aspiring **Full-Stack Developer** specializing in React.js, Python, and Firebase.\n\n` +
        `You can ask me directly about:\n\n` +
        `* 🍲 My flagship **Surplus Food Recovery Network** project\n` +
        `* 💻 My **technical skills** (React, Python, Firebase, C++, DSA)\n` +
        `* 🎓 My **education** at Allenhouse Institute of Technology\n` +
        `* 📬 How to **contact me** for internships and roles!`;
    }
  }

  // Stream in realistic smooth conversational chunks
  const words = responseText.split(' ');
  for (let i = 0; i < words.length; i++) {
    await new Promise(r => setTimeout(r, 15 + Math.random() * 15));
    onChunk((i === 0 ? '' : ' ') + words[i]);
  }
};

export const streamChat = async (message, history, onChunk) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const res = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Chat API responded with status ${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        const chunkStr = decoder.decode(value, { stream: true });
        const lines = chunkStr.split('\n');
        for (let line of lines) {
          line = line.trim();
          if (line.startsWith('data:')) {
            try {
              let jsonStr = line.replace(/^(data:\s*)+/, '');
              if (jsonStr) {
                const data = JSON.parse(jsonStr);
                if (data && data.text) {
                  onChunk(data.text);
                }
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e, line);
            }
          }
        }
      }
    }
  } catch (error) {
    console.warn('Live chat API unavailable or timed out, utilizing intelligent local response:', error.message);
    await fallbackChatStream(message, onChunk);
  }
};

// Clean frontend alias per Phase 26
export const sendChatMessage = streamChat;
