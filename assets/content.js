/*
 * ─────────────────────────────────────────────────────────────────────────
 *  YOUR CONTENT — edit this file only.
 *  Everything on the page is rendered from this object.
 *  Sources: CV, ISEP diploma, Hitachi L&D certificate, myPartner letter, notes.
 * ─────────────────────────────────────────────────────────────────────────
 */
window.PORTFOLIO = {
  name: "João Peres Moreira",
  initials: "JP",
  role: "Senior Technical Consultant",
  location: "Porto, Portugal",
  timezone: "Europe/Lisbon", // drives the live clock
  availability: "Senior Technical Consultant · Hitachi Solutions",
  available: true,

  // One entry per line. Wrap a word in *asterisks* to give it the accent.
  headline: ["I turn business processes", "into software that *flows*."],
  intro:
    "Software engineer and Microsoft business-apps consultant. I design and deliver automation and integrations on Power Platform, Dynamics 365 and Finance & Operations for companies across Europe.",

  // Your photo for the dot portrait in the hero, e.g. "assets/portrait.jpg".
  // Leave it empty and the portrait draws your initials instead.
  portrait: "assets/portrait.jpg",

  email: "jperesmoreira@gmail.com",
  socials: [
    { label: "LinkedIn", url: "https://www.linkedin.com/in/jo%C3%A3o-moreira-526307107/" },
    { label: "Email", url: "mailto:jperesmoreira@gmail.com" },
  ],

  about: {
    statement:
      "I sit where business meets code. I run the workshop, shape the requirements, build the integration, test it and hand it over — and I like being the one who owns all of it.",
    paragraphs: [
      "I studied Computer Engineering and then a Master's in Software Engineering at ISEP in Porto — the second while working full-time. My internship at myPartner had me building a Power Platform canvas app that optimised employee routes with Google APIs.",
      "At Hitachi Solutions I started on Finance & Operations and Dual Write — X++, SQL and Dataverse — and after two years moved to Power Platform: canvas and model-driven apps, Power Automate, C# plugins, TypeScript web resources and the integrations that tie CRM, ERP and third-party tools together. Today I also mentor new consultants and run internal training.",
    ],
    stats: [
      { value: 10, suffix: "+", label: "European subsidiaries delivered for" },
      { value: 200, suffix: "+", label: "users on systems I built" },
      { value: 6, suffix: "+", label: "years in Microsoft business apps" },
      { value: 100, suffix: "h+", label: "manual work saved every year" },
    ],
  },

  stack: [
    "Power Apps", "Power Automate", "Dataverse", "Dynamics 365", "Finance & Operations",
    "Power BI", "Power Pages", "X++", "C#", "TypeScript", "JavaScript", "SQL", ".NET",
    "Azure DevOps", "PCF", "Python", "Java",
  ],

  // Listed in any order: the site shows them newest first (by end, then start month).
  // Names describe the area of work only; real client names live in private/clients.md (never committed).
  projects: [
    {
      name: "Sales integrations",
      code: "sales",
      start: "2025-08", end: "2025-10", period: "Aug — Oct 2025",
      flow: ["Salesforce · NetSuite · ZoomInfo · Kantata · Intercom","AWS events","Power Automate","Dynamics 365"],
      kind: "Integrations",
      year: "2025",
      summary: "Led the integration of Salesforce, NetSuite, ZoomInfo, Kantata and Intercom with Dynamics 365. Built and automated 20+ Power Automate workflows processing real-time AWS events, behind the sales automation of a multimillion-euro client.",
      role: "Integration lead",
      stack: ["Power Automate", "Dynamics 365", "AWS"],
      metric: "5 systems · 20+ flows",
      url: "#",
    },
    {
      // under NDA: the client is described, never named
      name: "Retail FinOps",
      code: "retail",
      start: "2026-01", end: "2026-12", period: "Jan 2026 — now",
      nda: true,
      flow: ["External systems","Integration Framework","Finance & Operations"],
      kind: "UK retailer",
      year: "2026",
      summary: "For a UK retailer (under NDA): inbound and outbound Finance & Operations integrations through the Hitachi Integration Framework, plus customisation-gap analysis and best-practice guidance.",
      role: "Technical consultant",
      stack: ["Finance & Operations", "Integration Framework", "X++"],
      metric: "In progress",
      url: "#",
    },
    {
      name: "Document automation",
      code: "docs",
      start: "2025-11", end: "2025-12", period: "Nov — Dec 2025",
      flow: ["Workshop","Requirements","Dox42 build","Test","Handover"],
      kind: "Solo delivery",
      year: "2025",
      summary: "Brought a new tool, Dox42, into a client solution and delivered it almost single-handedly: workshops, requirements, scope, development, testing and the final handover.",
      role: "End-to-end delivery",
      stack: ["Dox42", "Power Platform", "Dataverse"],
      metric: "Workshop → handover",
      url: "#",
    },
    {
      name: "FinOps & CRM",
      code: "erp-crm",
      start: "2025-06", end: "2025-10", period: "Jun & Sep — Oct 2025",
      flow: ["Finance & Operations","Integration","CRM"],
      kind: "Client-facing",
      year: "2025",
      summary: "Cross-system integrations between Finance & Operations and CRM, working day to day with the client in requirement sessions to speed adoption across business units.",
      role: "Integration consultant",
      stack: ["Finance & Operations", "Dynamics 365", "Power Platform"],
      metric: "Client-facing daily",
      url: "#",
    },
    {
      name: "Public sector CRM",
      code: "permits",
      start: "2025-01", end: "2025-01", period: "Jan 2025",
      flow: ["Public request","Power Automate","Dynamics 365"],
      kind: "Permits & complaints",
      year: "2025",
      summary: "Overhauled the CRM workflows behind parking permits and complaint handling for a UK local authority, improving reliability for more than 10,000 public users.",
      role: "Power Automate developer",
      stack: ["Power Automate", "Dynamics 365", "Dataverse"],
      metric: "10,000+ users",
      url: "#",
    },
    {
      name: "Government pre-sales",
      code: "presales",
      start: "2025-08", end: "2025-08", period: "Aug 2025",
      flow: ["Workshops","Demo data","PoC environment"],
      kind: "Proof of concept",
      year: "2025",
      summary: "Part of the core pre-sales team for a government proof of concept: led workshops and built the demo environments and data that shaped the solution strategy.",
      role: "Pre-sales consultant",
      stack: ["Power Platform", "Dynamics 365"],
      metric: "Government PoC",
      url: "#",
    },
    {
      name: "Resourcing",
      code: "resourcing",
      start: "2025-02", end: "2025-06", period: "Recurring · mostly Feb — Jun 2025", periodShort: "Recurring · 2025",
      flow: ["Estimates & holidays","Power Automate","12 branches"],
      kind: "Internal automation",
      year: "2025",
      summary: "Automated project estimation and public-holiday booking across 12 European branches of Hitachi Solutions, removing over 100 hours of manual work a year.",
      role: "Creator",
      stack: ["Power Automate", "Power Apps", "Dataverse"],
      metric: "100h+ saved / year",
      url: "#",
    },
    {
      name: "FinOps PSA",
      code: "psa",
      start: "2020-09", end: "2020-12", period: "2020 · first project",
      flow: ["Core IP","X++ extensions","Finance & Operations"],
      kind: "Internal IP",
      year: "2020",
      summary: "My first project at Hitachi Solutions: developing the company’s internal PSA IP for Finance & Operations, adapting the core product to evolving requirements with X++ and SQL.",
      role: "Technical consultant",
      stack: ["Finance & Operations", "X++", "SQL"],
      metric: "Core product IP",
      url: "#",
    },
  ],

  // The scroll story: how a project runs with me, stage by stage, as the visitor scrolls.
  // Each stage lights up in turn and drops its deliverables (keep each under ~16 characters).
  story: {
    kicker: "How I deliver · end to end · scroll to run it",
    stages: [
      { name: "Discover", artifacts: ["Workshops", "Process map"], title: "Workshops first", text: "I sit with the business teams and executives to understand the real process before touching a tool." },
      { name: "Define", artifacts: ["Requirements", "Fit-gap", "Scope"], title: "Requirements & scope", text: "Needs become clear requirements, a fit-gap against the platform and a scope everyone agrees on." },
      { name: "Build", artifacts: ["Apps & flows", "C# plugins", "Integrations"], title: "Build on the platform", text: "Canvas and model-driven apps, Power Automate, C# plugins, TypeScript web resources and the integrations around them." },
      { name: "Ship", artifacts: ["Test cycles", "CI/CD pipeline"], title: "Test and ship safely", text: "Tested in cycles and released through Azure DevOps pipelines: fewer errors, faster releases, approvals built in." },
      { name: "Handover", artifacts: ["Training", "Documentation"], title: "Hand over, stay close", text: "Users are trained, the team gets documentation and a clean handover — and I stay around for the questions." },
    ],
  },

  testimonial: {
    label: "Recommendation letter",
    title: "Recommended for rigour, dedication and teamwork",
    // Translated from the Portuguese original of the recommendation letter.
    quote: "João carried out every project and task with the utmost commitment and dedication, showing rigour and high standards in every phase — an excellent candidate for any role in his field.",
    author: "Daniel Vinhas",
    context: "myPartner · software engineering internship",
    traits: ["Commitment", "Rigour", "Teamwork"],
  },

  // "My path": the life timeline that slides sideways as the visitor scrolls (oldest first).
  path: [
    { year: "2017", tag: "Study", title: "Computer Engineering at ISEP", text: "Started a BSc in Computer Engineering at ISEP, in Porto." },
    { year: "2020", tag: "Internship", title: "First Microsoft project", text: "Internship at myPartner: a Power Platform canvas app that optimised employee routes with Google APIs." },
    { year: "2020", tag: "Career", title: "Degree done, Hitachi Solutions", text: "Finished the BSc and joined Hitachi Solutions as a Finance & Operations consultant: X++, SQL, Dataverse, Dual Write." },
    { year: "2020", tag: "Study", title: "A master's, while working", text: "Started an MSc in Software Engineering at ISEP — alongside a full-time job." },
    { year: "2022", tag: "Study", title: "MSc in Software Engineering", text: "Graduated while delivering ERP projects for government and enterprise clients." },
    { year: "2023", tag: "Career", title: "Into Power Platform", text: "Moved to CRM and Power Platform, became a Senior Technical Consultant and completed Hitachi's Power Platform L&D programme." },
    { year: "2025", tag: "Projects", title: "A year of UK projects", text: "Permits for a UK local authority, FinOps integrations, a government pre-sales PoC, a five-system integration and a solo end-to-end delivery." },
    { year: "2026", tag: "Now", title: "Today", text: "FinOps integrations for a UK retailer, and mentoring the next consultants." },
  ],

  experience: [
    {
      period: "2023 — Now",
      company: "Hitachi Solutions Europe",
      role: "Senior Technical Consultant · Power Platform & FinOps",
      summary: "Design and deliver automation and integration projects across CE / Power Platform and Finance & Operations for 10+ European subsidiaries, impacting 200+ users.",
      highlights: [
        "Build Finance & Operations integrations, inbound and outbound through the Hitachi Integration Framework, alongside CRM and Power Platform work",
        "Run workshops with cross-functional teams and executives, turning business needs into scalable solutions",
        "Manage CI/CD pipelines for smooth deployments and operational continuity",
        "Mentor new and junior consultants; deliver internal training on Power Platform, Azure Functions and FinOps",
      ],
    },
    {
      period: "2020 — 2023",
      company: "Hitachi Solutions Europe",
      role: "Technical Consultant · Finance & Operations",
      summary: "Delivered ERP projects for government and enterprise clients, adapting core IP to evolving requirements.",
      highlights: [
        "Automated solution lifecycles, enforced SEPA compliance and improved codebase maintainability",
        "Led onboarding and training for new consultants on development and lifecycle concepts",
      ],
    },
    {
      period: "Mar — Jul 2020",
      company: "myPartner",
      role: "Microsoft Developer · Internship",
      summary: "Built a Power Platform canvas app for employee route optimisation using Google APIs.",
      highlights: ["Authored the training material for knowledge transfer and was commended for its quality"],
    },
  ],

  education: [
    { period: "2020 — 2022", title: "MSc Software Engineering", place: "ISEP — Instituto Superior de Engenharia do Porto" },
    { period: "2017 — 2020", title: "BSc Computer Engineering", place: "ISEP — Instituto Superior de Engenharia do Porto" },
    { period: "2023", title: "Power Platform L&D Programme — Analyst", place: "Hitachi Solutions · Dataverse, plugins, PCF, Custom APIs, ALM" },
  ],

  toolbox: [
    { title: "Power Platform", icon: "layers", body: "Canvas and model-driven apps, Power Pages and PCF components that people actually adopt.", tags: ["Power Apps", "Power Pages", "PCF"] },
    { title: "Automation", icon: "flow", body: "Power Automate flows with approvals, error handling and real-time event processing.", tags: ["Power Automate", "AWS events", "Dox42"] },
    { title: "Integrations", icon: "link", body: "CRM, ERP and third-party systems talking to each other reliably.", tags: ["Dual Write", "Dataverse", "REST"] },
    { title: "Pro-code", icon: "code", body: "Sync and async C# plugins, Custom APIs, TypeScript web resources and X++.", tags: ["C#", "TypeScript", "X++"] },
    { title: "Delivery", icon: "check", body: "Workshops, requirements, ALM and CI/CD — and mentoring the next consultants.", tags: ["Azure DevOps", "ALM", "Mentoring"] },
  ],
};
