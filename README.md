# TempLink 🔒
> **Temporary communication without the permanent connection.**

TempLink is a privacy-focused temporary communication platform where users can connect using a one-time room code or QR code without requiring phone numbers or permanent accounts.

Built for the **E-Cell Startup Competition**, real-user validation, and venture scale.

---

## 🏛️ Architecture

```text
                    TempLink PWA
                         │
                         ▼
                    Next.js UI
                         │
                         ▼
                Cloudflare Worker
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
      Durable Object                D1
      Temporary Room             Metadata
              │
              │ WebSocket
        ┌─────┴─────┬─────┐
        ▼           ▼     ▼
      User A      User B User C
```

- **Next.js 14 Frontend**: Modern Stitch / Magic UI dark mode design (`#05070B`), Geist/Inter typography, and responsive controls.
- **Cloudflare Worker (`cloudflare/worker.ts`)**: Fast edge routing and WebSocket connection upgrading.
- **Cloudflare Durable Objects (`cloudflare/durable-object/Room.ts`)**: Holds isolated in-memory room state per room code (e.g. `A7X9-K2P4`), multiplexes WebSockets, and executes server alarms for automatic session expiration.
- **Cloudflare D1 (`cloudflare/db/schema.sql`)**: Relational SQLite on the edge for high-level room metadata, feedback analytics, and optional accounts, keeping active chat messages strictly in memory.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Cloudflare Backend (Optional / Local Edge)
```bash
npm run worker:dev
```

### 4. Production Build & Test
```bash
npm run build
npm test
```

---

## 🧭 Application Routes

- `/` — Landing Page with interactive room preview and feature breakdown.
- `/create` — Create Temporary Private Room with duration (15m, 30m, 1h, custom), password, and file permissions.
- `/join` — Enter one-time code with auto-dash formatting and live validation.
- `/scan` — QR Camera Scanner for instant mobile connection.
- `/room/:roomCode` — Live isolated real-time chat with WebSockets, typing indicators, server timer & SafeRoom moderation.
- `/room/:roomCode/expired` — Room expiration notice and post-room anonymous feedback card.
- `/dashboard` — User Dashboard with active rooms bento grid.
- `/rooms` — Active and expired room history.
- `/pricing` — Transparent INR pricing tiers (Free ₹0 up to 3 members, Pro ₹99/mo up to 10 members, Business Custom).
- `/security` — Security & Privacy Architecture.
- `/about` — Team & Project Vision.
- `/business` — Business console, workspace preview & planned API documentation.
- `/admin/feedback` — Protected product validation and feedback analytics dashboard.
- `/settings` — Client-side privacy controls & temporary identity generator.

---

## 🧪 Testing

Run test suites for room isolation, multi-participant capacity, SafeRoom moderation, and feedback analytics:
```bash
npm test
```
