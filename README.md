# Panel Procurement — Subtle Controls

BOM entry and shortage tracking for control panel projects, built on the existing
`subtle-os` Supabase database.

## What it does

- Sign in with existing Subtle OS credentials (Supabase Auth)
- List open projects from `projects_v2`
- Create a BOM per panel, quantities taken from the project record
- Add line items by searching the 6,363-item catalogue
- See shortages: demand across every open BOM versus Zoho Books stock

## Stack

Next.js 14 (App Router) · Supabase · Tailwind · Vercel

## Deploying

1. Import this repo in Vercel
2. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://omymhtcuzxmxejvdkhor.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Supabase → Settings → API → anon / public
3. Deploy
4. Supabase → Authentication → URL Configuration → add the Vercel URL to Site URL and
   Redirect URLs

## Local

```bash
npm install
cp .env.example .env.local   # paste the anon key
npm run dev
```

## Database objects used

| Object | Access |
|---|---|
| `projects_v2` | read — owned by Subtle OS |
| `items`, `item_stock` | read |
| `boms`, `bom_lines` | read / write |
| `v_bom_lines`, `v_shortage` | read |

Permissions are enforced by RLS, not the UI. `admin`, `purchase` and `project_manager`
can edit BOMs; everyone signed in can read.

## Design notes

- Item codes are `text` and the primary key — leading zeros survive, duplicates impossible
- `bom_lines.sku` is a foreign key to `items` — an unknown code cannot be saved
- `unique (bom_id, sku)` — the same item cannot appear twice on one BOM
- Stock is a daily snapshot from Zoho Books; `item_stock.synced_at` shows its age
