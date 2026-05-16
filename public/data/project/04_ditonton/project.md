---
featured: false
projectType: personal
appType: mobile
---

# Ditonton: Submission awal dicoding flutter expert

## Periode Project
Tidak dipublikasikan

## Quick Summary
Ditonton adalah aplikasi katalog film dan serial TV berbasis Flutter yang dibuat sebagai submission awal kelas Dicoding Flutter Expert. Project ini berfokus pada implementasi alur inti discovery konten, pencarian, detail, rekomendasi, dan watchlist lokal dengan struktur codebase yang rapi dan mudah dikembangkan.

## Problem yang Diselesaikan
- Menyediakan satu aplikasi untuk menjelajahi film dan serial TV dalam beberapa kategori populer tanpa memecah pengalaman pengguna.
- Menyimpan daftar tontonan pengguna secara lokal agar item yang ingin ditonton ulang tetap mudah diakses.
- Menjadi baseline submission yang menunjukkan pemisahan layer, dependency injection, dan pengujian pada aplikasi Flutter skala menengah.

## Fitur Utama
- Halaman beranda film dengan kategori now playing, popular, dan top rated.
- Halaman serial TV dengan kategori on the air, popular, dan top rated.
- Pencarian terpisah untuk film dan serial TV.
- Halaman detail untuk film dan serial TV beserta rekomendasi konten terkait.
- Watchlist lokal untuk film dan serial TV menggunakan SQLite.

## Tech Stack
- Flutter
- Provider
- GetIt
- GoRouter
- Sqflite
- Dartz

## Repository
- GitHub: Tidak dipublikasikan di repository publik.

## Arsitektur Project
Project ini memakai pendekatan clean architecture sederhana dengan pemisahan `presentation`, `domain`, dan `data`. State dikelola lewat `Provider`, dependency di-register melalui `GetIt`, lalu repository menjadi batas antara remote data source, local data source, dan use case agar alur fitur tetap modular dan mudah diuji.

## Struktur Project
```text
lib/
  common/
  data/
    datasources/
    models/
    repositories/
  domain/
    entities/
    repositories/
    usecases/
  presentation/
    pages/
    provider/
    widgets/
  injection.dart
  main.dart
test/
  data/
  domain/
  presentation/
  helpers/
assets/
```

## Impact
- Menghasilkan aplikasi submission awal yang sudah mencakup alur utama browsing, pencarian, detail, rekomendasi, dan watchlist.
- Menunjukkan penerapan dependency injection, repository pattern, dan pemisahan layer yang siap dikembangkan ke submission tahap berikutnya.
- Menyediakan cakupan unit test dan widget test pada layer data, domain, dan presentation untuk membantu validasi perilaku aplikasi.
