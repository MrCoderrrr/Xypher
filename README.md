# PromptForge / PromptMarket

PromptForge is a full-stack prompt marketplace where users can discover AI prompts, buy platform tokens, purchase prompts from creators, run prompt-based generations, and manage their own prompt library. Creators can upload prompts, earn token-based revenue, and request payouts. Admins can review prompts, manage creators, and process payout requests.

The visible product name in the UI is currently `PromptMarket`, while the project folder is named `promptforge`. Treat these as the same application unless you intentionally rename the brand across the codebase.

This README is intentionally detailed so a human or AI coding agent can quickly understand the system, extend it, and avoid breaking important flows.

## Table of Contents

- [What This App Does](#what-this-app-does)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Development Scripts](#development-scripts)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Authentication Model](#authentication-model)
- [Database Models](#database-models)
- [API Reference](#api-reference)
- [Core Product Workflows](#core-product-workflows)
- [Token and Revenue Logic](#token-and-revenue-logic)
- [Generation Logic](#generation-logic)
- [Admin Logic](#admin-logic)
- [Seed Data](#seed-data)
- [AI Agent Guide](#ai-agent-guide)
- [Known Implementation Notes](#known-implementation-notes)
- [Suggested Next Steps](#suggested-next-steps)

## What This App Does

PromptForge is organized around four user groups:

1. Visitors browse approved prompts, creator profiles, and pricing.
2. Authenticated users buy token packs, purchase prompts, run generations, and view their library.
3. Creators upload prompts, view creator dashboards, track earnings, and request payouts.
4. Admins review pending prompts, manage creators, and process payout requests.

The app uses a token economy:

- Users buy token packs through Razorpay or a development-mode fake order.
- Users spend tokens to buy prompts.
- Prompt purchases split revenue between creator and platform.
- Users spend additional tokens when running a generation from a purchased prompt.
- Creator earnings become available balance for payout requests.

## Tech Stack

### Frontend

- React 19
- Vite 8
- React Router 7
- Tailwind CSS 3
- Clerk React for authentication
- Axios for API calls
- Lucide React for icons
- React Hot Toast
- Razorpay checkout script

### Backend

- Node.js
- Express 5
- MongoDB with Mongoose 9
- Clerk Express middleware
- Razorpay SDK
- Cloudinary packages are installed for media uploads
- Multer and `multer-storage-cloudinary` are installed for file upload support
- Nodemon for local development

## Repository Structure

```text
promptforge/
  README.md
  run-dev.ps1
  .gitignore

  client/
    .env.example
    package.json
    vite.config.js
    tailwind.config.js
    postcss.config.js
    index.html
    src/
      main.jsx
      App.jsx
      index.css
      config/
        env.js
      components/
        AuthButtons.jsx
        Cards.jsx
        ProtectedRoute.jsx
        Shell.jsx
      data/
        mockData.js
      pages/
        Home.jsx
        Explore.jsx
        PromptDetail.jsx
        Generate.jsx
        CreatorProfile.jsx
        Pricing.jsx
        UserDashboard.jsx
        Library.jsx
        CreatorDashboard.jsx
        UploadPrompt.jsx
        Payouts.jsx
        AdminDashboard.jsx
        ManagePrompts.jsx
        ManageCreators.jsx
        ManagePayouts.jsx
      utils/
        axios.js
        razorpay.js

  server/
    .env.example
    package.json
    index.js
    config/
      db.js
      cloudinary.js
    controllers/
      adminController.js
      generationController.js
      paymentController.js
      promptController.js
      userController.js
    middleware/
      auth.js
      isAdmin.js
      isCreator.js
    models/
      Generation.js
      Payout.js
      Prompt.js
      Purchase.js
      TokenTransaction.js
      User.js
    routes/
      admin.js
      auth.js
      generation.js
      payments.js
      prompts.js
      users.js
    scripts/
      seed.js
```

Generated folders such as `client/node_modules`, `server/node_modules`, and `client/dist` are not part of the source architecture.

## Quick Start

### 1. Install dependencies

Run this once for each app:

```powershell
cd client
npm install

cd ..\server
npm install
```

### 2. Create environment files

Copy the examples:

```powershell
copy client\.env.example client\.env
copy server\.env.example server\.env
```

At minimum, the backend needs `MONGO_URI`.

### 3. Start both apps

From the project root:

```powershell
.\run-dev.ps1
```

This starts:

- Backend: `http://localhost:5000`
- Frontend: `http://127.0.0.1:5173`

The helper script starts both processes in hidden windows. If you prefer visible logs, run the apps manually:

```powershell
cd server
npm run dev
```

```powershell
cd client
npm run dev
```

## Environment Variables

### Client

File: `client/.env`

```env
VITE_CLERK_PUBLISHABLE_KEY=
VITE_API_URL=
```

`VITE_CLERK_PUBLISHABLE_KEY` enables Clerk authentication in the browser. If it is empty, the frontend bypasses Clerk wrapping in `main.jsx` and `ProtectedRoute` returns children directly.

`VITE_API_URL` controls the Axios base URL. If empty, the app falls back to:

```text
http://localhost:5000/api
```

### Server

File: `server/.env`

```env
MONGO_URI=
CLERK_SECRET_KEY=
CLOUDINARY_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
FAL_API_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
CLIENT_URL=
PORT=
```

Important behavior:

- `MONGO_URI` is required. The server refuses to start without it.
- `CLERK_SECRET_KEY` enables real Clerk request authentication through `@clerk/express`.
- If `CLERK_SECRET_KEY` is empty, the backend supports a development authentication mode using headers such as `x-clerk-id`.
- Razorpay keys are optional for development. Without them, token orders are created in `dev` mode.
- Cloudinary and FAL variables are present for future media and AI integrations, but the current generation controller only interpolates prompt text.

## Development Scripts

### Root

```powershell
.\run-dev.ps1
```

Starts the backend and frontend together.

### Client

```powershell
npm run dev
npm run build
npm run preview
npm test
```

`npm test` is currently a placeholder that exits with an error.

### Server

```powershell
npm run dev
npm start
npm run seed
npm test
```

`npm test` is currently a placeholder that exits with an error.

## Frontend Architecture

The frontend entry point is `client/src/main.jsx`.

It creates the React app, wraps it in `BrowserRouter`, and conditionally wraps it in `ClerkProvider` only when `VITE_CLERK_PUBLISHABLE_KEY` exists.

Routing lives in `client/src/App.jsx`. Every route is wrapped by `Shell`, which provides the shared layout, header navigation, mobile navigation, auth buttons, and token purchase shortcut.

### Route Map

| Path | Component | Access |
| --- | --- | --- |
| `/` | `Home.jsx` | Public |
| `/explore` | `Explore.jsx` | Public |
| `/prompt/:id` | `PromptDetail.jsx` | Public |
| `/generate/:id` | `Generate.jsx` | Signed-in user |
| `/creator/:id` | `CreatorProfile.jsx` | Public |
| `/pricing` | `Pricing.jsx` | Public |
| `/dashboard` | `UserDashboard.jsx` | Signed-in user |
| `/library` | `Library.jsx` | Signed-in user |
| `/creator/dashboard` | `CreatorDashboard.jsx` | Creator |
| `/creator/upload` | `UploadPrompt.jsx` | Creator |
| `/creator/payouts` | `Payouts.jsx` | Creator |
| `/admin` | `AdminDashboard.jsx` | Admin |
| `/admin/prompts` | `ManagePrompts.jsx` | Admin |
| `/admin/creators` | `ManageCreators.jsx` | Admin |
| `/admin/payouts` | `ManagePayouts.jsx` | Admin |

### Protected Routes

`client/src/components/ProtectedRoute.jsx` handles protected screens.

When Clerk is disabled, protected routes are allowed locally. When Clerk is enabled:

1. It waits for Clerk auth and user state.
2. It sends the Clerk token to `POST /api/auth/sync`.
3. The backend creates or updates the local MongoDB user.
4. The frontend checks local role fields such as `isCreator` and `isAdmin`.
5. If the role is missing, it renders an access restricted message.

### API Client

`client/src/utils/axios.js` exports a configured Axios instance:

```js
const api = axios.create({
  baseURL: apiBaseURL,
});
```

The base URL comes from `client/src/config/env.js`.

### Razorpay Loader

`client/src/utils/razorpay.js` loads Razorpay checkout once and reuses the same promise for later calls. This prevents duplicate script tags.

### Mock Data

`client/src/data/mockData.js` contains sample prompts, purchases, generations, payouts, creators, and stats. Some pages may use this as fallback/demo content while backend integration continues.

## Backend Architecture

The backend entry point is `server/index.js`.

Startup flow:

1. Load `.env` with `dotenv`.
2. Create an Express app.
3. Enable CORS.
4. Enable JSON body parsing.
5. Enable Clerk middleware only if `CLERK_SECRET_KEY` exists.
6. Register API route modules.
7. Register 404 and error handlers.
8. Connect to MongoDB.
9. Start listening on `PORT` or `5000`.

### Mounted Routes

```js
app.use("/api/auth", authRoutes);
app.use("/api/prompts", promptRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/generation", generationRoutes);
app.use("/api/admin", adminRoutes);
```

### Error Handling

The backend has a centralized error handler for:

- Invalid Mongo object IDs (`CastError`)
- Duplicate unique fields (`11000`)
- Mongoose validation errors
- Generic server errors

## Authentication Model

Authentication is split between Clerk and the local MongoDB user record.

### Real Clerk Mode

When `CLERK_SECRET_KEY` is present:

- `server/index.js` installs `clerkMiddleware()`.
- `middleware/auth.js` reads the Clerk user ID from `getAuth(req)?.userId`.
- `requireUser` looks up a local user by `clerkId`.
- If no local user exists, protected API calls return `401 User not synced`.
- The frontend normally prevents this by calling `POST /api/auth/sync`.

### Development Auth Mode

When `CLERK_SECRET_KEY` is empty:

- `getRequestClerkId` accepts `x-clerk-id`, `req.body.clerkId`, or `req.query.clerkId`.
- `requireUser` auto-creates a development user if it cannot find one.
- The development user starts with:
  - `tokenBalance: 10000`
  - `isCreator: true`
  - `isAdmin: true`
  - `creatorTier: "elite"`

Example development request:

```powershell
curl http://localhost:5000/api/users/me -H "x-clerk-id: dev-user-1"
```

## Database Models

### User

File: `server/models/User.js`

Represents an authenticated platform account.

Important fields:

- `clerkId`: unique Clerk user ID or development ID.
- `username`: unique display name.
- `email`: unique email.
- `avatar`: image URL.
- `tokenBalance`: spendable platform tokens.
- `isCreator`: enables creator routes and dashboards.
- `isAdmin`: enables admin routes.
- `creatorTier`: one of `starter`, `rising`, `pro`, `elite`.
- `totalEarnings`: lifetime creator earnings.
- `availableBalance`: creator balance available for payout.
- `lastLoginAt`: updated during auth sync.

### Prompt

File: `server/models/Prompt.js`

Represents a marketplace prompt.

Important fields:

- `creatorId`: user who owns the prompt.
- `title`, `description`, `category`, `targetAI`.
- `deliveryMode`: `live` or `text`.
- `promptContent`: template string that may contain variables like `{{product}}`.
- `variables`: structured variable definitions with `name`, `label`, and `placeholder`.
- `sampleOutputs`: example output URLs or text snippets.
- `tokenPrice`: purchase cost.
- `tags`: search and filtering labels.
- `status`: `pending`, `approved`, or `rejected`.
- `totalSales`: sales counter.
- `uniqueBuyers`: list of users who bought the prompt.

### Purchase

File: `server/models/Purchase.js`

Represents one user buying one prompt.

Important fields:

- `buyerId`
- `promptId`
- `creatorId`
- `tokensPaid`
- `creatorEarnings`
- `platformEarnings`

The purchase model automatically splits revenue before validation:

- Creator gets 75 percent.
- Platform gets 25 percent.

There is a unique compound index on `buyerId + promptId`, so a user cannot buy the same prompt twice.

### Generation

File: `server/models/Generation.js`

Represents one generation run.

Important fields:

- `userId`
- `promptId`
- `inputVariables`
- `outputUrl`
- `output`
- `aiUsed`
- `tokensUsed`
- `status`: `processing`, `completed`, or `failed`.

Current generation behavior produces interpolated prompt text, not a real call to FAL/OpenAI/Runway/etc.

### Payout

File: `server/models/Payout.js`

Represents a creator payout request.

Important fields:

- `creatorId`
- `amount`
- `method`: `upi` or `bank`
- `paymentDetails`
- `status`: `pending`, `processed`, or `failed`
- `requestedAt`
- `processedAt`
- `adminNote`

### TokenTransaction

File: `server/models/TokenTransaction.js`

Represents token and money ledger events.

Transaction types:

- `token_purchase`
- `prompt_purchase`
- `generation`
- `refund`
- `payout`

The `referenceId` field is uniquely indexed when present, which helps prevent duplicate credits for the same payment or event.

## API Reference

All backend routes are prefixed with:

```text
http://localhost:5000/api
```

Protected routes need a valid Clerk bearer token in production. In development auth mode, pass `x-clerk-id`.

### Auth Routes

Base path: `/api/auth`

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/sync` | Authenticated Clerk user | Create or update the local MongoDB user from Clerk profile data |
| `GET` | `/me` | User | Return the current user profile |

### User Routes

Base path: `/api/users`

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/me` | User | Return user, purchases, recent generations, and transactions |
| `PATCH` | `/me` | User | Update `username` or `avatar` |
| `POST` | `/become-creator` | User | Mark current user as a creator |
| `GET` | `/creators` | Public | List creator profiles |
| `GET` | `/creators/:id` | Public | Get a creator profile and approved prompts |

### Prompt Routes

Base path: `/api/prompts`

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/` | Public | List approved prompts; admins can filter by status |
| `GET` | `/mine` | Creator | List current creator's prompts |
| `POST` | `/` | Creator | Create a prompt in `pending` status |
| `GET` | `/:id` | Public or owner/admin | Get prompt details |
| `PATCH` | `/:id` | Owner/admin | Update prompt fields |
| `DELETE` | `/:id` | Owner/admin | Delete prompt |
| `POST` | `/:id/purchase` | User | Buy an approved prompt with tokens |

List query parameters:

- `category`
- `q`
- `creatorId`
- `status` for admins

Prompt categories:

- `image`
- `video`
- `text`
- `audio`

### Payment Routes

Base path: `/api/payments`

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/token-packs` | Public | List available token packs |
| `POST` | `/orders` | User | Create a Razorpay token order or dev order |
| `POST` | `/verify` | User | Verify payment and credit tokens |
| `POST` | `/payouts` | Creator | Request payout from available balance |
| `GET` | `/payouts/me` | User | List current user's payout requests |
| `GET` | `/transactions/me` | User | List current user's token transactions |

Current token packs:

| ID | Name | Tokens | Amount |
| --- | --- | ---: | ---: |
| `starter` | Starter | 500 | 499 INR |
| `growth` | Growth | 1500 | 1299 INR |
| `studio` | Studio | 5000 | 3999 INR |

### Generation Routes

Base path: `/api/generation`

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/` | User | List current user's generations |
| `POST` | `/` | User | Run a prompt generation |
| `GET` | `/:id` | Owner/admin | Get one generation |

Generation request shape:

```json
{
  "promptId": "mongodb_prompt_id",
  "inputVariables": {
    "product": "wireless headphones",
    "audience": "students"
  },
  "tokensUsed": 12
}
```

If `tokensUsed` is not provided, the backend charges:

```text
max(1, ceil(prompt.tokenPrice * 0.1))
```

### Admin Routes

Base path: `/api/admin`

Every admin route requires both:

- Authenticated user
- `isAdmin: true`

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/` | Platform overview stats |
| `GET` | `/prompts` | List prompts, optionally filtered by status |
| `PATCH` | `/prompts/:id/review` | Approve, reject, or reset a prompt to pending |
| `GET` | `/creators` | List creators |
| `PATCH` | `/creators/:id` | Update creator tier, creator flag, or admin flag |
| `GET` | `/payouts` | List payouts, optionally filtered by status |
| `PATCH` | `/payouts/:id/process` | Mark a payout as processed or failed |

## Core Product Workflows

### New User Sync

1. User signs in with Clerk.
2. Frontend enters a protected route.
3. `ProtectedRoute` calls `POST /api/auth/sync`.
4. Backend reads Clerk ID from request auth.
5. Backend upserts a local `User`.
6. Protected page receives local role data.

### Creator Uploads a Prompt

1. User must have `isCreator: true`.
2. Frontend submits prompt data to `POST /api/prompts`.
3. Backend validates required fields.
4. Prompt is saved with `status: "pending"`.
5. Admin later approves or rejects it.
6. Only approved prompts are visible to public users.

### User Purchases a Prompt

1. User opens an approved prompt.
2. User sends `POST /api/prompts/:id/purchase`.
3. Backend rejects purchase if:
   - Prompt does not exist.
   - Prompt is not approved.
   - Buyer is also the creator.
   - Buyer already purchased it.
   - Buyer lacks token balance.
4. Backend deducts prompt price from buyer.
5. Backend creates a `Purchase`.
6. Creator receives 75 percent of token price as earnings.
7. Platform records 25 percent as platform earnings.
8. Prompt sales counters are updated.
9. Token transaction is recorded.

### User Runs a Generation

1. User must own the prompt or be the prompt creator.
2. Backend calculates generation cost.
3. Backend deducts tokens from the user.
4. Backend interpolates `{{variable}}` placeholders in `promptContent`.
5. Backend creates a completed `Generation`.
6. Backend records a token transaction.

### Creator Requests Payout

1. User must have `isCreator: true`.
2. Creator submits amount, method, and payment details.
3. Backend atomically subtracts amount from `availableBalance`.
4. Backend creates a pending `Payout`.
5. Backend records a payout transaction.
6. Admin marks payout as `processed` or `failed`.
7. If failed, backend refunds the amount to creator `availableBalance`.

## Token and Revenue Logic

The token economy is implemented in:

- `server/controllers/paymentController.js`
- `server/controllers/promptController.js`
- `server/controllers/generationController.js`
- `server/models/Purchase.js`
- `server/models/TokenTransaction.js`

Important rules:

- Token pack amounts are stored server-side in `paymentController.js`.
- Dev orders are returned when Razorpay credentials are missing.
- Real Razorpay payments require signature verification.
- Duplicate token payment credits are prevented with `TokenTransaction.referenceId`.
- Prompt purchase balance deduction uses `findOneAndUpdate` with `tokenBalance: { $gte: price }`.
- Creator/platform split happens in the `Purchase` model pre-validation hook.

## Generation Logic

The generation controller does not currently call a real AI provider. It uses this interpolation rule:

```js
template.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_, key) => {
  const value = variables[key];
  return value === undefined || value === null || value === "" ? `[${key}]` : String(value);
});
```

Example:

```text
Prompt: "Create an ad for {{product}} targeting {{audience}}."
Input:  { "product": "running shoes", "audience": "marathon runners" }
Output: "Create an ad for running shoes targeting marathon runners."
```

If a variable is missing, the output keeps a visible placeholder like `[audience]`.

This is a good integration point for a real AI/image/video/audio provider. The model already supports `outputUrl`, `output`, `aiUsed`, `tokensUsed`, and `status`.

## Admin Logic

Admin access is enforced by:

- `requireUser`
- `isAdmin`
- `router.use(requireUser, isAdmin)` in `server/routes/admin.js`

Admin features include:

- Overview stats
- Prompt review
- Creator management
- Payout processing

Admin stats currently include:

- User count
- Creator count
- Prompt count
- Pending prompt count
- Pending payout count
- Generation count
- Platform earnings from purchases

## Seed Data

The server has a seed script:

```powershell
cd server
npm run seed
```

Use this to populate development data if `server/scripts/seed.js` is configured for your local database.

## AI Agent Guide

This section is written specifically for AI coding agents that need to modify the project safely.

### Start Here

Read these files first:

1. `README.md` for product and architecture.
2. `client/src/App.jsx` for routes.
3. `client/src/components/ProtectedRoute.jsx` for frontend auth behavior.
4. `server/index.js` for backend boot and route mounting.
5. `server/middleware/auth.js` for real and development auth behavior.
6. `server/models/*.js` before changing controller logic.
7. The route file before editing a controller, so you know the public API contract.

### Do Not Assume

- Do not assume Clerk is always enabled. The app supports a no-Clerk development mode.
- Do not assume Razorpay is always configured. Payment order creation has a dev fallback.
- Do not assume generation calls a real AI API. It currently interpolates prompt templates.
- Do not assume all pages are fully backend-backed. Some frontend pages may still use mock data.
- Do not assume the project name is consistent. UI says `PromptMarket`; folder says `promptforge`.

### When Adding a New API Endpoint

Follow the existing backend pattern:

1. Add controller function in the correct `server/controllers/*Controller.js` file.
2. Wrap async logic with the local `asyncHandler`.
3. Add route in `server/routes/*.js`.
4. Reuse `requireUser`, `isCreator`, and `isAdmin` middleware when appropriate.
5. Validate required request fields at the controller boundary.
6. Return JSON objects with named root keys, such as `{ prompt }`, `{ user }`, or `{ payouts }`.
7. Let centralized error handling catch Mongoose errors.

### When Adding a New Database Field

Update all relevant places:

1. Mongoose model.
2. Controller create/update allowlist.
3. Frontend forms.
4. Frontend display pages.
5. Seed data if applicable.
6. README model documentation.

### When Working on Auth

Keep the distinction clear:

- Clerk identity is external.
- MongoDB `User` is the local application account.
- Role checks use local MongoDB fields.
- Development mode can create users automatically.

### When Working on Tokens

Be careful with balance updates. Prefer atomic updates like:

```js
User.findOneAndUpdate(
  { _id: userId, tokenBalance: { $gte: cost } },
  { $inc: { tokenBalance: -cost } },
  { new: true }
);
```

This avoids spending tokens the user does not have.

### When Working on Purchases

Remember:

- A user cannot buy their own prompt.
- A user cannot buy the same prompt twice.
- Prompt must be approved.
- Buyer balance must be deducted.
- Creator and platform earnings are calculated by the `Purchase` model.
- If purchase creation fails after balance deduction, refund the buyer.

### When Working on Payouts

Remember:

- Creator balance is reduced before payout creation.
- If payout creation fails, the balance must be restored.
- If an admin marks a payout as failed, the balance is refunded.
- Only pending payouts should be processed.

### Testing Checklist for AI Agents

After making code changes, run the smallest relevant checks available:

```powershell
cd client
npm run build
```

```powershell
cd server
npm start
```

There are no real automated tests yet. If you add tests, update this README with the exact commands.

Manual smoke test:

1. Start backend and frontend.
2. Open `http://127.0.0.1:5173`.
3. Browse `/explore`.
4. Open a prompt detail page.
5. In dev auth mode, call a protected API using `x-clerk-id`.
6. Buy a token pack in dev mode.
7. Purchase a prompt.
8. Run a generation.
9. Request a payout as a creator.
10. Process the payout as admin.

## Known Implementation Notes

- `server/config/cloudinary.js` is currently empty even though Cloudinary dependencies and env vars exist.
- `FAL_API_KEY` exists in `.env.example`, but generation currently does not call FAL.
- `adminController.processPayout` assigns `payout.adminNote = adminNote`, but `adminNote` is not currently destructured from `req.body`.
- `adminController.reviewPrompt` reads `adminNote` from the request body, but the `Prompt` model does not currently store an admin note.
- The frontend auth path syncs users only from protected routes.
- Axios does not globally attach Clerk bearer tokens; protected pages that need API calls may need local token headers or an interceptor.
- The root `.gitignore` is very small and should probably ignore `node_modules`, `.env`, and build output.
- `npm test` is still a placeholder in both client and server.

## Suggested Next Steps

1. Add a complete `.gitignore` for Node, Vite, env files, logs, and build artifacts.
2. Wire Axios to include Clerk tokens automatically for authenticated API calls.
3. Complete Cloudinary upload support for prompt sample outputs.
4. Replace interpolation-only generation with real provider integrations.
5. Add automated tests for token purchase, prompt purchase, generation, and payout flows.
6. Decide whether the product name should be `PromptForge` or `PromptMarket`, then update UI, scripts, and docs consistently.
7. Add request validation with a schema library for safer API inputs.
8. Add pagination to prompt, creator, transaction, generation, and admin list endpoints.
9. Add admin notes to the appropriate models if review and payout notes are part of the product.

