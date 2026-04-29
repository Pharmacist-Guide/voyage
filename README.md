# Voyage

Voyage is a separate travel-planning site for Zachary.

## What’s in this build

- Immersive travel hero with Bali-inspired scenic imagery
- Semi-transparent search console over the hero image
- Destination cards for Bali, Paris, Kauai, and Amalfi
- Trip type selectors for flight, cruise, or combined planning
- Departure criteria builder for specific dates and date ranges
- Multiple mixed departure criteria selections
- Trip detail fields for budget, travelers, ports, and cruise line preferences
- Quick Escape and Specific Goal modules
- Built-in Bug reporting flow with visual snip, comment, and local submit storage
- Minimalist, polished, high-end travel aesthetic

## Notes

The Specific Goal module is scaffolded to reflect Meridian / Atlas calendar overlap checking, but live calendar access still requires the connected integration layer.
Bug reports are stored locally in `localStorage` under `voyageBugReports` and mirrored to `window.__atlasBugReports` for app-level retrieval.

## Local preview

Open `index.html` directly in a browser.

## Deployment

This repo is intended for Vercel deployment as a lightweight static site.
