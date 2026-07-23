-- Supabase seed SQL
-- Run this AFTER supabase-tables.sql in Supabase SQL Editor
-- Storage URLs:
--   Portfolio: https://pkzdlrxgfwlklomdwgfz.supabase.co/storage/v1/object/public/portfolio/
--   Apps:      https://pkzdlrxgfwlklomdwgfz.supabase.co/storage/v1/object/public/apps/

-- Site Settings
INSERT INTO site_settings (id, accent_preset, accent_color) VALUES
  ('site', 'moss', '#4F7A68')
ON CONFLICT (id) DO NOTHING;

-- Profile
INSERT INTO profile (id, name, role, intro, location, open_to_opportunities, photo_src, photo_alt, photo_width, photo_height) VALUES
  ('profile-1', 'Argya Aulia Fauzandika', 'Mobile Developer (Flutter)', 'I build scalable Flutter apps that don''t just work—they are fast, maintainable, and designed to deliver real user value.', 'Bandung, Indonesia', true,
   'https://pkzdlrxgfwlklomdwgfz.supabase.co/storage/v1/object/public/portfolio/data/myself/me.webp',
   'Portrait of Argya Aulia Fauzandika', 400, 500);

-- Contact
INSERT INTO contact (id, email, whatsapp, github, linkedin, play_store, play_console, cv) VALUES
  ('contact-1', 'argyaauliaf@gmail.com', 'https://wa.me/6289674064808', 'https://github.com/gyaaufau', 'https://www.linkedin.com/in/argyaaf/',
   'https://play.google.com/store/apps/developer?id=Gialoop', 'https://play.google.com/store/apps/developer?id=Gialoop', '/cv');

-- Hero Links
INSERT INTO hero_link (id, label, href, kind, note, "order") VALUES
  ('hero-1', 'View my work', '#apps', 'primary', 'Jump to selected work.', 0),
  ('hero-2', 'Download CV', '/cv', 'secondary', 'Open the local PDF viewer for my latest CV.', 1);

-- Directory Links
INSERT INTO directory_link (id, title, value, href, caption, "order") VALUES
  ('dir-1', 'CV', 'Resume download', '/cv', 'Open the local PDF viewer for the latest resume.', 0),
  ('dir-2', 'Play Store Developer', 'Developer profile', 'https://play.google.com/store/apps/developer?id=Gialoop', 'Publisher or app listing link.', 1),
  ('dir-3', 'GitHub', 'Code archive', 'https://github.com/gyaaufau', 'Code, experiments, and shipped work.', 2),
  ('dir-4', 'LinkedIn', 'Professional profile', 'https://www.linkedin.com/in/argyaaf/', 'Career timeline and networking profile.', 3),
  ('dir-5', 'WhatsApp', 'Quick chat', 'https://wa.me/6289674064808', 'Fastest contact for direct conversation.', 4),
  ('dir-6', 'Email', 'argyaauliaf@gmail.com', 'mailto:argyaauliaf@gmail.com', 'Best for collaboration and freelance inquiries.', 5);

-- Skill Categories
INSERT INTO skill_category (id, name, items) VALUES
  ('skill-1', 'skills', ARRAY['Flutter','Dart','BLoC/Cubit','Clean Architecture','Melos','Dependency Injection','Performance','Security','Play store publishing']),
  ('skill-2', 'tech', ARRAY['Firebase','Supabase','Appwrite','REST API','Git','Google ML Kit','Revenue Cat','CI/CD Codemagic','Figma','Postman','Flutter Devtool']),
  ('skill-3', 'softSkills', ARRAY['Adaptability','Strong ownership and independent work','Collaborative teamwork','Continuous learning mindset','Effective time management']);

-- Apps
INSERT INTO app (id, title, slug, tagline, description, featured, app_type, work_type, period, period_short, sort_order, play_store_url, github_url, app_icon_src, app_icon_alt, thumbnail_src, thumbnail_alt, stack, highlights, sections) VALUES
  ('shou', 'Shou Project', 'shou', 'Discover, save, and follow city-based events with a focus on Japanese culture.',
   'Shou Project is a Flutter mobile application designed to help users discover, save, and follow information about city-based events, with a primary focus on Japanese culture events through onboarding, authentication, search, bookmarks, event details, and profile management in one modular application.',
   true, 'mobile', 'work', 'October 2022 - March 2023', 'Oct 2022 - Mar 2023', 40, NULL, NULL,
   'https://pkzdlrxgfwlklomdwgfz.supabase.co/storage/v1/object/public/apps/shou/logo/app_icon.webp',
   'Shou Project logo',
   'https://pkzdlrxgfwlklomdwgfz.supabase.co/storage/v1/object/public/apps/shou/logo/app_icon.webp',
   'Shou Project thumbnail',
   ARRAY['Flutter','Dart','dio','flutter_bloc','hydrated_bloc','GoRouter','GetIt','Hive','SharedPreferences','melos'],
   ARRAY['User onboarding and authentication, including login, registration, and forgot password.','City-based event home screen with location integration and manual city selection, especially for exploring Japanese culture events.','Full event listing, event search, and locally stored search history.','Event detail pages with schedule, category, location, time, and description.','Event bookmarking, dark mode, and user profile management.'],
   '[{"title":"Problems Solved","entries":[{"paragraphs":[],"bullets":["Users needed a fast way to discover relevant events based on their city or current location.","Japanese culture event communities needed a more focused channel to find events that matched their interests.","Event information needed to be organized into a flow that was easy to follow from listings and search to detailed agendas.","The app needed to remain convenient to use with local state for onboarding, preferences, search history, and bookmarks."],"codeBlocks":[]}]},{"title":"Project Architecture","entries":[{"paragraphs":["This project uses a modular monorepo approach with melos, separating features, domains, shared_libraries, and resources so dependencies, use cases, repositories, UI, and reusable components stay isolated. Its implementation follows a lightweight clean architecture style with separation between data sources, repository interfaces/implementations, entities/DTOs, dependency injection via GetIt, and Bloc/Cubit-based state management."],"bullets":[],"codeBlocks":[]}]},{"title":"Impact","entries":[{"paragraphs":[],"bullets":["Delivered a solid event discovery application foundation covering the core flow from user acquisition to event exploration and saving, with strong positioning around Japanese culture events.","Provided a modular codebase that is easier to extend per domain or feature compared with a single-structure Flutter app.","Simplified backend integration for events and user profiles through cleaner separation of repositories, use cases, and data sources."],"codeBlocks":[]}]}]'::jsonb),

  ('otolog', 'OtoLog', 'otolog', 'Record service history, monitor costs, and manage multiple vehicles.',
   'OtoLog is a Flutter mobile application that helps vehicle owners record service history, monitor maintenance costs, and manage multiple vehicles in one place. The project was built to provide cleaner maintenance records, easier lookup, and a fully local experience without depending on a backend.',
   true, 'mobile', 'personal', 'March 2026 - April 2026', 'Mar 2026 - Apr 2026', 30,
   'https://play.google.com/store/apps/details?id=com.gialoop.otolog',
   'https://github.com/gyaaufau/otolog',
   'https://pkzdlrxgfwlklomdwgfz.supabase.co/storage/v1/object/public/apps/otolog/logo/otolog_app_icon_1024.webp',
   'OtoLog logo',
   'https://pkzdlrxgfwlklomdwgfz.supabase.co/storage/v1/object/public/apps/otolog/logo/otolog_app_icon_1024.webp',
   'OtoLog thumbnail',
   ARRAY['Flutter','flutter_bloc (Cubit)','Drift + SQLite','GetIt','GoRouter'],
   ARRAY['Multi-vehicle management with vehicle details, a primary vehicle, and vehicle search.','Full service records covering service type, date, odometer, cost, mechanic, and extra notes.','A compact dashboard for active vehicles, service summaries, and quick actions.','A service logs page with search, vehicle filters, and date-range filters.','Per-vehicle service statistics with charts for total cost, frequency, service distribution, and spending trends.'],
   '[{"title":"Problems Solved","entries":[{"paragraphs":[],"bullets":["Vehicle service history is often scattered across chats, paper receipts, or manual notes that are hard to trace later.","Vehicle owners struggle to see total maintenance cost and service patterns over time.","Managing multiple vehicles in one place requires a flow that stays simple and fast to use."],"codeBlocks":[]}]},{"title":"Project Architecture","entries":[{"paragraphs":["This project uses a lightweight modular approach with clear separation between screens, widgets, cubit, repositories, database, and shared. State management is handled by Cubit, dependency injection uses GetIt, navigation uses GoRouter, and local persistence is built on Drift/SQLite so the data flow stays simple, testable, and well-suited for an offline-first app."],"bullets":[],"codeBlocks":[]}]},{"title":"Impact","entries":[{"paragraphs":[],"bullets":["Made vehicle maintenance history more structured and easier to search in one application.","Provided clearer visibility into total service costs and maintenance trends.","Produced a Flutter portfolio app that demonstrates strength in state management, local databases, routing, localization, and data visualization."],"codeBlocks":[]}]}]'::jsonb),

  ('litbang-au-app', 'Litbang TNI AU App', 'litbang-au-app', 'Internal document distribution, approvals, and cross-role tracking.',
   'Litbang TNI AU App is an internal Flutter application built to support document distribution, follow-up actions, approvals, and cross-role tracking within the Litbang TNI AU environment.',
   true, 'mobile', 'work', 'August 2025 - September 2025', 'Aug 2025 - Sep 2025', 20, NULL, NULL,
   'https://pkzdlrxgfwlklomdwgfz.supabase.co/storage/v1/object/public/apps/litbang-au-app/logo/logo.webp',
   'Litbang TNI AU App logo',
   'https://pkzdlrxgfwlklomdwgfz.supabase.co/storage/v1/object/public/apps/litbang-au-app/logo/logo.webp',
   'Litbang TNI AU App thumbnail',
   ARRAY['Flutter','Dart','flutter_bloc','go_router','dio','get_it','flutter_secure_storage','shared_preferences','sqflite','Firebase Core','Cloud Firestore'],
   ARRAY['Authentication and session handling with secure storage.','Document lists with categories such as TANDA_TANGAN, INFORMASI, and TINDAK_LANJUT.','Document detail views containing files, involved parties, and process history.','Role-based workflows for accept, sign, response, forward, and add people actions.','Direct file download and open flow from the device.','Multi-environment setup for development, staging, and production.'],
   '[{"title":"Problems Solved","entries":[{"paragraphs":[],"bullets":["Internal document distribution was still slow because many steps were handled manually.","Document status was difficult to monitor end to end.","Cross-role coordination for reading, approving, and following up on documents was not efficient.","Files and response history were scattered, increasing the risk of miscommunication."],"codeBlocks":[]}]},{"title":"Project Architecture","entries":[{"paragraphs":["This project uses a feature-based modular approach. The main layers are separated into feature areas, shared utilities, resources, and app configuration, making business logic, dependencies, storage, and UI components easier to maintain and extend."],"bullets":[],"codeBlocks":[]}]},{"title":"Impact","entries":[{"paragraphs":[],"bullets":["Digitized the internal document flow with role-based workflows.","Accelerated document distribution and follow-up processes.","Improved visibility into read status, approvals, and process history.","Demonstrated the ability to build an internal Flutter application with modular architecture and complex business flows."],"codeBlocks":[]}]}]'::jsonb),

  ('ditonton', 'Ditonton', 'ditonton', 'Film and TV series catalog with search, detail, and local watchlist.',
   'Ditonton adalah aplikasi katalog film dan serial TV berbasis Flutter yang dibuat sebagai submission awal kelas Dicoding Flutter Expert. Project ini berfokus pada implementasi alur inti discovery konten, pencarian, detail, rekomendasi, dan watchlist lokal dengan struktur codebase yang rapi dan mudah dikembangkan.',
   false, 'mobile', 'personal', 'Not published', 'N/A', 10, NULL, NULL,
   'https://pkzdlrxgfwlklomdwgfz.supabase.co/storage/v1/object/public/apps/ditonton/logo/circle-g.webp',
   'Ditonton logo',
   'https://pkzdlrxgfwlklomdwgfz.supabase.co/storage/v1/object/public/apps/ditonton/logo/circle-g.webp',
   'Ditonton thumbnail',
   ARRAY['Flutter','Provider','GetIt','GoRouter','Sqflite','Dartz'],
   ARRAY['Halaman beranda film dengan kategori now playing, popular, dan top rated.','Halaman serial TV dengan kategori on the air, popular, dan top rated.','Pencarian terpisah untuk film dan serial TV.','Halaman detail untuk film dan serial TV beserta rekomendasi konten terkait.','Watchlist lokal untuk film dan serial TV menggunakan SQLite.'],
   '[{"title":"Problems Solved","entries":[{"paragraphs":[],"bullets":["Menyediakan satu aplikasi untuk menjelajahi film dan serial TV dalam beberapa kategori populer tanpa memecah pengalaman pengguna.","Menyimpan daftar tontonan pengguna secara lokal agar item yang ingin ditonton ulang tetap mudah diakses.","Menjadi baseline submission yang menunjukkan pemisahan layer, dependency injection, dan pengujian pada aplikasi Flutter skala menengah."],"codeBlocks":[]}]},{"title":"Architecture","entries":[{"paragraphs":["Project ini memakai pendekatan clean architecture sederhana dengan pemisahan presentation, domain, dan data. State dikelola lewat Provider, dependency di-register melalui GetIt, lalu repository menjadi batas antara remote data source, local data source, dan use case agar alur fitur tetap modular dan mudah diuji."],"bullets":[],"codeBlocks":[]}]},{"title":"Impact","entries":[{"paragraphs":[],"bullets":["Menghasilkan aplikasi submission awal yang sudah mencakup alur utama browsing, pencarian, detail, rekomendasi, dan watchlist.","Menunjukkan penerapan dependency injection, repository pattern, dan pemisahan layer yang siap dikembangkan ke submission tahap berikutnya.","Menyediakan cakupan unit test dan widget test pada layer data, domain, dan presentation untuk membantu validasi perilaku aplikasi."],"codeBlocks":[]}]}]'::jsonb);

-- App Screenshots (Shou)
INSERT INTO app_screenshot (src, alt, width, height, "order", app_id) VALUES
  ('https://pkzdlrxgfwlklomdwgfz.supabase.co/storage/v1/object/public/apps/shou/screenshots/Simulator Screenshot - iPhone 15 Pro - 2026-05-01 at 18.05.19.webp', 'Shou screenshot 1', 887, 1920, 0, 'shou'),
  ('https://pkzdlrxgfwlklomdwgfz.supabase.co/storage/v1/object/public/apps/shou/screenshots/Simulator Screenshot - iPhone 15 Pro - 2026-05-01 at 18.16.59.webp', 'Shou screenshot 2', 887, 1920, 1, 'shou'),
  ('https://pkzdlrxgfwlklomdwgfz.supabase.co/storage/v1/object/public/apps/shou/screenshots/Simulator Screenshot - iPhone 15 Pro - 2026-05-01 at 18.17.02.webp', 'Shou screenshot 3', 887, 1920, 2, 'shou'),
  ('https://pkzdlrxgfwlklomdwgfz.supabase.co/storage/v1/object/public/apps/shou/screenshots/Simulator Screenshot - iPhone 15 Pro - 2026-05-01 at 18.17.07.webp', 'Shou screenshot 4', 887, 1920, 3, 'shou'),
  ('https://pkzdlrxgfwlklomdwgfz.supabase.co/storage/v1/object/public/apps/shou/screenshots/Simulator Screenshot - iPhone 15 Pro - 2026-05-01 at 18.17.13.webp', 'Shou screenshot 5', 887, 1920, 4, 'shou');

-- App Screenshots (OtoLog)
INSERT INTO app_screenshot (src, alt, width, height, "order", app_id) VALUES
  ('https://pkzdlrxgfwlklomdwgfz.supabase.co/storage/v1/object/public/apps/otolog/screenshots/ss1.webp', 'OtoLog screenshot 1', 887, 1920, 0, 'otolog'),
  ('https://pkzdlrxgfwlklomdwgfz.supabase.co/storage/v1/object/public/apps/otolog/screenshots/ss2.webp', 'OtoLog screenshot 2', 887, 1920, 1, 'otolog'),
  ('https://pkzdlrxgfwlklomdwgfz.supabase.co/storage/v1/object/public/apps/otolog/screenshots/ss3.webp', 'OtoLog screenshot 3', 887, 1920, 2, 'otolog'),
  ('https://pkzdlrxgfwlklomdwgfz.supabase.co/storage/v1/object/public/apps/otolog/screenshots/ss4.webp', 'OtoLog screenshot 4', 887, 1920, 3, 'otolog'),
  ('https://pkzdlrxgfwlklomdwgfz.supabase.co/storage/v1/object/public/apps/otolog/screenshots/ss5.webp', 'OtoLog screenshot 5', 887, 1920, 4, 'otolog'),
  ('https://pkzdlrxgfwlklomdwgfz.supabase.co/storage/v1/object/public/apps/otolog/screenshots/ss6.webp', 'OtoLog screenshot 6', 887, 1920, 5, 'otolog'),
  ('https://pkzdlrxgfwlklomdwgfz.supabase.co/storage/v1/object/public/apps/otolog/screenshots/ss7.webp', 'OtoLog screenshot 7', 887, 1920, 6, 'otolog');

-- App Screenshots (Litbang)
INSERT INTO app_screenshot (src, alt, width, height, "order", app_id) VALUES
  ('https://pkzdlrxgfwlklomdwgfz.supabase.co/storage/v1/object/public/apps/litbang-au-app/screenshots/ss1.webp', 'Litbang screenshot 1', 887, 1920, 0, 'litbang-au-app'),
  ('https://pkzdlrxgfwlklomdwgfz.supabase.co/storage/v1/object/public/apps/litbang-au-app/screenshots/ss2.webp', 'Litbang screenshot 2', 887, 1920, 1, 'litbang-au-app'),
  ('https://pkzdlrxgfwlklomdwgfz.supabase.co/storage/v1/object/public/apps/litbang-au-app/screenshots/ss3.webp', 'Litbang screenshot 3', 887, 1920, 2, 'litbang-au-app'),
  ('https://pkzdlrxgfwlklomdwgfz.supabase.co/storage/v1/object/public/apps/litbang-au-app/screenshots/ss4.webp', 'Litbang screenshot 4', 887, 1920, 3, 'litbang-au-app'),
  ('https://pkzdlrxgfwlklomdwgfz.supabase.co/storage/v1/object/public/apps/litbang-au-app/screenshots/ss5.webp', 'Litbang screenshot 5', 887, 1920, 4, 'litbang-au-app'),
  ('https://pkzdlrxgfwlklomdwgfz.supabase.co/storage/v1/object/public/apps/litbang-au-app/screenshots/ss6.webp', 'Litbang screenshot 6', 887, 1920, 5, 'litbang-au-app');

-- App Screenshots (Ditonton)
INSERT INTO app_screenshot (src, alt, width, height, "order", app_id) VALUES
  ('https://pkzdlrxgfwlklomdwgfz.supabase.co/storage/v1/object/public/apps/ditonton/screenshots/Simulator Screenshot - iPhone 15 Pro - 2026-05-01 at 18.47.25.webp', 'Ditonton screenshot 1', 887, 1920, 0, 'ditonton'),
  ('https://pkzdlrxgfwlklomdwgfz.supabase.co/storage/v1/object/public/apps/ditonton/screenshots/Simulator Screenshot - iPhone 15 Pro - 2026-05-01 at 18.47.35.webp', 'Ditonton screenshot 2', 887, 1920, 1, 'ditonton'),
  ('https://pkzdlrxgfwlklomdwgfz.supabase.co/storage/v1/object/public/apps/ditonton/screenshots/Simulator Screenshot - iPhone 15 Pro - 2026-05-01 at 18.47.49.webp', 'Ditonton screenshot 3', 887, 1920, 2, 'ditonton'),
  ('https://pkzdlrxgfwlklomdwgfz.supabase.co/storage/v1/object/public/apps/ditonton/screenshots/Simulator Screenshot - iPhone 15 Pro - 2026-05-01 at 18.48.02.webp', 'Ditonton screenshot 4', 887, 1920, 3, 'ditonton'),
  ('https://pkzdlrxgfwlklomdwgfz.supabase.co/storage/v1/object/public/apps/ditonton/screenshots/Simulator Screenshot - iPhone 15 Pro - 2026-05-01 at 18.48.18.webp', 'Ditonton screenshot 5', 887, 1920, 4, 'ditonton'),
  ('https://pkzdlrxgfwlklomdwgfz.supabase.co/storage/v1/object/public/apps/ditonton/screenshots/Simulator Screenshot - iPhone 15 Pro - 2026-05-01 at 18.48.29.webp', 'Ditonton screenshot 6', 887, 1920, 5, 'ditonton'),
  ('https://pkzdlrxgfwlklomdwgfz.supabase.co/storage/v1/object/public/apps/ditonton/screenshots/Simulator Screenshot - iPhone 15 Pro - 2026-05-01 at 18.48.37.webp', 'Ditonton screenshot 7', 887, 1920, 6, 'ditonton'),
  ('https://pkzdlrxgfwlklomdwgfz.supabase.co/storage/v1/object/public/apps/ditonton/screenshots/Simulator Screenshot - iPhone 15 Pro - 2026-05-01 at 18.48.43.webp', 'Ditonton screenshot 8', 887, 1920, 7, 'ditonton'),
  ('https://pkzdlrxgfwlklomdwgfz.supabase.co/storage/v1/object/public/apps/ditonton/screenshots/Simulator Screenshot - iPhone 15 Pro - 2026-05-01 at 18.49.23.webp', 'Ditonton screenshot 9', 887, 1920, 8, 'ditonton'),
  ('https://pkzdlrxgfwlklomdwgfz.supabase.co/storage/v1/object/public/apps/ditonton/screenshots/Simulator Screenshot - iPhone 15 Pro - 2026-05-01 at 18.49.32.webp', 'Ditonton screenshot 10', 887, 1920, 9, 'ditonton'),
  ('https://pkzdlrxgfwlklomdwgfz.supabase.co/storage/v1/object/public/apps/ditonton/screenshots/Simulator Screenshot - iPhone 15 Pro - 2026-05-01 at 18.49.46.webp', 'Ditonton screenshot 11', 887, 1920, 10, 'ditonton');

-- Certificates
INSERT INTO certificate (id, title, featured, issuer, issued, type, summary, details, relevance, issuer_notes, image_src, image_alt, image_width, image_height) VALUES
  ('dicoding-developer-conference-2026', 'Dicoding Developer Conference 2026', true, 'Dicoding Indonesia', '25 April 2026', 'Attendance Certificate',
   'Attendance certificate for participating in Dicoding Developer Conference 2026 organized by Dicoding Indonesia.',
   ARRAY['Participated in a major developer conference hosted by Dicoding.','Stayed connected with current discussions, trends, and insights in the Indonesian tech ecosystem.','Showed commitment to continuous learning through industry events and community-driven knowledge sharing.'],
   'This certificate shows consistency in staying active within the developer community.',
   ARRAY['Dicoding Indonesia','Signed by Narenda Wicaksono, CEO Dicoding Indonesia'],
   'https://pkzdlrxgfwlklomdwgfz.supabase.co/storage/v1/object/public/portfolio/data/certifications/dicoding-developer-conference-2026/certificate.webp',
   'Dicoding Developer Conference 2026 certificate preview', 800, 600),

  ('dicoding-flutter-developer-expert', 'Dicoding Flutter Developer Expert', true, 'Dicoding Indonesia', '9 May 2026', 'Course Completion Certificate',
   'Certificate of completion for the Menjadi Flutter Developer Expert class by Dicoding Indonesia.',
   ARRAY['Completed an advanced Flutter development class by Dicoding Indonesia.','Strengthened knowledge in Clean Architecture, testing, performance, security, analytics, and CI/CD.','Demonstrated commitment to continuous learning and improving professional Flutter development skills.'],
   'This certificate demonstrates continued growth as a Flutter developer through structured learning.',
   ARRAY['Dicoding Indonesia','Signed by Narenda Wicaksono, CEO Dicoding Indonesia'],
   'https://pkzdlrxgfwlklomdwgfz.supabase.co/storage/v1/object/public/portfolio/data/certifications/dicoding-flutter-developer-expert/certificate.webp',
   'Dicoding Flutter Developer Expert certificate preview', 800, 600),

  ('flutter-e-commerce-bootcamp', 'Flutter E-commerce Bootcamp', true, 'Android Enthusiast Jakarta', '25 August 2022', 'Bootcamp Certificate',
   'Certificate of completion for passing the Flutter E-commerce Bootcamp organized by Android Enthusiast Jakarta.',
   ARRAY['Completed a bootcamp focused on Flutter-based application development.','Built understanding of mobile app flow in an e-commerce context.','Learned implementation approaches such as clean architecture and modularization using melos.','Strengthened practical foundation in UI implementation, app structure, and feature delivery with Flutter.','Practiced development best practices for organizing code, separating responsibilities, and keeping projects easier to scale.'],
   'This certificate marks one of the earlier milestones in the journey of learning Flutter seriously.',
   ARRAY['Android Enthusiast Jakarta','Signed by Fiqri Hafzain Islami, Co-Founder of Android Enthusiast Jakarta'],
   'https://pkzdlrxgfwlklomdwgfz.supabase.co/storage/v1/object/public/portfolio/data/certifications/flutter-e-commerce-bootcamp/certificate.webp',
   'Flutter E-commerce Bootcamp certificate preview', 800, 600);

-- Work Experiences
INSERT INTO work_experience (id, company, location, role, start, "end", period, sort_order, summary, highlights) VALUES
  ('work-1', 'Shou Corp', 'Jakarta', 'Flutter Developer Part Time', 'October 2022', 'March 2023', 'Oct 2022 - Mar 2023', 1,
   'Worked part-time as a Flutter developer on an event management platform connecting organizers with service providers.',
   ARRAY['Built a prototype event management app connecting organizers with service providers.','Translated UI/UX designs and requirements into a functional mobile application.','Delivered an MVP for early validation and feedback.']),

  ('work-2', 'LKP Grafologi Indonesia', 'Bandung', 'UI/UX Designer Part Time', 'December 2024', 'February 2025', 'Dec 2024 - Feb 2025', 2,
   'Led the UI/UX redesign of an online course website and LMS, improving user flows, usability, and content accessibility.',
   ARRAY[]::text[]),

  ('work-3', 'Litbang TNI AU', 'Bandung', 'Flutter Developer Freelance', 'August 2025', 'September 2025', 'Aug 2025 - Sep 2025', 3,
   'Built a secure Flutter-based digital correspondence platform for Litbang TNI AU.',
   ARRAY['Built a digital correspondence platform to replace manual workflows.','Worked with PM and UI/UX to align features with requirements.','Integrated APIs for data sync and digital signatures.','Implemented document routing and tracking for better transparency and efficiency.']),

  ('work-4', 'Mindo Education', 'Jakarta', 'UI/UX Designer Freelance', 'October 2025', 'November 2025', 'Oct 2025 - Nov 2025', 4,
   'Designed the UI/UX for the Partnership section of the landing page, improving clarity, hierarchy, and user flow.',
   ARRAY[]::text[]),

  ('work-5', 'Gialoop (Independent)', 'Bandung', 'Mobile Indie Developer', 'Feb 2026', 'Present', 'Feb 2026 - Present', 5,
   'Conceptualized, developed, and published production-ready mobile applications to the Google Play Store, managing the full product lifecycle from UI/UX design to deployment.',
   ARRAY['Built and published OtoLog, a vehicle service history tracker and maintenance cost monitoring application.','Built Lariss: UMKM POS (Closed Testing), a Point of Sale application using clean architecture and Cubit/BLoC state management designed to help small businesses manage daily transactions and operations efficiently.','Built SkinSense: AI Skin Insight (Closed Testing), an AI-powered skincare application built with Flutter featuring face analysis, OCR ingredient scanning, and skincare compatibility analysis by integrating Google ML Kit and optimized image preprocessing pipelines.']);
