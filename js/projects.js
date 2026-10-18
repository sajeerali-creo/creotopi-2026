/* ==========================================================
   CREOTOPI — CONTENT FILE
   Edit ONLY this file to change projects / studio info.

   HOW TO ADD YOUR BEHANCE WORK
   1. Drop cover images into  /assets/projects/  (jpg/png/webp)
   2. Replace the placeholder entries below with your real ones:
        title : project name
        tag   : category (Branding, UI/UX, Web ...)
        date  : "MM.YY"
        cover : "assets/projects/your-image.jpg"   (leave "" for gradient placeholder)
        url   : your Behance project link
   Entries with cover:"" render a gradient placeholder so the layout works now.
   ========================================================== */

window.CREOTOPI = {
  studio: {
    name: "Creotopi",
    tagline: "Design agency crafting bold brands & digital experiences.",
    behance: "https://www.behance.net/creotopi",
    email: "hello@creotopi.com",          // TODO: replace with your real email
    timezone: "Asia/Dubai",                // clock shown top-left
    cityCode: "DXB"
  },

  // PLACEHOLDER PROJECTS — replace with your Behance projects
  projects: [
    { title: "Project 01", tag: "Branding", date: "01.25", cover: "assets/projects/project-01.jpg", url: "https://www.behance.net/creotopi", g: ["#2f6f86", "#d8452f"] },
    { title: "Project 02", tag: "UI/UX",    date: "02.25", cover: "assets/projects/project-02.jpg", url: "https://www.behance.net/creotopi", g: ["#e9c9d6", "#c7a3e0"] },
    { title: "Project 03", tag: "Web",      date: "03.25", cover: "assets/projects/project-03.jpg", url: "https://www.behance.net/creotopi", g: ["#a9e3c8", "#f2a28f"] },
    { title: "Project 04", tag: "Branding", date: "04.25", cover: "assets/projects/project-04.jpg", url: "https://www.behance.net/creotopi", g: ["#a9b4e8", "#f1b8d3"] },
    { title: "Project 05", tag: "Social",   date: "05.25", cover: "assets/projects/project-05.jpg", url: "https://www.behance.net/creotopi", g: ["#e86a3a", "#1f2a44"] },
    { title: "Project 06", tag: "UI/UX",    date: "06.25", cover: "assets/projects/project-06.jpg", url: "https://www.behance.net/creotopi", g: ["#cfe8a8", "#6aa6c9"] }
  ],

  services: [
    { n: "001", title: "BRANDING",    text: "We craft logos and brand systems that feel unmistakably yours.", color: "#d9d0e8", icon: "a" },
    { n: "002", title: "UI / UX",     text: "Thoughtful interfaces designed around real people and real goals.", color: "#cdf1ae", icon: "b" },
    { n: "003", title: "WEB DESIGN",  text: "Beautiful, functional websites built to perform and impress.", color: "#ebc0c1", icon: "c" },
    { n: "004", title: "SOCIAL & MOTION", text: "Scroll-stopping visuals and motion for every channel.", color: "#f3ead8", icon: "a" }
  ],

  faq: [
    { q: "What does a project look like from start to finish?", a: "We start with a short discovery call, move into concept and design, share work in clear review rounds, then deliver final files ready to use." },
    { q: "How can we start working together?", a: "Send us a message with a few details about your project and we'll reply to set up an intro call." },
    { q: "Do you take on small projects?", a: "Yes — from a single logo to a full brand and website. Tell us what you need and we'll suggest the right scope." },
    { q: "Where can I see more of your work?", a: "Our full portfolio lives on Behance: behance.net/creotopi." }
  ]
};
