import { 
  Layout, 
  ShieldCheck, 
  Terminal, 
  Globe, 
  Layers, 
  Sparkles, 
  Zap, 
  User, 
  Briefcase, 
  Cpu, 
  Code2, 
  GraduationCap,
  type LucideIcon
} from "lucide-react";

export type TemplateStyle = 'minimal' | 'professional' | 'visual' | 'technical' | 'academic';

export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  recommended_for: string;
  icon: LucideIcon;
  category: string;
  tags: string[];
  tone: 'professional' | 'casual' | 'technical' | 'academic';
  sections: string[];
  section_order: string[];
  default_badges: string[];
  style: TemplateStyle;
}

export const TEMPLATES: TemplateConfig[] = [
  {
    id: "minimal",
    name: "Minimalist",
    description: "Essential documentation focusing on clarity and speed. Ideal for utility libraries.",
    recommended_for: "Small libraries, utilities, personal scripts.",
    icon: Layout,
    category: "Standard",
    tags: ["Lightweight", "Clean"],
    tone: "professional",
    sections: ["Overview", "Installation", "Usage", "License"],
    section_order: ["Overview", "Installation", "Usage", "License"],
    default_badges: ["license", "version"],
    style: "minimal"
  },
  {
    id: "professional",
    name: "Enterprise Professional",
    description: "Highly structured and comprehensive documentation for production-ready applications.",
    recommended_for: "Business applications, production systems, large frameworks.",
    icon: ShieldCheck,
    category: "Premium",
    tags: ["Comprehensive", "Structured"],
    tone: "professional",
    sections: ["Overview", "Features", "Installation", "Usage", "Configuration", "Project Structure", "Testing", "Deployment", "Contributing", "License"],
    section_order: ["Overview", "Features", "Installation", "Configuration", "Usage", "Project Structure", "Testing", "Deployment", "Contributing", "License"],
    default_badges: ["build", "coverage", "license", "stability"],
    style: "professional"
  },
  {
    id: "oss",
    name: "Open Source Standard",
    description: "Optimized for community growth with clear contribution guidelines and community standards.",
    recommended_for: "Public libraries, community-driven tools.",
    icon: Layers,
    category: "Standard",
    tags: ["Community", "Standard"],
    tone: "professional",
    sections: ["Overview", "Features", "Installation", "Usage", "Contributing", "Code of Conduct", "License"],
    section_order: ["Overview", "Features", "Installation", "Usage", "Contributing", "Code of Conduct", "License"],
    default_badges: ["stars", "forks", "contributors", "license"],
    style: "professional"
  },
  {
    id: "portfolio",
    name: "Developer Portfolio",
    description: "Showcase your project with a focus on visuals, results, and your personal touch.",
    recommended_for: "Personal projects, hackathon entries.",
    icon: Briefcase,
    category: "Personal",
    tags: ["Visual", "Showcase"],
    tone: "casual",
    sections: ["Overview", "Demo", "Tech Stack", "Key Features", "Learning Outcomes", "License"],
    section_order: ["Overview", "Demo", "Key Features", "Tech Stack", "Learning Outcomes", "License"],
    default_badges: ["built-with"],
    style: "visual"
  },
  {
    id: "saas",
    name: "SaaS Product",
    description: "Marketing-focused README with feature highlights, screenshots, and conversion points.",
    recommended_for: "SaaS apps, web products.",
    icon: Globe,
    category: "Marketing",
    tags: ["Conversion", "Features"],
    tone: "professional",
    sections: ["Overview", "Screenshots", "Key Features", "Quick Start", "Pricing", "Support", "License"],
    section_order: ["Overview", "Screenshots", "Key Features", "Quick Start", "Support", "License"],
    default_badges: ["status", "platform"],
    style: "visual"
  },
  {
    id: "ai",
    name: "AI / Machine Learning",
    description: "Documentation for models, datasets, and technical reproduction.",
    recommended_for: "LLM tools, ML models, Data science projects.",
    icon: Sparkles,
    category: "Technical",
    tags: ["Research", "Technical"],
    tone: "technical",
    sections: ["Overview", "Model Description", "Installation", "Dataset", "Training", "Inference", "Benchmarks", "License"],
    section_order: ["Overview", "Model Description", "Installation", "Inference", "Dataset", "Training", "Benchmarks", "License"],
    default_badges: ["papers-with-code", "huggingface"],
    style: "technical"
  },
  {
    id: "python",
    name: "Python Package",
    description: "Standard structure for Python projects using pip, poetry, or conda.",
    recommended_for: "Python libraries, CLI tools, Django/Flask apps.",
    icon: Code2,
    category: "Language Specific",
    tags: ["Python", "PyPI"],
    tone: "technical",
    sections: ["Overview", "Installation", "Usage", "Development", "Testing", "License"],
    section_order: ["Overview", "Installation", "Usage", "Testing", "Development", "License"],
    default_badges: ["pypi", "python-version"],
    style: "technical"
  },
  {
    id: "js_ts",
    name: "JS / TS Library",
    description: "Optimized for npm/yarn ecosystem with type documentation and bundler info.",
    recommended_for: "npm packages, React/Vue components.",
    icon: Zap,
    category: "Language Specific",
    tags: ["Node.js", "TypeScript"],
    tone: "technical",
    sections: ["Overview", "Installation", "API Reference", "Usage", "Types", "Testing", "License"],
    section_order: ["Overview", "Installation", "Usage", "API Reference", "Types", "Testing", "License"],
    default_badges: ["npm", "bundle-size"],
    style: "technical"
  },
  {
    id: "cli",
    name: "CLI Tool",
    description: "Focus on installation, command references, flags, and terminal demos.",
    recommended_for: "Dev tools, shell scripts, CLI utilities.",
    icon: Terminal,
    category: "Technical",
    tags: ["CLI", "Commands"],
    tone: "technical",
    sections: ["Overview", "Installation", "Command Reference", "Examples", "Configuration", "License"],
    section_order: ["Overview", "Installation", "Command Reference", "Examples", "Configuration", "License"],
    default_badges: ["binary-release", "platforms"],
    style: "technical"
  },
  {
    id: "student",
    name: "Student Project",
    description: "Educational focus with implementation details and academic references.",
    recommended_for: "University assignments, learning projects.",
    icon: GraduationCap,
    category: "Personal",
    tags: ["Academic", "Learning"],
    tone: "academic",
    sections: ["Overview", "Problem Statement", "Approach", "Implementation", "Running the Project", "References", "License"],
    section_order: ["Overview", "Problem Statement", "Approach", "Implementation", "Running the Project", "References", "License"],
    default_badges: ["grade", "school"],
    style: "academic"
  }
];
