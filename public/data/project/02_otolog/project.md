---
featured: true
projectType: personal
appType: mobile
---

# OtoLog

## Project Period

March 2026 - April 2026

## Quick Summary

OtoLog is a Flutter mobile application that helps vehicle owners record service history, monitor maintenance costs, and manage multiple vehicles in one place. The project was built to provide cleaner maintenance records, easier lookup, and a fully local experience without depending on a backend.

## Problems Solved

- Vehicle service history is often scattered across chats, paper receipts, or manual notes that are hard to trace later.
- Vehicle owners struggle to see total maintenance cost and service patterns over time.
- Managing multiple vehicles in one place requires a flow that stays simple and fast to use.

## Key Features

- Multi-vehicle management with vehicle details, a primary vehicle, and vehicle search.
- Full service records covering service type, date, odometer, cost, mechanic, and extra notes.
- A compact dashboard for active vehicles, service summaries, and quick actions.
- A service logs page with search, vehicle filters, and date-range filters.
- Per-vehicle service statistics with charts for total cost, frequency, service distribution, and spending trends.

## Tech Stack

- Flutter
- flutter_bloc (Cubit)
- Drift + SQLite
- GetIt + GoRouter

## Repository

- GitHub: <https://github.com/gyaaufau/otolog>
- Play Store: <https://play.google.com/store/apps/details?id=com.gialoop.otolog>

## Project Architecture

This project uses a lightweight modular approach with clear separation between `screens`, `widgets`, `cubit`, `repositories`, `database`, and `shared`. State management is handled by Cubit, dependency injection uses GetIt, navigation uses GoRouter, and local persistence is built on Drift/SQLite so the data flow stays simple, testable, and well-suited for an offline-first app.

## Project Structure

```text
lib/
├── main.dart
├── router.dart
├── cubit/
├── database/
├── repositories/
├── resources/
├── screens/
│   ├── garage/
│   ├── home/
│   ├── logs/
│   ├── onboarding/
│   └── settings/
├── shared/
│   ├── commons/
│   ├── constants/
│   ├── core/
│   └── localization/
└── widgets/
```

## Impact

- Made vehicle maintenance history more structured and easier to search in one application.
- Provided clearer visibility into total service costs and maintenance trends.
- Produced a Flutter portfolio app that demonstrates strength in state management, local databases, routing, localization, and data visualization.
