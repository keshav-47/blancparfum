# BLANC PARFUM Frontend Knowledge

Last scanned: 2026-06-17

This repo is the BLANC PARFUM customer/admin frontend. It is paired with the backend repo at `../parfum`.

## Repo Identity

- Path: `C:\Users\mitta\OneDrive\Desktop\blancparfum`
- Git branch: `main`
- Remote: `https://github.com/keshav-47/blancparfum.git`
- Stack: Vite 5, React 18, TypeScript, Redux Toolkit, React Router, Tailwind, shadcn/Radix UI, Framer Motion, React Query, Firebase Auth, Razorpay checkout, Vercel Analytics/Speed Insights.
- Package manager artifacts present: `package-lock.json`, `bun.lock`, and `bun.lockb`.
- Main app entry: `src/main.tsx`, `src/App.tsx`.
- Backend API default: `https://api.blancparfum.in/api` from `src/config/api.ts`, override with `VITE_API_BASE_URL`.

## Important Commands

- Dev server: `npm run dev` or `bun run dev`; Vite is configured on port `8080`.
- Production build: `npm run build`.
- Development build: `npm run build:dev`.
- Lint: `npm run lint`.
- Tests: `npm run test`.
- Preview build: `npm run preview`.

## App Shell And Routing

`src/App.tsx` wraps the app with:

- Redux `Provider`
- `HelmetProvider`
- React Query `QueryClientProvider`
- `TooltipProvider`
- Browser Router
- global `Toaster` and `Sonner`
- Vercel `Analytics` and `SpeedInsights`
- Lenis smooth scrolling and scroll-to-top on route changes

Routes are lazy-loaded with page-specific skeleton fallbacks.

Public routes inside `RootLayout`:

- `/`
- `/shop`
- `/collection/:slug`
- `/product/:id`
- `/custom`
- `/cart`
- `/about`
- `/contact`
- `/pricing`
- `/login`
- `/complete-profile`
- `/profile`
- `/privacy`
- `/terms`
- `/refund-policy`
- `*` for not found

Admin routes are guarded by `src/components/admin/AdminGuard.tsx` and wrapped in `src/components/admin/AdminLayout.tsx`:

- `/admin`
- `/admin/products`
- `/admin/collections`
- `/admin/orders`
- `/admin/custom-requests`

`AdminGuard` redirects unauthenticated users to `/login`, non-admin users to `/`, and allows only `user.role === "ADMIN"`.

## Layout And UI Patterns

- `RootLayout` is the persistent public shell with navbar/footer and the global assistant chat.
- `Layout.tsx` is intentionally a no-op wrapper because the persistent shell moved to `RootLayout`; pages still use `<Layout>` for compatibility.
- UI primitives live in `src/components/ui`, mostly shadcn/Radix components.
- Animation utilities live in `src/components/animations`.
- Home/commerce components live in `src/components/home`.
- SEO is centralized in `src/components/SEO.tsx`; default canonical base is `https://blancparfum.in` and default OG image is `https://blancparfum.in/og-image.png`.

## API Client Contract

`src/api/apiClient.ts` is the central Axios client:

- Base URL comes from `BASE_URL`.
- Default timeout is 10 seconds.
- Sends cookies with every request via `withCredentials: true`.
- Unwraps backend responses shaped as `{ success, data, message }` by replacing `response.data` with `response.data.data`.
- On 401, calls `POST /auth/refresh`; the backend reads the HttpOnly refresh cookie and rotates both auth cookies.
- Queues concurrent failed requests while refresh is in progress.
- Clears cached `auth_user` if refresh fails.
- Deletes legacy `auth_token` and `refresh_token` localStorage keys on startup.

Because the interceptor unwraps `ApiResponse`, thunks usually read `res.data` as the actual payload, not the wrapper.

## Redux Store

Store setup: `src/store/index.ts`.

Slices:

- `products`: public product cards and collections, category filter.
- `cart`: local/server cart with fallback behavior for guests or network errors.
- `user`: profile, addresses, and user orders.
- `auth`: Google login, Firebase phone login, complete registration, cookie-backed session restore, cached user profile.
- `admin`: dashboard, products, collections, orders, custom requests, admin custom email.
- `customRequests`: user bespoke fragrance requests.
- `assistant`: global concierge transcript, pending action, recommended product IDs, open/closed state.

Persistent local storage keys:

- `bp_cart`: guest/local cart state.
- `auth_user`: serialized profile cache only. Auth tokens must not be stored in localStorage.

## Shared Frontend Types

Core domain types live in `src/types/index.ts`.

Important shapes:

- `Product`: id, slug, name, tagline, price, category, images, sizes, description, notes, flags.
- `ProductSize`: `ml`, `price`, `stockQuantity`.
- `Collection`: id, slug, name, description, image, productIds.
- `CartItem`: productId, name, image, size, price, quantity.
- `Order`: id, date, status, items, total, optional customer fields.
- `UserProfile`: id, name, email, phone, avatar, role, addresses.
- `Address`: label, street, city, state, zip, country, isDefault.
- `CustomRequest`: status, scentFamilies, occasion, intensity, message/admin notes and customer fields.

Integration note: backend roles are `CUSTOMER` and `ADMIN`, but `UserProfile.role` currently says `"USER" | "ADMIN"`. Since the only frontend role check is `ADMIN`, normal customer behavior is mostly unaffected, but future role work should align this type to backend `CUSTOMER`.

## Public Commerce Flows

Products:

- `fetchProducts` calls `GET /products`.
- Backend returns lightweight product cards only: no notes, no description, no sizes.
- `productsSlice` normalizes cards into the full `Product` shape with empty arrays/fields.
- Product detail page calls `apiClient.get<Product>(/products/:id)` directly and receives full detail by ID or slug.

Collections:

- `fetchCollections` calls `GET /collections`.
- `CollectionDetail` loads products and collections from the shared `products` slice, then filters by `collection.productIds`.

Cart:

- Guests use local Redux/localStorage cart only.
- Authenticated users use server cart endpoints and fall back to local updates on network errors.
- `fetchServerCart`: `GET /cart`.
- `addItemToCart` and `updateItemQuantity`: `POST /cart/items`.
- `removeItemFromCart`: `DELETE /cart/items/{productId}/{size}`.
- Server stock/validation errors with status 400 are surfaced instead of falling back locally.
- Auth login/registration syncs local cart to backend with `POST /cart/sync`.

Checkout:

- `src/hooks/useCheckout.ts` is the single shared checkout flow used by cart and assistant checkout.
- Flow: `POST /orders` with `{ addressId }`, open Razorpay checkout, then `POST /orders/{orderId}/verify`.
- Razorpay script URL: `https://checkout.razorpay.com/v1/checkout.js`.
- Payment details are never handled by this app; only Razorpay modal receives them.
- On successful verification, frontend clears the cart.

## Auth And Registration

Login page: `src/pages/Login.tsx`.

Supported auth methods:

- Google Sign-In via Google Identity Services. Client ID can be overridden with `VITE_GOOGLE_CLIENT_ID`; a fallback client ID is hardcoded.
- Firebase phone OTP for Indian phone numbers using `+91`.

Auth slice behavior:

- Existing users receive `user`; the backend sets `bp_access_token` and `bp_refresh_token` as HttpOnly cookies.
- New users receive `newUser: true` and `registrationToken`; frontend redirects to `/complete-profile`.
- `completeRegistration` posts name/email/phone plus registration token to `POST /auth/register`.
- App startup dispatches `restoreSession`, which calls `/user/profile`; the cookie authenticates the request and the response refreshes Redux/local cached user state.
- Logout calls `POST /auth/logout`, then clears Redux state, the profile cache, and cart cache.
- `returnTo` query param is preserved through login and complete-profile.
- Admin users are sent to `/admin`; customers to the return path or `/`.

Firebase client config is hardcoded in `src/config/firebase.ts` for project `blancparfum-755d5`.

## Assistant / Concierge

Frontend assistant API: `src/api/assistantApi.ts`.

Endpoint:

- `POST /assistant/chat`
- Timeout override: 30 seconds because LLM calls can exceed the shared 10 second default.

Assistant state:

- `messages`: user/assistant turns.
- `lastProductIds`: recommended products returned by backend.
- `pendingAction`: validated action returned by backend.
- `open`: whether the full-screen concierge is open globally.

Supported action types:

- `none`
- `add_to_cart`
- `remove_from_cart`
- `view_cart`
- `sign_in`
- `add_address`
- `select_address`
- `place_order`
- `go_to_checkout`

`AssistantActionBar` executes or presents confirmed actions:

- Adds/removes cart items through `cartSlice`.
- Navigates to login/cart when appropriate.
- Uses `AssistantCheckout` for view/select/place-order actions.
- Pushes assistant notes back into the chat after local user-confirmed operations.

`RootLayout` supports `/?concierge=open` and continues the chat after sign-in so the user can resume a concierge-led purchase.

## Admin Console

Admin API thunks live in `src/store/slices/adminSlice.ts`.

Dashboard:

- `GET /admin/dashboard`.

Products:

- `GET /admin/products`.
- `POST /admin/products`.
- `PUT /admin/products/{id}`.
- `DELETE /admin/products/{id}`.
- `POST /admin/products/{id}/images` multipart `file`.

Collections:

- `GET /admin/collections`.
- `POST /admin/collections`.
- `PUT /admin/collections/{id}`.
- `DELETE /admin/collections/{id}`.
- `POST /admin/collections/{id}/images` multipart `file`.

Orders:

- `GET /admin/orders`.
- `PUT /admin/orders/{id}/status`.

Custom requests:

- `GET /admin/custom-requests`.
- `PUT /admin/custom-requests/{id}` with `{ status, adminNotes }`.
- `POST /admin/send-email`.

Admin pages are in `src/pages/admin`.

## Backend Integration Map

Frontend base path already includes `/api`, so frontend calls use short paths like `/products`, `/cart`, `/admin/products`.

Important backend defaults from `../parfum`:

- Server port: `8080` unless `PORT` is set.
- CORS default: `https://blancparfum.in,http://localhost:5173`.
- Backend public endpoints: auth, products, collections, assistant, webhooks, health.
- Backend protected endpoints: cart, orders, user profile/addresses, custom requests.
- Backend admin endpoints require role `ADMIN`.

Local dev warning: frontend Vite is also configured for port `8080`, which conflicts with the backend default. When running both locally, use a different frontend port or backend `PORT`, and set `VITE_API_BASE_URL` accordingly.

## Deployment And Static Assets

- Frontend hosting is on Vercel.
- Vercel auto-deploys after a commit is pushed to the connected repository/branch.
- `vercel.json` rewrites all paths to `index.html` for SPA routing.
- Security headers include frame deny, nosniff, strict referrer policy, HSTS, and permissions policy.
- Public SEO files: `public/robots.txt`, `public/sitemap.xml`.
- Brand/media assets live in `src/assets`.

## Tests And Current Coverage

- Vitest config: `vitest.config.ts`.
- Test setup: `src/test/setup.ts` mocks `window.matchMedia`.
- Current test file: `src/test/example.test.ts`, a smoke example only.
- There are no meaningful component, slice, checkout, auth, or API integration tests yet.

## Future Change Notes

- Keep API requests going through `apiClient` unless a call must bypass interceptors.
- Remember that `apiClient` unwraps `ApiResponse`; do not expect `res.data.data`.
- Do not reintroduce access or refresh token storage in localStorage/sessionStorage; browser auth is cookie-backed.
- Align frontend role type with backend `CUSTOMER`/`ADMIN` before adding customer-role logic.
- Be careful with cart quantity semantics: `POST /cart/items` sets server quantity, while the local guest add path increments existing quantity.
- Product cards intentionally omit detail fields; detail pages must fetch the product directly.
- Do not expose backend secrets in frontend env/config. Public Firebase and Google client IDs are okay, but JWT/Razorpay secret/LLM/Brevo/Cloudinary credentials belong only in backend env.
