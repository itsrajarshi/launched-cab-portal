# UI/UX Audit

## Screen-by-screen review

| Screen | Strengths | Issues |
|--------|-----------|--------|
| Home (`/`) | Clean hero, clear CTAs, dark-mode support | Static; no product preview/screenshot |
| Login (`/auth/login`) | Animated role-based wallpaper, glass card, role selector | No password visibility toggle; no "forgot password"; loading state missing (no spinner while awaiting API) |
| Register (`/auth/register`) | Simple, consistent | No password confirmation, no strength hint, no loading state on submit |
| Dashboard home (`/dashboard`) | Role-based greeting, animated cards, nice visual hierarchy | Fullscreen greeting overlay blocks content for 1.8s on every load |
| Bookings (company) | Full CRUD table + filters + CSV export | Monolithic; no skeletons; `alert()`-driven refresh; debug span visible |
| Bookings (vendor) | Accept/assign/start/end trip workflow + boarding-pass card | Auto-opening trip modal; fake animated km/amount; `alert()` polling |
| Drivers | CRUD + validation | Basic table; duplicated form styling |
| Vehicles | CRUD | Same duplication; unused mapping code |
| Invoices | Tabs + monthly report + status pills | File upload ignored; `dummyInvoices` dead prop |
| Manual booking | Simple form | No dark-mode styles on inputs |
| Profile | Read-only email/role | "Save Changes" button disabled with no purpose |

## Consistency & visual language

- **Strengths**: cohesive glassmorphism, consistent blue/purple palette, dark mode across pages,
  thoughtful animations (page-fade, card-pop, modal-pop, boarding-pass).
- **Issues**:
  - Input/button styling is copy-pasted (same class string ~40×) → drift risk and bloat.
  - Dark mode is applied per-page via repeated `dark:` classes rather than semantic tokens.
  - Two conflicting dark-mode systems (Tailwind `media` strategy + `DarkModeToggle` class toggle).

## States

- **Loading**: plain "Loading..." text in tables; no skeletons/spinners.
- **Empty**: minimal "No bookings found." text; no empty-state illustration/CTA.
- **Error**: inconsistent; some pages use inline text, others `alert()`, others none.
- **Success**: only manual-booking shows a success message; elsewhere mutations are silent.

## Suggested modern improvements

1. Skeleton loaders for tables/cards.
2. Toast notifications for all mutations (replace `alert()`).
3. Consistent empty states with CTAs.
4. Password visibility + confirm-password + submit loading spinners on auth forms.
5. Reduce/replace the fullscreen greeting overlay (make it a dismissible one-time banner).
6. Move the trip animation off `setInterval` client simulation to backend-driven progress.

See `UI_UX_AUDIT` findings mapped to roadmap High #12, #13 and Medium #18/#19.
