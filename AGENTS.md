# GeoTarget Intelligence — Project Context

GeoTarget Intelligence is a web-based geological exploration decision-support
platform. Its first mineral focus is chrome in Zimbabwe, with room to support
additional minerals and African markets later.

## Product boundary

- The core workflow is: Create Project → Import Data → Validate Data → Explore
  Map Layers → Run Target Screening → Review Targets.
- The software supports exploration decisions; it must never claim to guarantee
  a mineral discovery.
- Implement and review one phase at a time. Do not build later workspaces before
  the current phase is accepted.

## Technology

- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: Django, Django REST Framework, GeoDjango
- Database: PostgreSQL with PostGIS
- Mapping: MapLibre GL JS with OpenFreeMap
- Drawing: Terra Draw
- Local development: Docker Compose

## Engineering conventions

- Keep the architecture as a single frontend, backend, and spatial database.
- Prefer small, maintainable modules over premature abstractions.
- Store project boundaries in WGS 84 (EPSG:4326) unless a documented operation
  requires a projected CRS.
- Validate GeoJSON at API boundaries and explain CRS transformations in comments.
- Add tests with each behavior change.
- Keep secrets out of the repository; document variables in `.env.example`.

## Interface direction

- Use a dark-navy expandable sidebar, teal primary actions, white content
  surfaces, consistent typography, and responsive layouts.
- The sidebar must collapse to an icon-only navigation rail.
- Map views should maximize map area and use collapsible controls and panels.
- Avoid redundant dashboards, verbose copy, and controls without behavior.

## Map Workspace context

- Treat Overview, Layers, Inspect, and Compare as interaction states of one
  reusable Map Workspace, not separate implementations.
- Keep the map as the primary working surface and use progressive disclosure for
  controls and attributes.
- Layer groups must remain commodity-neutral even though demonstration content
  currently focuses on chrome.
- Only validated, project-authorized data should become available as map layers.
- Feature details are attribute-driven; missing fields must be shown as missing,
  never invented.
- Browser GeoJSON uses EPSG:4326. Preserve source CRS and perform authoritative
  transformations and spatial filtering in GeoDjango/PostGIS.

## Projects Workspace context

- Treat All Projects and Project Overview as connected states of one Projects
  workspace.
- Keep portfolio content concise: identity, location, status, commodities, area,
  targets, datasets, ownership, and recent activity.
- Chrome is the first mineral focus, but commodity display and filtering must be
  data-driven so additional minerals do not require new page implementations.
- Demonstration portfolio records must remain isolated behind a replaceable data
  boundary until the project REST endpoints are available.
- Do not fabricate map workspaces for demonstration projects without spatial
  datasets. The current interactive map belongs to the Great Dyke Chrome demo.
- Recommended actions are professional review prompts, not discovery predictions.

## Common commands

- Start all services: `docker compose up --build`
- Frontend checks: `cd frontend && npm run check`
- Backend checks: `docker compose run --rm backend python manage.py check`
- Backend tests: `docker compose run --rm backend python manage.py test`

