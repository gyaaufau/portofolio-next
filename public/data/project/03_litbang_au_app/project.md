---
featured: true
projectType: work
appType: mobile
---

# Litbang TNI AU App

## Project Period

August 2025 - September 2025

## Quick Summary

Litbang TNI AU App is an internal Flutter application built to support document distribution, follow-up actions, approvals, and cross-role tracking within the Litbang TNI AU environment.

## Problems Solved

- Internal document distribution was still slow because many steps were handled manually.
- Document status was difficult to monitor end to end.
- Cross-role coordination for reading, approving, and following up on documents was not efficient.
- Files and response history were scattered, increasing the risk of miscommunication.

## Key Features

- Authentication and session handling with secure storage.
- Document lists with categories such as `TANDA_TANGAN`, `INFORMASI`, and `TINDAK_LANJUT`.
- Document detail views containing files, involved parties, and process history.
- Role-based workflows for accept, sign, response, forward, and add people actions.
- Direct file download and open flow from the device.
- Multi-environment setup for `development`, `staging`, and `production`.

## Tech Stack

- Flutter
- Dart
- `flutter_bloc`
- `go_router`
- `dio`
- `get_it`
- `flutter_secure_storage`
- `shared_preferences`
- `sqflite`
- Firebase Core
- Cloud Firestore

## Project Architecture

This project uses a feature-based modular approach. The main layers are separated into feature areas, shared utilities, resources, and app configuration, making business logic, dependencies, storage, and UI components easier to maintain and extend. This structure helps the project stay scalable as the number of modules, workflows, and roles grows.

## Project Structure

Main folder structure:

```text
lib/
├── app.dart
├── main.dart
├── main_dev.dart
├── main_staging.dart
├── main_prod.dart
├── di.dart
├── config/
│   └── flavor_config.dart
├── features/
│   ├── account/
│   │   └── presentation/
│   ├── archive/
│   │   └── presentation/
│   ├── auth/
│   │   ├── data/
│   │   ├── di/
│   │   ├── domain/
│   │   └── presentation/
│   ├── document/
│   │   ├── data/
│   │   ├── di/
│   │   ├── helper/
│   │   └── presentation/
│   ├── home/
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   └── splash/
│       └── presentation/
├── resources/
│   ├── gen/
│   └── theme/
└── shared/
    ├── commons/
    ├── components/
    ├── core/
    ├── utils/
    └── widgets/
```

## Impact

- Digitized the internal document flow with role-based workflows.
- Accelerated document distribution and follow-up processes.
- Improved visibility into read status, approvals, and process history.
- Demonstrated the ability to build an internal Flutter application with modular architecture and complex business flows.
