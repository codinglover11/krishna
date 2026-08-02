# Project Memory: Krishna Footwear

## 1. Project Overview
Krishna Footwear is an e-commerce platform featuring a Node.js/Express backend (`CommonBackend`) integrated with a Neon PostgreSQL database, Redis caching, Firebase Phone Authentication, and Email OTP (Resend/Brevo/SMTP), serving two frontends: a customer app (`KrishnaFrontend`) and an admin dashboard (`KrishnaAdminFrontend`).

## 2. Selected Architecture
* **Backend**: Node.js, Express.js.
* **Database**: Neon PostgreSQL serverless database.
* **Caching & Session Storage**: Redis.
* **Frontend**: React (Vite-powered SPAs) using Zustand (client state) and TanStack Query (server state).
* **Authorization**: Access Token (JWT) + Refresh Token (`httpOnly` secure cookie).
* **Phone Authentication**: Firebase Phone Authentication (Web Auth SDK client + ID Token verification backend).
* **Email OTP Strategy**: Resend (`RESEND_API_KEY`) -> Brevo (`BREVO_API_KEY`) -> SMTP (`nodemailer` fallback).
* **Media Cloud**: Cloudinary.

## 3. Current Decisions & Constraints
* **Styling**: Use Vanilla CSS for components to maintain high design flexibility and speed. Do not load Tailwind unless explicitly requested.
* **Production Standards**: Zero mock databases. All components must read and write data to/from the actual PostgreSQL schema.
* **No Placeholders**: Maintain high aesthetics from day one. Do not commit dummy products or text.
* **Phone Auth**: Firebase Phone Auth is the default phone verification solution. Manual SMS OTP generation via Twilio is completely prohibited.
* **Email OTP**: Email OTP is provider-independent via `emailProviders.js` and `communicationService.js`.
* **Guest-First Authentication Intercept**: Guests browse all public pages (Home, Listings, Search, Offers, Info). When clicking any protected action (Cart, Wishlist, Checkout), their action is cached/queued, login modal/page is shown, and the action resumes automatically upon successful sign-in.
* **JWT Strategy**: Access tokens are short-lived (15m) and sent via headers. Refresh tokens are long-lived (7d) and set in secure `httpOnly` cookies. Refresh token rotation is enforced upon token refresh, invalidating the old token and issuing a new one to prevent replay attacks.

## 4. Implementation Status

### Module Status
* **CommonBackend**: Initialized structure. Database schema DDL (`schema.sql`), incremental migration scripts (`001` to `016`), metadata seeds (`seed.sql`), Redis/Memory caching (`cacheService.js`), Firebase Phone Auth verification (`firebaseAuthProvider.js`), Email OTP Strategy (`emailProviders.js`), and composite query indexes deployed.
* **KrishnaFrontend**: React Router, Zustand stores, Axios clients, Query Client, Firebase Auth SDK, Profile Avatar upload, 2-Step Email/Phone OTP registration, and protected routing systems fully configured.
* **KrishnaAdminFrontend**: Production-ready React Admin Dashboard with Admin Phone/Email OTP Password Reset modal, React Router, Zustand, TanStack Query, Axios, and full RBAC controls.

### Completed Tasks
* [x] Set up project architecture.
* [x] Configure Firebase Phone Authentication client & backend verification.
* [x] Implement Provider-Independent Email OTP strategy (`Resend` -> `Brevo` -> `SMTP`).
* [x] Completely remove all Twilio dependencies, SDKs, and references.
* [x] Implement Customer Profile avatar picture upload & phone number editing (`Profile.jsx` & `PUT /api/v1/users/profile`).
* [x] Implement Admin Forgot Password via Phone/Email OTP (`Admin Login.jsx`).
* [x] Configure Rollup `manualChunks` vendor code splitting in `vite.config.js`.
* [x] Implement `React.lazy()` & `Suspense` route code splitting in `AppRoutes.jsx`.
* [x] Implement Redis/Memory caching service (`cacheService.js`).
* [x] Create database migration `016_add_performance_indexes.sql` with composite indexes.
* [x] Update all system documentation files ([ProjectRequirement.md](file:///e:/KrishnaFootwear/docs/ProjectRequirement.md), [Architecture.md](file:///e:/KrishnaFootwear/docs/Architecture.md), [Rules.md](file:///e:/KrishnaFootwear/docs/Rules.md), [Phases.md](file:///e:/KrishnaFootwear/docs/Phases.md), [Design.md](file:///e:/KrishnaFootwear/docs/Design.md), [PROJECT_MEMORY.md](file:///e:/KrishnaFootwear/docs/PROJECT_MEMORY.md), [Deployment.md](file:///e:/KrishnaFootwear/docs/Deployment.md)).
