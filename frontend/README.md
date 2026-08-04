# FarmStand

A marketplace connecting farmers with buyers — farmers list produce, buyers search and place orders.

Built for the **3MTT NextGen Knowledge Showcase 2.0**.

> Problem: farmers lack a straightforward way to list what they have for sale, and buyers have no central place to find it. FarmStand gives farmers a listing flow and buyers a search-and-order flow, with orders recorded on both sides.

---

## Stack

- **Frontend:** Next.js (App Router) + Tailwind CSS
- **Backend:** NestJS (REST API)
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Auth:** JWT (Bearer token) + bcrypt

See [`PRD.md`](./PRD.md) for the full product spec, data model, and API surface.

## Monorepo layout

```
farmstand/
├── apps/
│   ├── api/          # NestJS backend
│   └── web/           # Next.js frontend
├── PRD.md
└── README.md
```

## Features

- ✅ Register / login with a chosen role — **Farmer** or **Buyer** — fixed on the account, enforced server-side on every listing/order endpoint
- ✅ Create, edit, delete listings (crop, price, unit, quantity, location, photo)
- ✅ Search & filter listings (keyword, category, location, price range) + sort
- ✅ Place an order against a listing (quantity-checked against availability)
- ✅ Farmer dashboard: manage listings, view/update incoming orders
- ✅ Buyer view: order history and status
- ✅ Required photo per listing, uploaded directly to Cloudinary (no server-side file handling)
- 🚧 Coming soon: in-app payments, delivery coordination, ratings/reviews

## Getting started (local development)

### Prerequisites
- Node.js 20+
- PostgreSQL running locally, or a free hosted instance (e.g. [Neon](https://neon.tech))

### 1. Clone and install
```bash
git clone <your-repo-url> farmstand
cd farmstand
cd apps/api && npm install
cd ../web && npm install
```

### 2. Configure environment variables

`apps/api/.env`
```
DATABASE_URL="postgresql://user:password@localhost:5432/farmstand"
JWT_SECRET="replace-with-a-long-random-string"
PORT=4000
CORS_ORIGIN="http://localhost:3000"
```

`apps/web/.env.local`
```
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="your-unsigned-preset"
```
Create a free [Cloudinary](https://cloudinary.com) account, then add an **unsigned upload preset** (Settings → Upload) so the browser can upload listing photos directly without exposing your API secret.

### 3. Set up the database
```bash
cd apps/api
npx prisma migrate dev
npx prisma db seed
```

### 4. Run both apps
```bash
# terminal 1
cd apps/api && npm run start:dev

# terminal 2
cd apps/web && npm run dev
```

Visit `http://localhost:3000`.

### Seeded demo accounts
| Role | Email | Password |
|---|---|---|
| Farmer | farmer@demo.com | password123 |
| Buyer | buyer@demo.com | password123 |

## Deployment

- **API (NestJS):** deploy `apps/api` to [Render](https://render.com) as a Web Service. Set `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN` (your Vercel URL) in Render's environment settings. Use a managed Postgres instance (Render Postgres or Neon).
- **Frontend (Next.js):** deploy `apps/web` to [Vercel](https://vercel.com). Set `NEXT_PUBLIC_API_URL` to your Render API URL.
- Update `CORS_ORIGIN` on the API once you have the live Vercel URL, and redeploy.

**Live demo:** _add deployed link here once live_
**Demo video:** _add video link here_

## Project status

This repo is built incrementally in the open per the PRD milestones. Current phase: see [`PRD.md § Milestones`](./PRD.md#7-milestones).

## License

MIT