import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { r2Url } from "../src/lib/r2";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.appScreenshot.deleteMany();
  await prisma.app.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.workExperience.deleteMany();
  await prisma.skillCategory.deleteMany();
  await prisma.directoryLink.deleteMany();
  await prisma.heroLink.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.siteSettings.deleteMany();

  await prisma.siteSettings.create({
    data: {
      id: "site",
      accentPreset: "moss",
      accentColor: "#4F7A68",
    },
  });

  // Profile
  await prisma.profile.create({
    data: {
      name: "Argya Aulia Fauzandika",
      role: "Mobile Developer (Flutter)",
      intro: "I build scalable Flutter apps that don\u2019t just work\u2014but are fast, maintainable, and designed to deliver real user value.",
      location: "Bandung, Indonesia",
      openToOpportunities: true,
      photoSrc: r2Url("/data/myself/me.jpg"),
      photoAlt: "Portrait of Argya Aulia Fauzandika",
      photoWidth: 400,
      photoHeight: 500,
    },
  });

  // Contact
  await prisma.contact.create({
    data: {
      email: "argyaauliaf@gmail.com",
      whatsapp: "https://wa.me/6289674064808",
      github: "https://github.com/gyaaufau",
      linkedin: "https://www.linkedin.com/in/argyaaf/",
      playStore: "https://play.google.com/store/apps/developer?id=Gialoop",
      playConsole: "https://play.google.com/store/apps/developer?id=Gialoop",
      cv: "/cv",
    },
  });

  // Hero Links
  await prisma.heroLink.createMany({
    data: [
      { label: "View my work", href: "#apps", kind: "primary", note: "Jump to selected work.", order: 0 },
      { label: "Download CV", href: "/cv", kind: "secondary", note: "Open the local PDF viewer for my latest CV.", order: 1 },
    ],
  });

  // Directory Links
  await prisma.directoryLink.createMany({
    data: [
      { title: "CV", value: "Resume download", href: "/cv", caption: "Open the local PDF viewer for the latest resume.", order: 0 },
      { title: "Play Store Developer", value: "Developer profile", href: "https://play.google.com/store/apps/developer?id=Gialoop", caption: "Publisher or app listing link.", order: 1 },
      { title: "GitHub", value: "Code archive", href: "https://github.com/gyaaufau", caption: "Code, experiments, and shipped work.", order: 2 },
      { title: "LinkedIn", value: "Professional profile", href: "https://www.linkedin.com/in/argyaaf/", caption: "Career timeline and networking profile.", order: 3 },
      { title: "WhatsApp", value: "Quick chat", href: "https://wa.me/6289674064808", caption: "Fastest contact for direct conversation.", order: 4 },
      { title: "Email", value: "argyaauliaf@gmail.com", href: "mailto:argyaauliaf@gmail.com", caption: "Best for collaboration and freelance inquiries.", order: 5 },
    ],
  });

  // Skill Categories
  await prisma.skillCategory.createMany({
    data: [
      { name: "skills", items: ["Flutter", "Dart", "BLoC/Cubit", "Clean Architecture", "Melos", "Dependency Injection", "Performance", "Security", "Play store publishing"] },
      { name: "tech", items: ["Firebase", "Supabase", "Appwrite", "REST API", "Git", "Google ML Kit", "Revenue Cat", "CI/CD Codemagic", "Figma", "Postman", "Flutter Devtool"] },
      { name: "softSkills", items: ["Adaptability", "Strong ownership and independent work", "Collaborative teamwork", "Continuous learning mindset", "Effective time management"] },
    ],
  });

  // Apps (migrated from projects)
  const shou = await prisma.app.create({
    data: {
      id: "shou",
      title: "Shou Project",
      slug: "shou",
      tagline: "Discover, save, and follow city-based events with a focus on Japanese culture.",
      description: "Shou Project is a Flutter mobile application designed to help users discover, save, and follow information about city-based events, with a primary focus on Japanese culture events through onboarding, authentication, search, bookmarks, event details, and profile management in one modular application.",
      featured: true,
      appType: "mobile",
      workType: "work",
      period: "October 2022 - March 2023",
      periodShort: "Oct 2022 - Mar 2023",
      sortOrder: 40,
      appIconSrc: r2Url("/data/project/01_shou/logo/app_icon.png"),
      appIconAlt: "Shou Project logo",
      thumbnailSrc: r2Url("/data/project/01_shou/logo/app_icon.png"),
      thumbnailAlt: "Shou Project thumbnail",
      stack: ["Flutter", "Dart", "dio", "flutter_bloc", "hydrated_bloc", "GoRouter", "GetIt", "Hive", "SharedPreferences", "melos"],
      highlights: [
        "User onboarding and authentication, including login, registration, and forgot password.",
        "City-based event home screen with location integration and manual city selection, especially for exploring Japanese culture events.",
        "Full event listing, event search, and locally stored search history.",
        "Event detail pages with schedule, category, location, time, and description.",
        "Event bookmarking, dark mode, and user profile management.",
      ],
      sections: [
        { title: "Problems Solved", entries: [{ paragraphs: [], bullets: [
          "Users needed a fast way to discover relevant events based on their city or current location.",
          "Japanese culture event communities needed a more focused channel to find events that matched their interests.",
          "Event information needed to be organized into a flow that was easy to follow from listings and search to detailed agendas.",
          "The app needed to remain convenient to use with local state for onboarding, preferences, search history, and bookmarks.",
        ], codeBlocks: [] }] },
        { title: "Project Architecture", entries: [{ paragraphs: ["This project uses a modular monorepo approach with melos, separating features, domains, shared_libraries, and resources so dependencies, use cases, repositories, UI, and reusable components stay isolated. Its implementation follows a lightweight clean architecture style with separation between data sources, repository interfaces/implementations, entities/DTOs, dependency injection via GetIt, and Bloc/Cubit-based state management."], bullets: [], codeBlocks: [] }] },
        { title: "Impact", entries: [{ paragraphs: [], bullets: [
          "Delivered a solid event discovery application foundation covering the core flow from user acquisition to event exploration and saving, with strong positioning around Japanese culture events.",
          "Provided a modular codebase that is easier to extend per domain or feature compared with a single-structure Flutter app.",
          "Simplified backend integration for events and user profiles through cleaner separation of repositories, use cases, and data sources.",
        ], codeBlocks: [] }] },
      ],
    },
  });

  const shouScreenshots = [
    { src: r2Url("/data/project/01_shou/screenshots/Simulator Screenshot - iPhone 15 Pro - 2026-05-01 at 18.05.19.png"), alt: "Shou screenshot 1", width: 887, height: 1920 },
    { src: r2Url("/data/project/01_shou/screenshots/Simulator Screenshot - iPhone 15 Pro - 2026-05-01 at 18.16.59.png"), alt: "Shou screenshot 2", width: 887, height: 1920 },
    { src: r2Url("/data/project/01_shou/screenshots/Simulator Screenshot - iPhone 15 Pro - 2026-05-01 at 18.17.02.png"), alt: "Shou screenshot 3", width: 887, height: 1920 },
    { src: r2Url("/data/project/01_shou/screenshots/Simulator Screenshot - iPhone 15 Pro - 2026-05-01 at 18.17.07.png"), alt: "Shou screenshot 4", width: 887, height: 1920 },
    { src: r2Url("/data/project/01_shou/screenshots/Simulator Screenshot - iPhone 15 Pro - 2026-05-01 at 18.17.13.png"), alt: "Shou screenshot 5", width: 887, height: 1920 },
  ];
  await prisma.appScreenshot.createMany({
    data: shouScreenshots.map((s, i) => ({ ...s, order: i, appId: shou.id })),
  });

  const otolog = await prisma.app.create({
    data: {
      id: "otolog",
      title: "OtoLog",
      slug: "otolog",
      tagline: "Record service history, monitor costs, and manage multiple vehicles.",
      description: "OtoLog is a Flutter mobile application that helps vehicle owners record service history, monitor maintenance costs, and manage multiple vehicles in one place. The project was built to provide cleaner maintenance records, easier lookup, and a fully local experience without depending on a backend.",
      featured: true,
      appType: "mobile",
      workType: "personal",
      period: "March 2026 - April 2026",
      periodShort: "Mar 2026 - Apr 2026",
      sortOrder: 30,
      appStoreUrl: null,
      playStoreUrl: "https://play.google.com/store/apps/details?id=com.gialoop.otolog",
      websiteUrl: null,
      githubUrl: "https://github.com/gyaaufau/otolog",
      appIconSrc: r2Url("/data/project/02_otolog/logo/otolog_app_icon_1024.png"),
      appIconAlt: "OtoLog logo",
      thumbnailSrc: r2Url("/data/project/02_otolog/logo/otolog_app_icon_1024.png"),
      thumbnailAlt: "OtoLog thumbnail",
      stack: ["Flutter", "flutter_bloc (Cubit)", "Drift + SQLite", "GetIt", "GoRouter"],
      highlights: [
        "Multi-vehicle management with vehicle details, a primary vehicle, and vehicle search.",
        "Full service records covering service type, date, odometer, cost, mechanic, and extra notes.",
        "A compact dashboard for active vehicles, service summaries, and quick actions.",
        "A service logs page with search, vehicle filters, and date-range filters.",
        "Per-vehicle service statistics with charts for total cost, frequency, service distribution, and spending trends.",
      ],
      sections: [
        { title: "Problems Solved", entries: [{ paragraphs: [], bullets: [
          "Vehicle service history is often scattered across chats, paper receipts, or manual notes that are hard to trace later.",
          "Vehicle owners struggle to see total maintenance cost and service patterns over time.",
          "Managing multiple vehicles in one place requires a flow that stays simple and fast to use.",
        ], codeBlocks: [] }] },
        { title: "Project Architecture", entries: [{ paragraphs: ["This project uses a lightweight modular approach with clear separation between screens, widgets, cubit, repositories, database, and shared. State management is handled by Cubit, dependency injection uses GetIt, navigation uses GoRouter, and local persistence is built on Drift/SQLite so the data flow stays simple, testable, and well-suited for an offline-first app."], bullets: [], codeBlocks: [] }] },
        { title: "Impact", entries: [{ paragraphs: [], bullets: [
          "Made vehicle maintenance history more structured and easier to search in one application.",
          "Provided clearer visibility into total service costs and maintenance trends.",
          "Produced a Flutter portfolio app that demonstrates strength in state management, local databases, routing, localization, and data visualization.",
        ], codeBlocks: [] }] },
      ],
    },
  });

  const otologScreenshots = [
    { src: r2Url("/data/project/02_otolog/screenshots/Simulator Screenshot - iPhone 15 Pro - 2026-05-01 at 18.05.19.png"), alt: "OtoLog screenshot 1", width: 887, height: 1920 },
    { src: r2Url("/data/project/02_otolog/screenshots/Simulator Screenshot - iPhone 15 Pro - 2026-05-01 at 18.16.59.png"), alt: "OtoLog screenshot 2", width: 887, height: 1920 },
    { src: r2Url("/data/project/02_otolog/screenshots/Simulator Screenshot - iPhone 15 Pro - 2026-05-01 at 18.17.02.png"), alt: "OtoLog screenshot 3", width: 887, height: 1920 },
    { src: r2Url("/data/project/02_otolog/screenshots/Simulator Screenshot - iPhone 15 Pro - 2026-05-01 at 18.17.07.png"), alt: "OtoLog screenshot 4", width: 887, height: 1920 },
    { src: r2Url("/data/project/02_otolog/screenshots/Simulator Screenshot - iPhone 15 Pro - 2026-05-01 at 18.17.13.png"), alt: "OtoLog screenshot 5", width: 887, height: 1920 },
  ];
  await prisma.appScreenshot.createMany({
    data: otologScreenshots.map((s, i) => ({ ...s, order: i, appId: otolog.id })),
  });

  const litbang = await prisma.app.create({
    data: {
      id: "litbang-au-app",
      title: "Litbang TNI AU App",
      slug: "litbang-au-app",
      tagline: "Internal document distribution, approvals, and cross-role tracking.",
      description: "Litbang TNI AU App is an internal Flutter application built to support document distribution, follow-up actions, approvals, and cross-role tracking within the Litbang TNI AU environment.",
      featured: true,
      appType: "mobile",
      workType: "work",
      period: "August 2025 - September 2025",
      periodShort: "Aug 2025 - Sep 2025",
      sortOrder: 20,
      appIconSrc: r2Url("/data/project/03_litbang_au_app/logo/logo.png"),
      appIconAlt: "Litbang TNI AU App logo",
      thumbnailSrc: r2Url("/data/project/03_litbang_au_app/logo/logo.png"),
      thumbnailAlt: "Litbang TNI AU App thumbnail",
      stack: ["Flutter", "Dart", "flutter_bloc", "go_router", "dio", "get_it", "flutter_secure_storage", "shared_preferences", "sqflite", "Firebase Core", "Cloud Firestore"],
      highlights: [
        "Authentication and session handling with secure storage.",
        "Document lists with categories such as TANDA_TANGAN, INFORMASI, and TINDAK_LANJUT.",
        "Document detail views containing files, involved parties, and process history.",
        "Role-based workflows for accept, sign, response, forward, and add people actions.",
        "Direct file download and open flow from the device.",
        "Multi-environment setup for development, staging, and production.",
      ],
      sections: [
        { title: "Problems Solved", entries: [{ paragraphs: [], bullets: [
          "Internal document distribution was still slow because many steps were handled manually.",
          "Document status was difficult to monitor end to end.",
          "Cross-role coordination for reading, approving, and following up on documents was not efficient.",
          "Files and response history were scattered, increasing the risk of miscommunication.",
        ], codeBlocks: [] }] },
        { title: "Project Architecture", entries: [{ paragraphs: ["This project uses a feature-based modular approach. The main layers are separated into feature areas, shared utilities, resources, and app configuration, making business logic, dependencies, storage, and UI components easier to maintain and extend."], bullets: [], codeBlocks: [] }] },
        { title: "Impact", entries: [{ paragraphs: [], bullets: [
          "Digitized the internal document flow with role-based workflows.",
          "Accelerated document distribution and follow-up processes.",
          "Improved visibility into read status, approvals, and process history.",
          "Demonstrated the ability to build an internal Flutter application with modular architecture and complex business flows.",
        ], codeBlocks: [] }] },
      ],
    },
  });

  const litbangScreenshots = [
    { src: r2Url("/data/project/03_litbang_au_app/screenshots/Simulator Screenshot - iPhone 15 Pro - 2026-05-01 at 18.05.19.png"), alt: "Litbang screenshot 1", width: 887, height: 1920 },
    { src: r2Url("/data/project/03_litbang_au_app/screenshots/Simulator Screenshot - iPhone 15 Pro - 2026-05-01 at 18.16.59.png"), alt: "Litbang screenshot 2", width: 887, height: 1920 },
    { src: r2Url("/data/project/03_litbang_au_app/screenshots/Simulator Screenshot - iPhone 15 Pro - 2026-05-01 at 18.17.02.png"), alt: "Litbang screenshot 3", width: 887, height: 1920 },
  ];
  await prisma.appScreenshot.createMany({
    data: litbangScreenshots.map((s, i) => ({ ...s, order: i, appId: litbang.id })),
  });

  const ditonton = await prisma.app.create({
    data: {
      id: "ditonton",
      title: "Ditonton",
      slug: "ditonton",
      tagline: "Film and TV series catalog with search, detail, and local watchlist.",
      description: "Ditonton adalah aplikasi katalog film dan serial TV berbasis Flutter yang dibuat sebagai submission awal kelas Dicoding Flutter Expert. Project ini berfokus pada implementasi alur inti discovery konten, pencarian, detail, rekomendasi, dan watchlist lokal dengan struktur codebase yang rapi dan mudah dikembangkan.",
      featured: false,
      appType: "mobile",
      workType: "personal",
      period: "Not published",
      periodShort: "N/A",
      sortOrder: 10,
      appIconSrc: r2Url("/data/project/04_ditonton/logo/circle-g.png"),
      appIconAlt: "Ditonton logo",
      thumbnailSrc: r2Url("/data/project/04_ditonton/logo/circle-g.png"),
      thumbnailAlt: "Ditonton thumbnail",
      stack: ["Flutter", "Provider", "GetIt", "GoRouter", "Sqflite", "Dartz"],
      highlights: [
        "Halaman beranda film dengan kategori now playing, popular, dan top rated.",
        "Halaman serial TV dengan kategori on the air, popular, dan top rated.",
        "Pencarian terpisah untuk film dan serial TV.",
        "Halaman detail untuk film dan serial TV beserta rekomendasi konten terkait.",
        "Watchlist lokal untuk film dan serial TV menggunakan SQLite.",
      ],
      sections: [
        { title: "Problems Solved", entries: [{ paragraphs: [], bullets: [
          "Menyediakan satu aplikasi untuk menjelajahi film dan serial TV dalam beberapa kategori populer tanpa memecah pengalaman pengguna.",
          "Menyimpan daftar tontonan pengguna secara lokal agar item yang ingin ditonton ulang tetap mudah diakses.",
          "Menjadi baseline submission yang menunjukkan pemisahan layer, dependency injection, dan pengujian pada aplikasi Flutter skala menengah.",
        ], codeBlocks: [] }] },
        { title: "Architecture", entries: [{ paragraphs: ["Project ini memakai pendekatan clean architecture sederhana dengan pemisahan presentation, domain, dan data. State dikelola lewat Provider, dependency di-register melalui GetIt, lalu repository menjadi batas antara remote data source, local data source, dan use case agar alur fitur tetap modular dan mudah diuji."], bullets: [], codeBlocks: [] }] },
        { title: "Impact", entries: [{ paragraphs: [], bullets: [
          "Menghasilkan aplikasi submission awal yang sudah mencakup alur utama browsing, pencarian, detail, rekomendasi, dan watchlist.",
          "Menunjukkan penerapan dependency injection, repository pattern, dan pemisahan layer yang siap dikembangkan ke submission tahap berikutnya.",
          "Menyediakan cakupan unit test dan widget test pada layer data, domain, dan presentation untuk membantu validasi perilaku aplikasi.",
        ], codeBlocks: [] }] },
      ],
    },
  });

  const ditontonScreenshots = [
    { src: r2Url("/data/project/04_ditonton/screenshots/Simulator Screenshot - iPhone 15 Pro - 2026-05-01 at 18.05.19.png"), alt: "Ditonton screenshot 1", width: 887, height: 1920 },
    { src: r2Url("/data/project/04_ditonton/screenshots/Simulator Screenshot - iPhone 15 Pro - 2026-05-01 at 18.16.59.png"), alt: "Ditonton screenshot 2", width: 887, height: 1920 },
    { src: r2Url("/data/project/04_ditonton/screenshots/Simulator Screenshot - iPhone 15 Pro - 2026-05-01 at 18.17.02.png"), alt: "Ditonton screenshot 3", width: 887, height: 1920 },
  ];
  await prisma.appScreenshot.createMany({
    data: ditontonScreenshots.map((s, i) => ({ ...s, order: i, appId: ditonton.id })),
  });

  // Certificates
  await prisma.certificate.createMany({
    data: [
      {
        id: "dicoding-developer-conference-2026",
        title: "Dicoding Developer Conference 2026",
        featured: true,
        issuer: "Dicoding Indonesia",
        issued: "25 April 2026",
        type: "Attendance Certificate",
        summary: "Attendance certificate for participating in Dicoding Developer Conference 2026 organized by Dicoding Indonesia. This certificate reflects active involvement in a developer-focused event covering technology, learning, and industry insight.",
        details: [
          "Participated in a major developer conference hosted by Dicoding.",
          "Stayed connected with current discussions, trends, and insights in the Indonesian tech ecosystem.",
          "Showed commitment to continuous learning through industry events and community-driven knowledge sharing.",
        ],
        relevance: "This certificate shows consistency in staying active within the developer community, not only through building products but also through attending industry events that broaden perspective and keep technical knowledge current.",
        issuerNotes: ["Dicoding Indonesia", "Signed by Narenda Wicaksono, CEO Dicoding Indonesia"],
        imageSrc: r2Url("/data/certifications/dicoding-developer-conference-2026/certificate.jpg"),
        imageAlt: "Dicoding Developer Conference 2026 certificate preview",
        imageWidth: 800,
        imageHeight: 600,
      },
      {
        id: "dicoding-flutter-developer-expert",
        title: "Dicoding Flutter Developer Expert",
        featured: true,
        issuer: "Dicoding Indonesia",
        issued: "9 May 2026",
        type: "Course Completion Certificate",
        summary: "Certificate of completion for the Menjadi Flutter Developer Expert class by Dicoding Indonesia. This certification reflects advanced learning in Flutter development, including Clean Architecture, testing, performance optimization, security, analytics, and CI/CD.",
        details: [
          "Completed an advanced Flutter development class by Dicoding Indonesia.",
          "Strengthened knowledge in Clean Architecture, testing, performance, security, analytics, and CI/CD.",
          "Demonstrated commitment to continuous learning and improving professional Flutter development skills.",
        ],
        relevance: "This certificate demonstrates continued growth as a Flutter developer through structured learning, strengthening the technical foundation needed to build maintainable, production-ready mobile applications.",
        issuerNotes: ["Dicoding Indonesia", "Signed by Narenda Wicaksono, CEO Dicoding Indonesia"],
        imageSrc: r2Url("/data/certifications/dicoding-flutter-developer-expert/certificate.jpg"),
        imageAlt: "Dicoding Flutter Developer Expert certificate preview",
        imageWidth: 800,
        imageHeight: 600,
      },
      {
        id: "flutter-e-commerce-bootcamp",
        title: "Flutter E-commerce Bootcamp",
        featured: true,
        issuer: "Android Enthusiast Jakarta",
        issued: "25 August 2022",
        type: "Bootcamp Certificate",
        summary: "Certificate of completion for passing the Flutter E-commerce Bootcamp organized by Android Enthusiast Jakarta. This certificate reflects structured hands-on learning in building Flutter applications around e-commerce use cases.",
        details: [
          "Completed a bootcamp focused on Flutter-based application development.",
          "Built understanding of mobile app flow in an e-commerce context.",
          "Learned implementation approaches such as clean architecture and modularization using melos.",
          "Strengthened practical foundation in UI implementation, app structure, and feature delivery with Flutter.",
          "Practiced development best practices for organizing code, separating responsibilities, and keeping projects easier to scale.",
        ],
        relevance: "This certificate marks one of the earlier milestones in the journey of learning Flutter seriously. It shows commitment to learning not only feature building, but also maintainable architecture patterns, modular project organization, and better engineering best practices for long-term app development.",
        issuerNotes: ["Android Enthusiast Jakarta", "Signed by Fiqri Hafzain Islami, Co-Founder of Android Enthusiast Jakarta"],
        imageSrc: r2Url("/data/certifications/flutter-e-commerce-bootcamp/certificate.jpg"),
        imageAlt: "Flutter E-commerce Bootcamp certificate preview",
        imageWidth: 800,
        imageHeight: 600,
      },
    ],
  });

  // Work Experiences
  await prisma.workExperience.createMany({
    data: [
      {
        company: "Shou Corp",
        location: "Jakarta",
        role: "Flutter Developer Part Time",
        start: "October 2022",
        end: "March 2023",
        period: "Oct 2022 - Mar 2023",
        sortOrder: 1,
        summary: "Worked part-time as a Flutter developer on an event management platform connecting organizers with service providers.",
        highlights: [
          "Built a prototype event management app connecting organizers with service providers.",
          "Translated UI/UX designs and requirements into a functional mobile application.",
          "Delivered an MVP for early validation and feedback.",
        ],
      },
      {
        company: "LKP Grafologi Indonesia",
        location: "Bandung",
        role: "UI/UX Designer Part Time",
        start: "December 2024",
        end: "February 2025",
        period: "Dec 2024 - Feb 2025",
        sortOrder: 2,
        summary: "Led the UI/UX redesign of an online course website and LMS, improving user flows, usability, and content accessibility.",
        highlights: [],
      },
      {
        company: "Litbang TNI AU",
        location: "Bandung",
        role: "Flutter Developer Freelance",
        start: "August 2025",
        end: "September 2025",
        period: "Aug 2025 - Sep 2025",
        sortOrder: 3,
        summary: "Built a secure Flutter-based digital correspondence platform for Litbang TNI AU.",
        highlights: [
          "Built a digital correspondence platform to replace manual workflows.",
          "Worked with PM and UI/UX to align features with requirements.",
          "Integrated APIs for data sync and digital signatures.",
          "Implemented document routing and tracking for better transparency and efficiency.",
        ],
      },
      {
        company: "Mindo Education",
        location: "Jakarta",
        role: "UI/UX Designer Freelance",
        start: "October 2025",
        end: "November 2025",
        period: "Oct 2025 - Nov 2025",
        sortOrder: 4,
        summary: "Designed the UI/UX for the Partnership section of the landing page, improving clarity, hierarchy, and user flow.",
        highlights: [],
      },
      {
        company: "Gialoop (Independent)",
        location: "Bandung",
        role: "Mobile Indie Developer",
        start: "Feb 2026",
        end: "Present",
        period: "Feb 2026 - Present",
        sortOrder: 5,
        summary: "Conceptualized, developed, and published production-ready mobile applications to the Google Play Store, managing the full product lifecycle from UI/UX design to deployment.",
        highlights: [
          "Built and published OtoLog, a vehicle service history tracker and maintenance cost monitoring application.",
          "Built Lariss: UMKM POS (Closed Testing), a Point of Sale application using clean architecture and Cubit/BLoC state management designed to help small businesses manage daily transactions and operations efficiently.",
          "Built SkinSense: AI Skin Insight (Closed Testing), an AI-powered skincare application built with Flutter featuring face analysis, OCR ingredient scanning, and skincare compatibility analysis by integrating Google ML Kit and optimized image preprocessing pipelines.",
        ],
      },
    ],
  });

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
