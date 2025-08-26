# URL Shortener App

A full‑stack URL shortener with a Node/Express/MongoDB backend and a React (Create React App) frontend.

### Tech Stack

- Backend: Node.js, Express, Mongoose, JWT, NanoID
- Frontend: React 18, CRA (react-scripts 5)
- Database: MongoDB

### Folder Structure

```
url-shortner-app/
├─ client/                      # React frontend (CRA)
│  ├─ package.json              # React 18 + react-scripts 5.0.1
│  ├─ package-lock.json
│  ├─ public/
│  │  ├─ index.html
│  │  ├─ favicon.ico
│  │  ├─ logo192.png
│  │  ├─ logo512.png
│  │  ├─ manifest.json
│  │  └─ robots.txt
│  └─ src/
│     ├─ index.js               # React app bootstrap
│     ├─ App.js                 # Renders UrlShortener
│     ├─ App.css
│     ├─ index.css
│     ├─ logo.svg
│     ├─ reportWebVitals.js
│     ├─ setupTests.js
│     └─ components/
│        └─ UrlShortener.js     # Shorten form + Admin UI (login, list URLs)
│
├─ server/                      # Node/Express backend
│  ├─ package.json
│  ├─ server.js                 # App entry, mounts routes
│  ├─ config/
│  │  └─ db.js                  # Mongo connection helper
│  ├─ controllers/
│  │  ├─ adminController.js     # adminLogin, listUrls
│  │  ├─ authController.js
│  │  └─ urlController.js       # shortenUrl, redirectToOriginal
│  ├─ middlewares/
│  │  ├─ authMiddleware.js      # protect, restrictTo
│  │  └─ globalErrorHandler.js
│  ├─ models/
│  │  ├─ Url.js                 # { originalUrl, shortCode, visitCount }
│  │  ├─ User.js
│  │  └─ adminUser.js
│  ├─ routes/
│  │  ├─ adminRoutes.js         # POST /login, GET /urls (protected)
│  │  ├─ authRoutes.js
│  │  └─ urlRoutes.js           # POST /api/v1/urls/shorten
│  └─ utils/
│     ├─ appError.js
│     ├─ catchAsync.js
│     └─ signToken.js
│
└─ README.md                    # This file
```

### How It Works

- POST `/api/v1/urls/shorten` with `{ originalUrl }` creates/returns a short URL.
- GET `/:shortcode` redirects to the original URL (root-level route in `server.js`).
- Admin:
  - POST `/api/v1/admin/login` → returns a JWT for admins.
  - GET `/api/v1/admin/urls` → lists all shortened URLs with `visitCount` (protected by `protect` + `restrictTo('admin')`).

### Prerequisites

- Node.js 18+ (for CRA 5 you may need OpenSSL legacy flag)
- MongoDB running locally or a cloud URI

### Environment

Create `server/.env` with:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/url_shortener
JWT_SECRET=replace_me
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7
NODE_ENV=development
```

### Install & Run

From the project root in PowerShell:
```
# 1) Backend
cd server
npm install
npm start  # node server.js

# 2) Frontend (in a new terminal)
cd ../client
npm install
# If Node 18/20 shows OpenSSL errors:
$env:NODE_OPTIONS="--openssl-legacy-provider"
npm start
```
Frontend runs at `http://localhost:3000` and proxies API calls to `http://localhost:5000`.

### Using the App

- Shorten a URL in the main form (must include http:// or https://).
- Open the returned Short URL; it will redirect and increment `visitCount`.

#### Admin UI (in the client)

- Click “Admin Login” to open the admin panel.
- Enter admin email and password, then “Login as Admin”.
  - On successful login: the email/password inputs are automatically cleared.
  - The JWT is kept in memory for the current session only.
- Click “View All URLs (Admin)” to fetch a protected list of all URLs.
  - A table shows: Short URL, Original URL, Visits (`visitCount`).
  - Button is disabled until you are logged in.
- Click “Logout” to clear the session token and admin data.

### API Examples

- Create short URL
```
POST http://localhost:5000/api/v1/urls/shorten
Content-Type: application/json

{ "originalUrl": "https://www.youtube.com" }
```
Response:
```
{ "shortUrl": "http://localhost:5000/AbC123" }
```
- Redirect: open `http://localhost:5000/AbC123` in the browser.
- Admin login:
```
POST http://localhost:5000/api/v1/admin/login
Content-Type: application/json

{ "email": "admin@example.com", "password": "password" }
```
- List URLs (requires Bearer token):
```
GET http://localhost:5000/api/v1/admin/urls
Authorization: Bearer <JWT>
```

### Troubleshooting

- Client won’t start on Node 18/20: set `NODE_OPTIONS=--openssl-legacy-provider`.
- Do NOT run `npm audit fix --force` inside `client`; it may break `react-scripts`.
- Ensure `server.js` has `app.get('/:shortcode', redirectToOriginal);` and server is on port 5000.
- Admin list returning 401/403: verify you are logged in as a user with `role: 'admin'` and that the `Authorization: Bearer <token>` header is sent by the client.

### Scripts

- Client
  - `npm start` – start CRA dev server
  - `npm run build` – production build
- Server
  - `node server.js` – start backend

### License

MIT
