# ShopEasy— Full-stack Marketplace Starter

A responsive marketplace web app that also works as an installable Progressive Web App (PWA) on mobile. Built with React + Vite, Express, MongoDB, JWT authentication, and Razorpay Checkout integration.

## Features
- Product catalog, category/search filters, product detail pages
- Shopping cart and wishlist (persisted in browser for the starter)
- Sign up/sign in with JWT
- Checkout creates a pending order and Razorpay payment order
- Razorpay signature verification before marking an order paid
- Order history
- Admin product management and order overview
- Product reviews/ratings
- Responsive mobile-first UI and PWA manifest

## Important setup
This is a functional starter, not a production-audited commerce platform. Before public launch, add rate limiting, email verification/password reset, robust inventory reservation, shipping/tax rules, audit logging, monitoring, backups, and security review. Never store raw card details. Razorpay keys must be configured on the server; only the key ID is sent to the browser.

## Requirements
- Node.js 20+ and npm
- MongoDB local or MongoDB Atlas account
- Razorpay account for online payments (test mode first)

## Project structure
```text
marketplace-app/
  client/
    public/manifest.webmanifest
    src/
      components/
      pages/
      context/
      api.js
      App.jsx
      main.jsx
      styles.css
    index.html
    package.json
    vite.config.js
  server/
    src/
      middleware/auth.js
      models/
      routes/
      seed.js
      index.js
    .env.example
    package.json
  .gitignore
  README.md
```

## 1. MacBook / VS Code setup
```bash
# Install Node.js LTS from https://nodejs.org if needed
node -v
npm -v

cd ~/Projects
# unzip the downloaded project zip here, then:
cd marketplace-app
```

Create local environment files:
```bash
cp server/.env.example server/.env
```
Edit `server/.env` and set `MONGODB_URI`, a long random `JWT_SECRET`, and Razorpay test keys. You can get test keys from the Razorpay Dashboard. Do not commit `.env`.

Install and run:
```bash
npm install --prefix server
npm install --prefix client
npm run seed --prefix server
```
Terminal 1:
```bash
npm run dev --prefix server
```
Terminal 2:
```bash
npm run dev --prefix client
```
Open http://localhost:5173

Demo admin is created by the seed script:
- Email: `admin@shopeasy.local`
- Password: `ChangeMe123!`
Change it immediately and never use this demo password in production.

## 2. Razorpay payments
1. Create a Razorpay account and enable Test Mode.
2. Copy the Key ID and Key Secret into `server/.env`.
3. Restart the server.
4. Test checkout with Razorpay's official test payment details from its documentation.
5. Before production, configure the correct business account, webhook endpoint, refund handling, and reconciliation. Never put `RAZORPAY_KEY_SECRET` in the client.

If payment keys are absent, checkout returns a clear configuration error rather than pretending a payment succeeded.

## 3. Testing
```bash
npm run test --prefix server
npm run build --prefix client
```
Manual smoke test:
- Register a normal account and log in.
- Browse/search/filter products and open a product detail.
- Add an item to cart and wishlist.
- Submit a review while logged in.
- Sign in as admin and add/edit/delete products.
- Add item to cart, go to checkout, and complete a Razorpay test payment.
- Check order history and admin order overview.
- Test at mobile widths in browser dev tools and try "Add to Home Screen" on a deployed HTTPS URL.

## 4. Deployment
### Backend
Deploy `server` to Render, Railway, Fly.io, or another Node host.
- Build: `npm install`
- Start: `npm start`
- Set environment variables from `.env.example`.
- Set `CLIENT_ORIGIN` to your deployed frontend origin.
- Configure MongoDB Atlas network access securely.

### Frontend
Deploy `client` to Vercel or Netlify.
- Build command: `npm run build`
- Output directory: `dist`
- Set `VITE_API_URL` to your deployed backend URL plus `/api`.
- Configure SPA fallback to `index.html` if the host requires it.

### Mobile
This project is a PWA: on iOS Safari use Share → Add to Home Screen; on Android Chrome use Install app. If you need store-published native apps, a React Native/Expo client can be added to the same API; this repository does not include native store builds.

## Production checklist
- Replace all demo credentials and secrets.
- Use HTTPS, secure CORS origins, rate limiting, request validation, and security headers.
- Add email verification, password reset, MFA for admins, and account lockout.
- Add payment webhooks and reconciliation; verify payment signatures server-side.
- Add inventory reservation/transaction logic, shipping, tax, refund and cancellation workflows.
- Add privacy policy, terms, return policy, and applicable tax/payment compliance.
- Add logging, backups, alerting, dependency scanning, and automated integration tests.
