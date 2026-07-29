# Ukay-Ukay Website Build Prompt (CREATE Format)

Use this prompt with an AI coding assistant (e.g. Claude, Claude Code, or another LLM) to build the platform.

---

## Character

You are a senior full-stack product engineer who specializes in lightweight, mobile-first e-commerce tools for small independent retailers in the Philippines. You default to simple, fast, low-maintenance solutions over feature-heavy platforms, because the end users are shop staff working on their phones in a physical store, not developers. You understand thrift/ukay-ukay retail specifically: every item is one-of-a-kind, inventory turns over daily, and speed of listing matters more than polish.

## Request

Build a web application for an ukay-ukay (thrift) business with two connected halves:

1. **Seller dashboard** (mobile-first, used by staff in-store)
   - Camera capture flow: guided multi-shot capture (front, back, tag/label, flaws) with a frame overlay and a live checklist
   - Tagging screen: tap-chip selectors for category, size, and condition (no dropdowns), auto-generated SKU, editable price
   - One-tap publish that makes the item live immediately
   - Inventory dashboard: stats (live listings, sold this week, reserved, revenue), searchable/filterable grid of items with status badges (Available / Reserved / Sold)
   - Item detail/edit screen: editable while Available or Reserved; read-only sale summary (sold price, time-to-sell, payment method) once Sold, with a Relist option

2. **Customer-facing shop page**
   - Browsable grid of available items, filterable by size, category, price
   - Item page with photos, size, condition, price, and a way to reserve/order (e.g. GCash or COD)
   - Items disappear from public view the instant they're marked Sold

## Examples

Reference these interaction patterns already validated in mockups:
- Capture screen: circular shutter button, dashed frame guide, "Shot X of 4" progress label, thumbnail strip filling left to right as photos are taken
- Tagging: selected chip is filled/highlighted (e.g. category "Dress" selected vs. "Top" unselected), SKU field is auto-filled and locked
- Dashboard: 4-column stat cards at top, item cards show a colored status pill in the top-left corner of the thumbnail
- Sold item detail: photos shown at reduced opacity, all fields become a read-only summary instead of inputs

## Adjustment

- Prioritize speed: staff should be able to go from "item in hand" to "published" in under a minute
- Mobile-first for the seller dashboard; the customer shop page should work well on both mobile and desktop
- Use tap-friendly controls (chips, large buttons) over dropdowns or multi-step forms wherever possible
- Support local payment/fulfillment norms: GCash and Cash on Delivery/pickup, prices in ₱ (PHP)
- Build with **React, TypeScript, and Next.js** for the frontend. Pair it with a low-cost backend-as-a-service (e.g. Supabase or Firebase) for auth, database, and image storage — avoid over-engineering for a small business's scale
- Data must stay consistent: since each item is unique, once something is Sold it must disappear from the public shop immediately, not on a delay or batch job

## Types

Deliverables should include:
- A Next.js (App Router) project structure using TypeScript throughout, with typed props/interfaces for items, form data, and API responses
- A simple data model for `items` (id, photos, category, size, condition, price, status, SKU, date_added, date_sold, sold_price, payment_method, notes)
- Frontend components/screens for: camera capture, tagging form, dashboard, item detail/edit, customer shop grid, customer item page
- Basic backend setup: database schema, image storage, and real-time or near-real-time updates so new listings and sold items reflect instantly
- Optional: a short setup/deployment guide suitable for a non-technical shop owner to maintain

## Evaluation

The build should be judged against:
- **Speed**: can a staff member list a new item (photos + tags + publish) in under 60 seconds on a phone?
- **Clarity**: is item status (Available / Reserved / Sold) unambiguous at a glance, both in the dashboard and on the public shop?
- **Consistency**: does a Sold item vanish from the public shop immediately, with no stale listings?
- **Simplicity**: could a non-technical shop owner or staff member use the seller dashboard with no training beyond a two-minute walkthrough?
- **Cost**: does the stack stay within free-tier or low-cost hosting for a small business's expected volume (tens to low hundreds of items/month)?