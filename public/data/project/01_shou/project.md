---
featured: true
projectType: work
appType: mobile
---

# Shou Project

## Project Period

October 2022 - March 2023

## Quick Summary

Shou Project is a Flutter mobile application designed to help users discover, save, and follow information about city-based events, with a primary focus on Japanese culture events through onboarding, authentication, search, bookmarks, event details, and profile management in one modular application.

## Problems Solved

- Users needed a fast way to discover relevant events based on their city or current location.
- Japanese culture event communities needed a more focused channel to find events that matched their interests.
- Event information needed to be organized into a flow that was easy to follow from listings and search to detailed agendas.
- The app needed to remain convenient to use with local state for onboarding, preferences, search history, and bookmarks.

## Key Features

- User onboarding and authentication, including login, registration, and forgot password.
- City-based event home screen with location integration and manual city selection, especially for exploring Japanese culture events.
- Full event listing, event search, and locally stored search history.
- Event detail pages with schedule, category, location, time, and description.
- Event bookmarking, dark mode, and user profile management.

## Tech Stack

- Flutter
- Dart
- dio
- flutter_bloc and hydrated_bloc
- GoRouter, GetIt, Hive, SharedPreferences, and melos

## Repository

- GitHub: Private/internal repository, not published in this codebase.
- API Docs: Backend connected to `https://api.shoucorp.id`.

## Project Architecture

This project uses a modular monorepo approach with `melos`, separating `features`, `domains`, `shared_libraries`, and `resources` so dependencies, use cases, repositories, UI, and reusable components stay isolated. Its implementation follows a lightweight clean architecture style with separation between data sources, repository interfaces/implementations, entities/DTOs, dependency injection via GetIt, and Bloc/Cubit-based state management.

## Project Structure

```text
.
├── lib/
├── features/
│   ├── auth/
│   ├── home/
│   ├── search/
│   ├── bookmark/
│   ├── detail_event/
│   ├── profile/
│   ├── city/
│   ├── all_event/
│   ├── splash/
│   ├── on_boarding/
│   ├── connectivity/
│   └── dark_mode/
├── domains/
│   ├── auth_domain/
│   ├── event_domain/
│   ├── bookmark_domain/
│   ├── profile_domain/
│   └── search_domain/
├── shared_libraries/
│   ├── common/
│   ├── component/
│   ├── core/
│   └── dependencies/
├── resources/
├── android/
└── ios/
```

## Impact

- Delivered a solid event discovery application foundation covering the core flow from user acquisition to event exploration and saving, with strong positioning around Japanese culture events.
- Provided a modular codebase that is easier to extend per domain or feature compared with a single-structure Flutter app.
- Simplified backend integration for events and user profiles through cleaner separation of repositories, use cases, and data sources.
