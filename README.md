# Pinoso Eco Life

Next.js website for Pinoso Eco Life, deployed on Vercel.

## Architecture

- `src/app/` is the active Next.js application used by Vercel.
- RealtyFlow remains the CRM, property, content and automation system.
- The website reads property data from RealtyFlow and sends leads back to RealtyFlow.
- `public_html/` is legacy PHP code kept as backup during migration. It is not used by Vercel.

## Routes

- `/` - front page
- `/eiendommer` - property search/listing
- `/eiendommer/[id]` - property detail page
- `/omrader` - area guide
- `/kjopsprosessen` - buying process
- `/magasin` - magazine/guide page
- `/min-side` - transition page for customer portal
- `/api/contact` - lead capture endpoint forwarding to RealtyFlow

## Local/Production Config

For the Next.js app, set these Vercel environment variables when needed:

```bash
REALTYFLOW_BASE_URL=https://realtyflow.chatgenius.pro
```

For legacy PHP hosting only, never put real credentials in `public_html/config.php`.

Create `config.local.php` one level above `public_html`:

```bash
cp config.local.example.php config.local.php
```

Then fill in database credentials and API keys. `config.local.php` is ignored by Git.

## RealtyFlow Integration

Current integration points:

- Leads: `src/app/api/contact/route.ts` forwards website leads to `https://realtyflow.chatgenius.pro/api/contacts`.
- Properties: `src/lib/realtyflow.ts` reads properties from `https://realtyflow.chatgenius.pro/api/properties`.
- Legacy chatbot/PHP sync still exists under `public_html/` during migration.

## Development

```bash
npm install
npm run dev
```

Build check:

```bash
npm run build
```

## Security Notes

- Do not commit `config.local.php`, `.env` files, API keys, database passwords or GitHub tokens.
- The Next.js contact endpoint does not store credentials.
- Customer login/admin migration should be completed against RealtyFlow or Supabase before removing the legacy PHP portal.
- Rotate any credentials that have previously been stored in public files.
