# Olympus
Olympus is an AI friend, assistant, coach, chef, and all around helper. The idea is a brain that can deploy and adapt to any form factor rather than being confined to a single factor. Meet your new buddy Ollie.

## What's here

The walking skeleton for Slice 1 (Daily Loop): the thinnest working version of the whole system.

- **App:** Next.js (App Router) on Vercel. `app/` holds the screens and server actions.
- **Database:** Supabase Postgres. `supabase/migrations/` holds the schema as SQL files, applied to dev first and prod after a merge.
- **Sign-in:** email and password through Supabase Auth. There is no sign-up screen; accounts are created in the Supabase dashboard.
- **Privacy:** row-level security in the database. A capture is visible only to its owner unless the owner marks that one item as shared.

## Environments

| Vercel environment | Supabase project |
| --- | --- |
| Production (`main`) | `olympus-prod` |
| Preview (every other branch) and Development | `olympus-dev` |

The two `NEXT_PUBLIC_SUPABASE_*` values are public by design and are set in Vercel. Secret keys live only in Vercel's settings and a password manager, never in this repo. See `.env.example`.

## Run it locally

```bash
npm install
cp .env.example .env.local   # then fill in the dev project's two public values
npm run dev
```

## Checks

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Requirements, decisions and the delivery plan live in the Life Hub doc, not here.
