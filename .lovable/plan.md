

# BLANC — Luxury Perfume E-Commerce Website

## Design Direction
Inspired by Jean Paul Gaultier's site: high-fashion, editorial aesthetic with full-bleed hero imagery, elegant typography, minimal UI chrome, and a luxurious color palette (cream/ivory backgrounds, black text, gold accents).

## Pages & Features

### 1. Landing Page (Home)
- **Hero carousel** — full-screen image slideshow with overlay text and CTA buttons
- **Featured Collections** — horizontal scroll of curated perfume collections
- **Product Grid** — filterable product listing (by category: Men, Women, Unisex, New Arrivals)
- **Brand Story section** — editorial block about BLANC
- **Newsletter signup** — email capture modal/section

### 2. Product Detail Page
- Large product imagery with gallery
- Name, price, size selector, quantity, "Add to Cart" button
- Description, notes (top/heart/base), and ingredients tabs
- Related products carousel

### 3. Custom Perfume Request Page
- Multi-step form: select preferred scent families, notes, occasion, intensity
- Optional message/special instructions textarea
- Submit request (API-ready)

### 4. Cart Page
- Line items with image, name, size, quantity adjuster, price
- Remove item, subtotal, shipping estimate, total
- "Proceed to Checkout" button (placeholder for future checkout flow)

### 5. Profile Section
- User info display (name, email, avatar placeholder)
- Order history list (dummy data)
- Saved addresses
- Custom perfume request history

### 6. Shared Components
- **Navbar** — BLANC logo centered, nav links (Shop, Custom, About), cart icon with badge, profile icon
- **Footer** — brand info, social links, newsletter, legal links
- **Mobile-responsive** hamburger menu

## State Management & API Architecture
- **Redux Toolkit** store with slices: `products`, `cart`, `user`, `customRequests`
- **API service layer** using `createAsyncThunk` with a configurable `BASE_URL` constant
- All API calls go through a centralized `apiClient` (axios instance with interceptors)
- Static fallback data used when API calls fail or backend isn't ready
- Easy to swap dummy data for real API responses later

## Tech Additions
- `@reduxjs/toolkit` + `react-redux` for state management
- `axios` for HTTP client

