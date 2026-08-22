# TempLink 🔒
> **Connect. Communicate. Disappear.**

TempLink is a privacy-first temporary communication platform where two people can connect using a one-time room code or QR code without requiring phone numbers, emails, or permanent accounts.

Built for the **E-Cell Startup Competition**, real-user testing, and venture scale.

---

## 🏛️ Upgraded Architecture

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
        ┌─────┴─────┐
        ▼           ▼
      User A       User B
```

- **Next.js 14 Frontend**: Strict preservation of the Stitch AI dark UI/UX design (`#051424` / `#0A0A0B`), Geist/Inter typography, and WebGL background shader.
- **Cloudflare Worker (`cloudflare/worker.ts`)**: Fast edge routing and WebSocket connection upgrading.
- **Cloudflare Durable Objects (`cloudflare/durable-object/Room.ts`)**: Holds isolated volatile RAM state per room code (e.g. `A7X9-K2P4`), multiplexes WebSockets, and executes server alarms for guaranteed memory zeroization upon expiration.
- **Cloudflare D1 (`cloudflare/db/schema.sql`)**: Relational SQLite on the edge for high-level room metadata and optional accounts, keeping chat content strictly ephemeral.

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
```

---

## 🧭 Application Routes

- `/` — Landing Page with WebGL fluid shader & interactive 3D hero mock.
- `/create` — Create Private Room with duration (15m, 30m, 1h, custom), password, and file permissions.
- `/join` — Enter one-time code with auto-dash formatting.
- `/scan` — QR Camera Scanner for instant mobile connection.
- `/room/:roomCode` — Live isolated 1-on-1 chat with real-time WebSockets, typing indicators, server timer & details modal.
- `/room/:roomCode/expired` — Ephemeral purge & cryptographic memory wipe confirmation.
- `/dashboard` — User Dashboard with active rooms bento grid.
- `/rooms` — Active and purged room history.
- `/pricing` — Transparent INR pricing tiers (Free ₹0, Pro ₹99/mo, Business ₹999/mo).
- `/security` — Ephemeral Transmission Protocol architecture.
- `/business` — Business console, custom TTL & API documentation.
- `/settings` — Client-side privacy controls & temporary identity rerolling.

---

## 🧪 Testing

Run test suites for room isolation, code generation, and countdown expiration:
```bash
npm test
```
