# SafeRoom Moderation Dictionary Changelog

## [2026.08.1] - 2026-08-23

### Added
- **Categorized Moderation Architecture**:
  - `PROFANITY`
  - `HARASSMENT`
  - `THREATS`
  - `SEXUAL_ABUSE`
  - `HATEFUL_LANGUAGE`
  - `SLURS`
  - `PERSONAL_ATTACKS`
  - `SPAM_ABUSE`
- **Severity Classification**:
  - `LOW`, `MEDIUM`, `HIGH`
- **Rule ID Indexing**:
  - Unique rule identifiers (e.g. `PROFANITY_001`, `HARASSMENT_001`, `THREAT_001`, `SLUR_001`, `HI_PROFANITY_001`).
- **De-Obfuscation Enhancements**:
  - Unicode `NFKD` decomposition and control character stripping.
  - Conservative leetspeak substitution map.
  - Multi-pass single-character token merging (`f u c k` $\to$ `fuck`, `b.i.t.c.h` $\to$ `bitch`, `k-y-s` $\to$ `kys`).
  - Repeated character run collapsing (`fuuuuuck` $\to$ `fuck`, `shiiiit` $\to$ `shit`).
- **Multilingual Structure**:
  - Added initial curated English (`languages/en.ts`) and Hindi transliteration (`languages/hi.ts`) rules.
  - Modularized pattern catalog ready for additional regional languages (`ta`, `te`, `kn`, `bn`, `mr`).

### Security & Privacy
- Zero plaintext message logging on moderation triggers.
- Strictly server-side execution within Cloudflare Workers / Durable Objects & Next.js backend.
- Client bundles receive zero word lists.
