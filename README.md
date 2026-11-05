# ReFound - Lost & Found Platform

**Lost. Located. Returned.**

ReFound is a MERN-stack web app where people can report lost items, post found items, search the listings, and send/manage claim requests to get items back to their owners.

## Tech stack

- Frontend: React (Vite), React Router, Axios, plain CSS
- Backend: Node.js, Express, REST API
- Database: MongoDB Atlas with Mongoose
- Auth: JWT + bcryptjs
- Images: Multer + Cloudinary

## Features

- Register, login, logout (JWT), protected pages
- Report lost items and found items (with optional image)
- Explore page: search by name, filter by type / category / location, sort by date
- Item details page (only the reporter's name is public)
- Claim requests: send a claim on a found item, owner accepts or rejects
- Contact details are shown only after a claim is accepted
- My Reports: edit, delete, mark as recovered
- Dashboard with statistics and recent activity
- Profile page (edit name, phone, location)

## Folder structure

```
ReFound/
  backend/    Express API (models, controllers, routes, middleware)
  frontend/   React app (pages, components, services, context)
```

## Setup

You need Node.js 18+ and a free MongoDB Atlas account. A Cloudinary account is needed only if you want image uploads (items can be posted without images).

### 1. Backend

```bash
cd backend
npm install
```

Open `backend/.env` and fill in your values:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=any_long_random_text
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

Start the server:

```bash
npm run dev
```

You should see `MongoDB connected` and `Server running on port 5000`. Opening http://localhost:5000 shows `{"message":"ReFound API is running"}`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

## API endpoints

| Method | Route | Description | Login needed |
|---|---|---|---|
| POST | /api/auth/register | Register | No |
| POST | /api/auth/login | Login | No |
| GET | /api/auth/me | Current user | Yes |
| PUT | /api/auth/profile | Update profile | Yes |
| GET | /api/items | All items (search, category, type, location, sort) | No |
| GET | /api/items/my | My items | Yes |
| POST | /api/items | Create report | Yes |
| GET | /api/items/:id | One item | No |
| PUT | /api/items/:id | Update (owner only) | Yes |
| PATCH | /api/items/:id/recovered | Mark recovered (owner only) | Yes |
| DELETE | /api/items/:id | Delete (owner only) | Yes |
| POST | /api/claims | Send claim | Yes |
| GET | /api/claims/my | Claims I sent | Yes |
| GET | /api/claims/received | Claims on my found items | Yes |
| PATCH | /api/claims/:id | Accept / reject (item owner only) | Yes |

## How claims work (good for viva)

1. Someone posts a **Found** item (status `Active`).
2. The real owner opens it and sends a claim with a message and identifying details.
3. The finder sees it in **My Claims > Received** and accepts or rejects it.
4. On accept: claim becomes `Accepted`, item becomes `Claimed`, other pending claims are auto-rejected, and both people can now see each other's phone/email.
5. After handing the item over, the finder clicks **Mark recovered** and the item becomes `Recovered`.

Rules enforced by the backend: you cannot claim your own item, you cannot claim twice (also enforced by a unique index), only `Found` + `Active` items can be claimed, and only the item's reporter can accept or reject.

## Deployment (short guide)

- Backend (Render): root directory `backend`, build `npm install`, start `npm start`. Add all `.env` values as environment variables. Set `CLIENT_URL` to your frontend URL.
- Frontend (Vercel/Netlify): root directory `frontend`, build `npm run build`, output `dist`. Set `VITE_API_URL` to `https://your-backend-url/api`. Add a rewrite of all routes to `/index.html` so page refresh works with React Router.
- MongoDB Atlas: allow network access from `0.0.0.0/0` (or your host's IPs).

Never commit `.env` files.
