# TrueVoice

Human-verified reviews powered by World ID. Every review comes from a unique, Orb-verified human -- no fakes, no bots, no duplicates.

Built for [ETHGlobal Cannes 2026](https://ethglobal.com/events/cannes) (World track).

## Problem

Fake reviews cost the global economy $152B+ annually. AI makes traditional detection useless. TrueVoice uses World ID's proof of personhood to guarantee **one person, one review** per entity -- cryptographically enforced, on-chain recorded.

## How It Works

1. **Verify** -- User proves they're a unique human via World ID (Orb level)
2. **Review** -- Rate 1-5 stars + write a text review (10-280 chars)
3. **Record** -- Review hash is stored on World Chain; full text in database
4. **Enforce** -- Same person cannot review the same entity twice (nullifier-based)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router) + Tailwind CSS v4 |
| Identity | World ID via MiniKit SDK (`@worldcoin/minikit-js`) |
| Database | Turso / LibSQL (serverless SQLite) |
| Smart Contract | Solidity 0.8.24 (review hash registry) |
| Chain | World Chain (OP Stack, gasless) |
| Deployment | Vercel |

## Pages

- `/` -- Feed (latest verified reviews) + Places tab
- `/write` -- Write a review (select entity -> rate -> verify -> submit)
- `/entity/[id]` -- Entity detail with rating distribution and reviews
- `/profile` -- User profile with review history

## Setup

```bash
pnpm install
cp .env.example .env.local
# Edit .env.local with your credentials
pnpm dev
```

### Environment Variables

```
TURSO_DATABASE_URL=file:local.db        # Local dev (or Turso URL for prod)
TURSO_AUTH_TOKEN=                        # Turso auth token (prod only)
WLD_APP_ID=app_...                      # World Developer Portal app ID
WLD_ACTION=review                       # World ID action name
NEXT_PUBLIC_DEMO_MODE=true              # Skip World ID verification for testing
```

### Seed Data

With the dev server running:

```bash
curl -X POST http://localhost:3000/api/seed
```

This creates 6 Cannes-local entities (restaurants, attractions, events) and 5 demo reviews.

## Smart Contract

`contracts/TrueVoice.sol` -- Stores review hashes on-chain for immutability.

- `submitReview(entityId, reviewHash, rating)` -- Owner-only, called by trusted backend
- `reviewExists(hash)` -- Check if a review hash is recorded
- `getAverageRating(entityId)` -- On-chain average (x100 precision)

Deploy via Remix IDE to World Chain.

## Architecture

```
World App (Host)
  |
  v
TrueVoice Mini App (WebView)
  |
  +-- MiniKit.verify()     --> World ID proof of personhood
  +-- MiniKit.walletAuth() --> Wallet-based session
  |
  v
Next.js API Routes
  |
  +-- POST /api/reviews    --> Verify proof, store review, submit hash on-chain
  +-- GET  /api/reviews    --> Fetch reviews (by entity or wallet)
  +-- GET  /api/entities   --> List entities
  |
  +---> Turso DB (full review text)
  +---> World Chain (review hash registry)
```

## License

MIT
