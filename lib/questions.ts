export interface PresetQuestion {
  id: string;
  category: "100x Brief" | "IncuBrix Deep Dives" | "Academic Projects" | "Culture & Work Style";
  question: string;
  shortLabel: string;
}

export const PRESET_QUESTIONS: PresetQuestion[] = [
  // Core Self Introduction & 100x Brief Questions
  {
    id: "self-intro",
    category: "100x Brief",
    question: "Please introduce yourself.",
    shortLabel: "👋 Self Introduction",
  },
  {
    id: "life-story",
    category: "100x Brief",
    question: "What should we know about your life story in a few sentences?",
    shortLabel: "📖 Life story in a few sentences",
  },
  {
    id: "superpower",
    category: "100x Brief",
    question: "What's your #1 superpower?",
    shortLabel: "⚡ My #1 superpower",
  },
  {
    id: "growth-areas",
    category: "100x Brief",
    question: "What are the top 3 areas you'd like to grow in?",
    shortLabel: "🌱 Top 3 growth areas",
  },
  {
    id: "misconception",
    category: "100x Brief",
    question: "What misconception do your coworkers have about you?",
    shortLabel: "🤔 Coworker misconception",
  },
  {
    id: "boundaries",
    category: "100x Brief",
    question: "How do you push your boundaries and limits?",
    shortLabel: "🚀 Pushing boundaries & limits",
  },

  // IncuBrix Production Deep-Dives
  {
    id: "ecs-ram-cut",
    category: "IncuBrix Deep Dives",
    question: "How did you measure the >90% RAM cut when using disk streaming on ECS?",
    shortLabel: "ECS RAM cut (>90%) & Kitchen analogy",
  },
  {
    id: "google-files-api",
    category: "IncuBrix Deep Dives",
    question: "Why did Google Files API resolve your 503 errors over synchronous payloads?",
    shortLabel: "Google Files API vs 503 errors",
  },
  {
    id: "prev-memory-consumption",
    category: "IncuBrix Deep Dives",
    question: "What was the previous memory consumption on your ECS container?",
    shortLabel: "Previous memory & OOM exit code 137",
  },
  {
    id: "content-hub",
    category: "IncuBrix Deep Dives",
    question: "What functionality did you complete in the file explorer for Content Hub?",
    shortLabel: "Content Hub file explorer (80% to 100%)",
  },
  {
    id: "content-planner",
    category: "IncuBrix Deep Dives",
    question: "Tell me about your Content Planner project at IncuBrix.",
    shortLabel: "Content Planner (AI 3-tier roadmap)",
  },

  // Academic Projects
  {
    id: "image-encryption",
    category: "Academic Projects",
    question: "Tell me about your Image Encryption project using Wavelet Transforms.",
    shortLabel: "Image Encryption (IWT & Chaos)",
  },
  {
    id: "django-security",
    category: "Academic Projects",
    question: "Tell me about your Full-Stack Security Web Application in Django.",
    shortLabel: "Full-Stack Security Web App",
  },
  {
    id: "dsa-cpp",
    category: "Academic Projects",
    question: "What language do you use to solve DSA problems?",
    shortLabel: "DSA in C++ & LeetCode",
  },

  // Culture & Communication
  {
    id: "explain-to-nontech",
    category: "Culture & Work Style",
    question: "How do you explain a technical fix to a non-technical person?",
    shortLabel: "Explaining tech to non-tech people",
  },
  {
    id: "us-hours",
    category: "Culture & Work Style",
    question: "Are you comfortable working with clients in US Eastern and Pacific time zones?",
    shortLabel: "US timezone readiness",
  },
  {
    id: "why-100x",
    category: "Culture & Work Style",
    question: "Why are you interested in joining 100x specifically?",
    shortLabel: "Why 100x?",
  },
];
