# Dolmencare — Product Requirements Document

## Original Problem Statement
Build a clean, trustworthy light-theme website for Dolmencare mobile repair pickup and delivery: hero, benefits, repair workflow, 10 repair services, supported brands, reviews, FAQ, contact/footer; WhatsApp "Book a Pickup"; "Get Instant Quote" with starting prices + contact capture; "Sell Your Old Phone" valuation form; Android APK download CTA. Later: rebrand to "Dolmencare", admin control panel (email/password login) to view and accept/reject repair-quote and sell-phone enquiries, plus admin-managed APK upload so the download button can be updated anytime.

## User Personas
- Phone owner in Jaipur needing a repair without visiting a shop.
- Person wanting to sell an old phone quickly and fairly.
- Business owner (admin) managing enquiries and publishing the Android app.

## Core Requirements (static)
- Public one-page marketing site, light theme, responsive.
- WhatsApp deep-link booking with pre-filled message.
- Quote + sell-phone lead capture persisted to MongoDB.
- Protected admin dashboard: login, list leads, accept/reject.
- Admin APK upload; public download button serves the latest APK.
- All interactive elements carry unique data-testid attributes.

## Architecture
- Frontend: React (CRA/CRACO), react-router-dom routes `/` (public) and `/admin` (AdminApp), framer-motion reveals, lenis smooth scroll, plain CSS (App.css, motion.css, admin/admin.css).
- Backend: FastAPI single server.py, `/api` prefix; JWT access (15 min) + refresh (7 d) httpOnly cookies; bcrypt hashing; brute-force lockout (5 attempts → 15 min); idempotent admin seed from env; object storage via Emergent integration proxy for APK binaries.
- DB: MongoDB collections — leads (status pending/accepted/rejected), users, login_attempts, app_files (soft-delete flag; latest active APK is served).

## Implemented
- 2026-10-18 (session 1): full public site, quote/sell lead capture + validation, WhatsApp CTA, FAQ interaction fix, lead error handling fix.
- 2026-10-18 (session 2): admin auth (login/logout/me/refresh, seeded admin, lockout), admin dashboard with status/type filters and accept/reject, APK upload/replace in admin, public `/api/app/apk-info` + `/api/app/download`, "Dolmencare" rebrand, favicon + page title/meta, framer-motion section reveals + hero masked line reveal, brand marquee, lenis smooth scrolling.

## Backlog
- P0: none open.
- P1: owner uploads the real APK from the admin panel (backend + UI ready, currently "coming soon").
- P2: lead search/date filter/export; email/WhatsApp notification on accept/reject (needs integration playbook); customer-facing repair status tracking.

## Next Tasks
1. Owner uploads real APK at /admin → verify download on public site.
2. Optional: notifications when enquiry status changes.
3. Optional: admin password change inside the panel (then remove seed hash reconciliation).
