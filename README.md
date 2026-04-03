# Guhaya Sourcing

Monorepo containing:

- **Frontend**: Next.js app in `frontend/`
- **Backend**: Node/Express API in `backend/`
- **Database**: Prisma schema/seed utilities in `database/`

## Prereqs

- Node.js \(recommended: latest LTS\)
- npm \(comes with Node\)

## Setup

Install dependencies from the repo root:

```bash
npm install
```

## Development

Run frontend + backend together:

```bash
npm run dev
```

Or individually:

```bash
npm run dev:frontend
npm run dev:backend
```

## Build

```bash
npm run build
```

## Notes

- Environment variables: create `.env` files as needed (see `backend/.env` for backend runtime vars).