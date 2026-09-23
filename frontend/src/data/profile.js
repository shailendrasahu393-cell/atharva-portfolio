// Centralized profile data for Atharva Gupta's portfolio
// Derived directly from Atharva Gupta's verified resume

export const profile = {
  personal: {
    name: "Atharva Gupta",
    role: "Full-Stack Developer",
    headline: "Hey, I'm Atharva 👋",
    description: "Aspiring Full-Stack Developer specializing in React.js, JavaScript, Python, and Firebase.",
    avatar: "/assets/avatar.png",
    statusBadge: "Available for opportunities",
    watermark: "ATHARVA",
    email: "gatharva264@gmail.com",
    phone: "9453036904",
    location: "India"
  },
  name: "Atharva Gupta",
  role: "Full-Stack Developer",
  headline: "Hey, I'm Atharva 👋",
  description: "Aspiring Full-Stack Developer pursuing B.Tech in Computer Science at Allenhouse Institute of Technology. Experienced in React.js, JavaScript, Python, Firebase, and building real-world solutions.",
  avatar: "/assets/avatar.png",
  
  about: {
    summary: "Aspiring Full-Stack Developer pursuing a Bachelor of Technology in Computer Science, with a strong interest in web development, problem-solving, and building practical software solutions. Seeking opportunities to apply technical skills in React.js, JavaScript, Python, Firebase, and database technologies while continuously learning and contributing effectively in a professional environment.",
    interests: ["Full-Stack Development", "Problem Solving", "Web Architecture", "Visual Content Creation", "Open Source"],
    direction: "Focusing on full-stack web applications, scalable APIs, and building impactful community and software solutions."
  },

  projects: [
    {
      id: "surplus-food-recovery",
      title: "Surplus Food Recovery Network",
      description: "A full-stack surplus food recovery platform connecting food donors, NGOs, and delivery partners to streamline the collection and redistribution of surplus food.",
      technologies: ["React.js", "JavaScript", "Python", "Firebase", "Database Integration"],
      github: "https://github.com/gatharva264-eng",
      live_demo: "https://github.com/gatharva264-eng",
      image: null,
      featured: true,
      color: "#0171E3",
      highlights: [
        "Connected food donors, NGOs, and delivery partners to eliminate food waste.",
        "Built responsive frontend with React.js & JavaScript and developed backend using Python.",
        "Integrated Firebase and database for authentication and real-time data management.",
        "Designed role-based workflows and dashboards for donors, NGOs, and delivery partners."
      ]
    }
  ],

  skills: {
    programming_languages: ["C", "C++", "Python", "Data Structures & Algorithms (DSA)"],
    web_technologies: ["HTML", "CSS", "JavaScript", "Frontend Basics", "React.js"],
    tools_and_platforms: ["React", "Git", "GitHub", "Netlify", "Render", "Firebase"],
    additional_skills: ["Video Editing", "Photography", "Visual Content Creation"],
    concepts: ["Problem Solving", "Responsive Design", "API Handling", "Database Technologies"]
  },

  education: [
    {
      institution: "Allenhouse Institute of Technology",
      degree: "Bachelor of Technology in Computer Science",
      field: "Computer Science & Engineering",
      start_date: "2025",
      end_date: "2028",
      highlights: [
        "Currently pursuing B.Tech in Computer Science"
      ]
    },
    {
      institution: "J.N.P.N Inter College, UP Board",
      degree: "Class XII (PCM)",
      score: "70.2%",
      start_date: "2023",
      end_date: "2025"
    },
    {
      institution: "Shivaji Inter College, UP Board",
      degree: "Class X (Science)",
      score: "82%",
      start_date: "2021",
      end_date: "2023"
    }
  ],

  achievements: [
    "Certificate of Appreciation, CodeFuse 2025 — Qualified Round 1 among 600+ participants and participated in the Offline Grand Finale"
  ],

  certifications: [
    "Certificate of Appreciation, CodeFuse 2025"
  ],

  hobbies: [
    "Photography",
    "Video Editing",
    "Visual Content Creation",
    "Coding & Problem Solving"
  ],

  social_links: {
    github: "https://github.com/gatharva264-eng",
    linkedin: "https://linkedin.com/in/atharvagupta-",
    email: "mailto:gatharva264@gmail.com",
    phone: "tel:+919453036904"
  },

  contact: {
    email: "gatharva264@gmail.com",
    phone: "9453036904",
    availability: "Available for full-time opportunities, internships, and collaborative software engineering projects.",
    location: "India / Remote"
  },

  // Categorized suggested questions for the AI assistant
  quickCategories: [
    {
      id: "me",
      name: "Me",
      color: "#329696",
      icon: "Laugh",
      defaultQuery: "Who is Atharva Gupta? Tell me about your background and education.",
      questions: [
        "Who is Atharva Gupta? Tell me about your background.",
        "What are you currently pursuing at Allenhouse Institute of Technology?",
        "What is your career objective in full-stack development?",
        "What is your educational background?"
      ]
    },
    {
      id: "projects",
      name: "Projects",
      color: "#3E9858",
      icon: "BriefcaseBusiness",
      defaultQuery: "Tell me about the Surplus Food Recovery Network project.",
      questions: [
        "Tell me about the Surplus Food Recovery Network project.",
        "What technologies did you use to build the Surplus Food Recovery Network?",
        "How does the role-based workflow work for donors and NGOs?",
        "Where can I find your project source code on GitHub?"
      ]
    },
    {
      id: "skills",
      name: "Skills",
      color: "#856ED9",
      icon: "Layers",
      defaultQuery: "What are your programming languages and technical skills?",
      questions: [
        "What programming languages and technical skills do you have?",
        "What is your experience with React.js, Python, and Firebase?",
        "What tools and platforms do you use for deployment?",
        "Do you have experience in Data Structures and Algorithms (DSA)?"
      ]
    },
    {
      id: "fun",
      name: "Fun",
      color: "#B95F9D",
      icon: "PartyPopper",
      defaultQuery: "Tell me about your achievement in CodeFuse 2025 and your creative hobbies.",
      questions: [
        "Tell me about your achievement in CodeFuse 2025 Offline Grand Finale.",
        "What are your creative hobbies outside coding?",
        "Tell me about your video editing and photography experience.",
        "What drives your passion for building software solutions?"
      ]
    },
    {
      id: "contact",
      name: "Contact",
      color: "#C19433",
      icon: "UserRoundSearch",
      defaultQuery: "How can I contact Atharva Gupta? What are your email, phone, and links?",
      questions: [
        "How can I contact Atharva Gupta?",
        "What are your email address and phone number?",
        "What are your GitHub and LinkedIn profile links?",
        "Are you open to internships or full-stack developer roles?"
      ]
    }
  ]
};
