# NaturallyU — MERN E-Commerce with CMS Page Builder

A block-based, CMS-editable e-commerce site (handmade soaps & skin care),
built on the MERN stack, deployable on Render (static frontend + web
service backend).

See `docs/PROJECT_DOCUMENTATION.docx` for the full architecture,
folder structure rationale, CMS design, and deployment guide.

## Quick start (local development)

### 1. Backend
```bash
cd server
cp .env.example .env    # fill in MONGO_URI, JWT_SECRET, etc.
npm install
npm run seed             # creates admin user + homepage blocks
npm run dev               # http://localhost:5000
```

### 2. Frontend
```bash
cd client
cp .env.example .env      # set VITE_API_URL
npm install
npm run dev                # http://localhost:5173
```

### 3. Log into the admin panel
Visit `http://localhost:5173/admin/login` using the `SEED_ADMIN_EMAIL`
/ `SEED_ADMIN_PASSWORD` you set in `server/.env` before seeding.

## Repo structure

```
naturallyu-project/
├── client/     # React (Vite) storefront + admin panel
├── server/     # Express + MongoDB API
├── docs/       # Full project documentation
└── render.yaml # Render Blueprint (deploys both services)
```

Full details in `docs/PROJECT_DOCUMENTATION.docx`.
