export type Founder = {
  name: string;
  role: string;
  background: string;
  avatar?: string;
};

export type Company = {
  id: string;
  slug: string;
  name: string;
  logo?: string;
  mission: string;
  description: string;
  longDescription?: string;
  batch: string;
  stage: string;
  sector: string;
  location?: string;
  remote?: boolean;
  activeJobs: number;
  website?: string;
  founders?: Founder[];
  news?: string[];
};

export type Job = {
  id: string;
  companyId: string;
  companySlug: string;
  companyName: string;
  title: string;
  department: string;
  type: string;
  location: string;
  remote?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  description: string;
  overview: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  benefits: string[];
  tags?: string[];
};

export const COMPANIES: Company[] = [
  {
    id: "novamind",
    slug: "novamind",
    name: "NovaMind",
    mission: "AI operating system for healthcare intelligence",
    description:
      "Building the infrastructure that powers clinical decision-making and patient intelligence systems.",
    longDescription:
      "NovaMind is building the foundational AI infrastructure that powers clinical decision-making, patient intelligence systems, and next-generation healthcare automation.",
    batch: "W26",
    stage: "Seed",
    sector: "HealthTech",
    location: "Remote-first",
    remote: true,
    activeJobs: 2,
    website: "https://novamind.ai",
    founders: [
      {
        name: "Dr. Alex Chen",
        role: "CEO & Co-Founder",
        background: "Former Stanford AI Lab researcher, ex-Google Health.",
      },
      {
        name: "Maya Patel",
        role: "CTO & Co-Founder",
        background: "Built distributed ML systems at scale for medical imaging.",
      },
    ],
    news: [
      "Raised $18M Seed Round led by top-tier investors",
      "Launched AI diagnostic assistant beta",
      "Partnered with 3 major hospital networks",
    ],
  },
  {
    id: "orbitlabs",
    slug: "orbitlabs",
    name: "OrbitLabs",
    mission: "AI agents for enterprise workflows",
    description:
      "Automating operations with autonomous systems that help teams move faster.",
    longDescription:
      "OrbitLabs builds next-generation AI agents for enterprise workflows, helping teams automate operations, research, and internal tooling.",
    batch: "S26",
    stage: "Seed",
    sector: "AI",
    location: "Global Remote",
    remote: true,
    activeJobs: 1,
    website: "https://orbitlabs.ai",
    founders: [
      {
        name: "Jordan Lee",
        role: "CEO & Co-Founder",
        background: "Ex-Stripe product lead and startup operator.",
      },
    ],
    news: [
      "Released orchestration platform for internal teams",
      "Expanded beta to 50+ companies",
    ],
  },
  {
    id: "quantforge",
    slug: "quantforge",
    name: "QuantForge",
    mission: "Infrastructure layer for autonomous financial systems",
    description:
      "Creating the systems that power fast, reliable, and intelligent financial products.",
    longDescription:
      "QuantForge is building the infrastructure layer for autonomous financial systems, focusing on reliability, speed, and intelligence.",
    batch: "S25",
    stage: "Series A",
    sector: "FinTech",
    location: "US / EU",
    remote: true,
    activeJobs: 1,
    website: "https://quantforge.ai",
    founders: [
      {
        name: "Sara Kim",
        role: "CEO & Co-Founder",
        background: "Former fintech engineer and startup founder.",
      },
    ],
    news: [
      "Closed Series A from leading investors",
      "Hiring across engineering and design",
    ],
  },
];

export const JOBS: Job[] = [
  {
    id: "ml-engineer",
    companyId: "novamind",
    companySlug: "novamind",
    companyName: "NovaMind",
    title: "Machine Learning Engineer",
    department: "Engineering",
    type: "Full-time",
    location: "Remote (US/EU)",
    remote: true,
    salaryMin: 150000,
    salaryMax: 220000,
    description:
      "Build and scale ML systems that power healthcare intelligence at a global level.",
    overview:
      "You will design, deploy, and improve machine learning systems used in real healthcare workflows.",
    responsibilities: [
      "Design and deploy ML models at scale",
      "Work with large healthcare datasets",
      "Collaborate with product and infra teams",
      "Improve model performance and reliability",
    ],
    requirements: [
      "Strong ML/AI background",
      "Experience with Python and ML frameworks",
      "Understanding of scalable systems",
      "Startup mindset",
    ],
    niceToHave: [
      "Healthcare data experience",
      "Experience with LLMs",
      "Distributed systems exposure",
    ],
    benefits: [
      "Competitive salary + equity",
      "Remote-first flexibility",
      "Direct access to founders",
      "Work on real-world AI impact",
    ],
    tags: ["ML", "Python", "Healthcare"],
  },
  {
    id: "backend-engineer",
    companyId: "orbitlabs",
    companySlug: "orbitlabs",
    companyName: "OrbitLabs",
    title: "Backend Engineer",
    department: "Engineering",
    type: "Full-time",
    location: "London / Remote",
    remote: true,
    salaryMin: 130000,
    salaryMax: 200000,
    description:
      "Build backend systems for agent workflows, integrations, and enterprise reliability.",
    overview:
      "You will work on APIs, platform reliability, and systems that support high-scale AI products.",
    responsibilities: [
      "Design APIs and backend services",
      "Improve platform reliability and performance",
      "Collaborate with product and AI teams",
      "Own deployment and observability workflows",
    ],
    requirements: [
      "Strong backend engineering experience",
      "Experience with distributed systems",
      "Excellent API design skills",
      "Comfortable in a fast-moving startup",
    ],
    niceToHave: [
      "Node.js or Go experience",
      "Cloud infrastructure background",
    ],
    benefits: [
      "Competitive salary + equity",
      "Remote-friendly team",
      "Fast decision making",
    ],
    tags: ["Backend", "APIs", "Infrastructure"],
  },
  {
    id: "product-designer",
    companyId: "quantforge",
    companySlug: "quantforge",
    companyName: "QuantForge",
    title: "Product Designer",
    department: "Design",
    type: "Full-time",
    location: "NYC / Hybrid",
    remote: false,
    salaryMin: 110000,
    salaryMax: 170000,
    description:
      "Design intuitive financial tools and workflows for modern AI-native products.",
    overview:
      "You will shape product experiences from concept to launch across core fintech workflows.",
    responsibilities: [
      "Design user flows, wireframes, and polished UI",
      "Partner with engineering and product",
      "Run design reviews and iterate quickly",
      "Build scalable design systems",
    ],
    requirements: [
      "Strong product design portfolio",
      "Experience working on shipped products",
      "Excellent interaction and visual design skills",
      "Comfortable with rapid iteration",
    ],
    niceToHave: [
      "Fintech experience",
      "Motion design experience",
    ],
    benefits: [
      "Competitive salary + equity",
      "Real product ownership",
      "High-ownership culture",
    ],
    tags: ["Design", "FinTech", "UI"],
  },
];

export function getCompanyBySlug(slug: string) {
  return COMPANIES.find((c) => c.slug === slug);
}

export function getJobById(jobId: string) {
  return JOBS.find((j) => j.id === jobId);
}

export function getJobsByCompanySlug(slug: string) {
  return JOBS.filter((j) => j.companySlug === slug);
}
