# Travel Companion Matching App

This project contains the existing React/Vite frontend and a MongoDB backend in `backend/`.

## Requirements

- Node.js 20+
- MongoDB 7+ running locally or a MongoDB Atlas connection string
- npm

## Configure MongoDB

1. Copy `backend/.env.example` to `backend/.env`.
2. Set `MONGO_URI` to your local MongoDB URI or Atlas URI.
3. Replace `JWT_SECRET` with a long random value.
4. Keep `CLIENT_ORIGIN=http://localhost:8443` for the included Vite dev server.

Example local values:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/travel_companion
JWT_SECRET=use-a-long-random-secret-here
CLIENT_ORIGIN=http://localhost:8443
NODE_ENV=development
```

Never commit `backend/.env`. It is excluded by `.gitignore`.

## Install

From the project root:

```powershell
npm install
Set-Location backend
npm install
Set-Location ..
```

## Start the backend

```powershell
Set-Location backend
npm run dev
```

The backend runs at the port configured by `backend/.env` (currently `http://localhost:5000`).

Check it with:

```powershell
Invoke-RestMethod http://localhost:5000/api/health
```

A healthy response reports `ok: true` and `database: connected`.

## Configure email for password resets

The forgot-password flow requires SMTP values in `backend/.env` to deliver real OTP emails.

Example:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM=your-email@gmail.com
```

Notes:

- Gmail requires an app password, not the regular Gmail password.
- Mailtrap is also a good option for local testing.
- If SMTP is not configured, the app logs the OTP in the backend terminal and shows the code in the browser for local demo use.

## Start the frontend

In a second terminal from the project root:

```powershell
$env:VITE_PORT = "8443"
npm run dev:client
```

Open `http://localhost:8443/`. Vite proxies `/api` requests to the backend.

> Avoid setting the shared `PORT` environment variable for the frontend. Use `VITE_PORT` (or `CLIENT_PORT`) instead so the backend keeps its own port.

## API overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET/PATCH /api/profile`
- `PATCH /api/profile/beneficiary`
- `PATCH /api/profile/preferences`
- `GET/POST/PATCH/DELETE /api/trips`
- `POST /api/trips/:id/join-requests`
- `GET/PATCH /api/trips/:id/join-requests`
- `GET/POST/PATCH /api/connections`
- `GET/POST /api/chat/rooms/:roomId/messages`
- `GET/POST /api/reviews`
- `GET/PATCH /api/notifications`
- `POST /api/sos` and `POST /api/sos/:id/cancel`
- `POST /api/reports`

Protected endpoints require `Authorization: Bearer <token>`. The frontend stores the JWT in local storage after login or registration and attaches it to API requests.

## Validation

```powershell
Set-Location backend
npm run check
Set-Location ..
npm run build
```

MongoDB must be running and `backend/.env` must be configured for the backend to start successfully.
