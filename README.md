# Apna Kashichak

> Every place has a story. Every memory belongs somewhere.

Apna Kashichak is a community-driven platform to discover, preserve, and share photos and
videos connected to specific places — starting with **Kashichak and nearby areas in
Bihar**, built on a location hierarchy that scales to any village, town, city, or
landmark in India.

This repo contains **Phase 1**, a fully functional MVP:

- Home page, place search, and place explore/discovery
- Place details page with gallery + timeline
- User authentication (JWT)
- Multi-step memory upload (photo/video) with progress
- Google Drive storage for original-quality media
- Admin upload moderation (approve/reject)

Phase 2 (likes, tags, place suggestions, reports, profiles) and Phase 3 (Before &
Now, featured memories, analytics) are scaffolded in the data models and several
endpoints/pages already, and are the natural next milestones — see **Roadmap** below.

---

## Features (Phase 1)

- 🔍 Search & explore places with filters (state, district, sort)
- 🗺️ Scalable location hierarchy: Country → State → District → Area → Place, with
  duplicate prevention via normalized names (`Kashichak` = `kashichak` = `KASHICHAK`)
- 📸 Multi-step upload flow: pick a place (or suggest a new one) → upload media →
  add caption/story/date → review & submit
- 🕒 Per-place timeline, grouped by year captured
- 🖼️ Masonry gallery + full-screen lightbox viewer (photo & video)
- 👤 JWT auth, protected routes, role-based access (user/admin)
- 🛠️ Admin dashboard: overview stats, pending-upload moderation, place
  suggestion review, content reports
- ❤️ Likes (one per user per memory), 🚩 content reporting
- 🌓 Dark/light mode, responsive mobile-first UI, loading/empty/error states,
  toast notifications

## Tech Stack

**Frontend:** React, Vite, React Router, Tailwind CSS, Lucide React, react-hot-toast
**Backend:** Node.js, Express.js
**Database:** MongoDB + Mongoose
**Media storage:** Google Drive API (original quality, no compression)
**Auth:** JWT + bcrypt password hashing

---

## Project Structure

```
apna-kashichak/
├── client/                 # React + Vite frontend
│   └── src/
│       ├── components/     # Navbar, Footer, cards, loaders, ProtectedRoute
│       ├── pages/          # Home, Explore, PlaceDetails, Upload, Login, Signup, Profile, AdminDashboard
│       ├── context/        # AuthContext, ThemeContext
│       └── services/       # api.js (axios instance)
└── server/                 # Express backend
    ├── config/db.js
    ├── models/              # User, Place, Memory, PlaceSuggestion, Report, Like, BeforeNowComparison
    ├── middleware/          # auth, admin, upload (multer), errorHandler
    ├── services/googleDriveService.js
    ├── controllers/ + routes/
    └── server.js
```

---

## Getting Started

### 1. Prerequisites

- Node.js 18+
- A MongoDB database (local, or free tier on MongoDB Atlas)
- A Google Cloud project with the Drive API enabled

### 2. Install

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Configure environment variables

**`server/.env`** (copy from `server/.env.example`):

```
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/apna-kashichak
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://developers.google.com/oauthplayground
GOOGLE_REFRESH_TOKEN=your_google_refresh_token
GOOGLE_DRIVE_FOLDER_ID=your_google_drive_folder_id

MAX_IMAGE_SIZE_MB=15
MAX_VIDEO_SIZE_MB=200
```

**`client/.env`** (copy from `client/.env.example`):

```
VITE_API_BASE_URL=http://localhost:5000/api
```

### 4. MongoDB setup

- **Local:** install MongoDB Community Server, run `mongod`, use
  `MONGODB_URI=mongodb://localhost:27017/apna-kashichak`.
- **Atlas (recommended for quick start):** create a free cluster at
  mongodb.com/atlas, create a database user, whitelist your IP (or `0.0.0.0/0`
  for development), and copy the connection string into `MONGODB_URI`.

No manual schema setup needed — Mongoose creates collections and indexes
(including the case-insensitive duplicate-place index) automatically on first run.

### 5. Google Drive setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → create/select a project.
2. **APIs & Services → Library** → enable **Google Drive API**.
3. **APIs & Services → Credentials** → **Create Credentials → OAuth Client ID**
   → Application type: *Web application*. This gives you `GOOGLE_CLIENT_ID` and
   `GOOGLE_CLIENT_SECRET`.
4. Go to the [OAuth 2.0 Playground](https://developers.google.com/oauthplayground):
   - Click the gear icon → check **"Use your own OAuth credentials"** → paste your
     client ID/secret.
   - In the scope list, enter `https://www.googleapis.com/auth/drive.file` → **Authorize APIs**.
   - Sign in, then click **Exchange authorization code for tokens** → copy the
     **Refresh token** into `GOOGLE_REFRESH_TOKEN`.
5. In Google Drive, create a folder for uploads → open it → copy the folder ID
   from the URL (`drive.google.com/drive/folders/<THIS_PART>`) into
   `GOOGLE_DRIVE_FOLDER_ID`.

All of this lives in `server/services/googleDriveService.js` — it's the only
file that talks to Drive, so swapping providers later (S3, Cloudinary, etc.)
means rewriting just that one file.

### 6. Run it

```bash
# Terminal 1 — backend
cd server
npm run dev      # http://localhost:5000

# Terminal 2 — frontend
cd client
npm run dev       # http://localhost:5173
```

### 7. Create your first admin

Sign up normally through the UI, then promote that user to admin directly in
MongoDB (Phase 1 doesn't include an admin-invite flow):

```js
// in mongosh, or MongoDB Compass
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

---

## API Overview

All responses follow `{ success, message, data, meta? }`.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Log in |
| GET | `/api/auth/me` | user | Current user |
| GET | `/api/places` | — | List/search/filter places |
| GET | `/api/places/search-suggestions` | — | Typeahead search |
| GET | `/api/places/:slug` | — | Place details + years covered |
| POST/PUT/DELETE | `/api/places` | admin | Manage places |
| POST | `/api/places/merge` | admin | Merge duplicate places |
| GET | `/api/memories` | — | List/filter approved memories |
| GET | `/api/memories/timeline` | — | Memories grouped by year for a place |
| POST | `/api/memories` | user | Upload a memory (`multipart/form-data`, field `media`) |
| DELETE | `/api/memories/:id` | owner/admin | Delete a memory |
| POST | `/api/memories/:id/like` | user | Toggle like |
| POST | `/api/place-suggestions` | user | Suggest a new place |
| GET/POST | `/api/place-suggestions` | admin | Review suggestions |
| POST | `/api/reports` | user | Report a memory |
| GET/POST | `/api/reports` | admin | Review reports |
| GET | `/api/admin/overview` | admin | Dashboard stats |
| GET | `/api/admin/memories/pending` | admin | Moderation queue |
| POST | `/api/admin/memories/:id/approve|reject|feature` | admin | Moderate |

---

## Roadmap

**Phase 2** (models already exist; wire up remaining endpoints/pages):
tags-based browsing, a "my uploads" endpoint for the profile page, place
suggestion notifications.

**Phase 3:** Before & Now comparison slider (model `BeforeNowComparison`
already defined), featured/historical memory curation on the home page,
advanced filters, analytics dashboard.

## Deployment

- **Backend:** Render, Railway, or a VPS — set the same env vars, run `npm start`.
- **Frontend:** Vercel or Netlify — set `VITE_API_BASE_URL` to your deployed API
  URL, build with `npm run build`, deploy the `dist/` folder.
- Update `CLIENT_URL` on the backend and CORS will follow automatically.

## Security Notes

- Passwords hashed with bcrypt (12 rounds); JWTs expire and are verified on
  every protected route.
- All file validation (type/size) is enforced server-side via `multer`, not
  just in the UI.
- Google credentials never touch the frontend — uploads are proxied through
  the backend, which is the only thing holding Drive credentials.
- Rate limiting is applied globally and more tightly on `/api/auth`.
