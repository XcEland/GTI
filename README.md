# GeoTarget Intelligence

GeoTarget Intelligence is a web-based geological exploration intelligence
platform for organising spatial data, understanding geological context, and
prioritising areas for professional review. The initial product focus is chrome
exploration in Zimbabwe, with an architecture that can support more commodities
and African markets over time.

> GeoTarget is a decision-support system. It helps exploration teams review
> evidence consistently; it does not guarantee mineral discoveries.

## Product workflow

The intended workflow is:

**Create Project → Import Data → Validate Data → Explore Map Layers → Run Target
Screening → Review Targets**

The current implementation establishes the application foundation, a portfolio
Dashboard, a connected Projects workspace, project creation backed by PostGIS,
and a high-fidelity Map Workspace prototype.

## Dashboard

The Dashboard is the default landing screen and provides a concise operational
view of the exploration portfolio. It combines project, dataset, and target
counts with a featured project, a live MapLibre project-location map, recent
activity, screening progress, and shortcuts into the existing project flows.

Project totals and the featured project are derived from the same project data
used by the Projects workspace. Dataset and activity entries remain clearly
scoped demonstration content until those backend workspaces are implemented.

## Data Workspace

The Data workspace models the dataset lifecycle as connected views instead of
separate applications:

1. **Data Library** — project dataset search, type/status filtering, selection,
   spatial preview, metadata and map handoff.
2. **Add Data** — a focused entry screen for uploads, API imports, and reuse of
   previously validated datasets.
3. **Upload Dataset** — drag-and-drop/file selection, essential metadata and a
   concise validation/publish stepper.
4. **API Import** — provider selection, project AOI preview, import options, and
   a review summary.
5. **Data Sources** — grouped external, internal, and manually managed sources.
6. **Validation Queue** — automated issue review and handoff for professional
   geological approval.
7. **Dataset Details and Geological Approval** — live MapLibre previews,
   metadata, quality evidence, reviewer context, and explicit decisions.

The current dataset records are isolated demonstration data. Spatial previews
use OpenFreeMap with lightweight WGS 84 demonstration overlays; they do not
represent authoritative geological rasters. File and import controls validate
the frontend workflow but require durable dataset APIs and object storage in the
next backend milestone.

## Targets Workspace

The Targets workspace provides a deliberately small review flow:

1. **Target Library** — search and filter screening candidates, compare review
   status and screening runs, and inspect their live MapLibre locations.
2. **Target Detail** — review the candidate location, deposit-model context,
   screening method, source confidence, and supporting evidence.
3. **Geological Target Review** — complete a traceability checklist, document
   reviewer comments, request missing evidence, or recommend fieldwork.

Target records are isolated demonstration data until project-scoped target APIs
are implemented. A screening rank indicates review order only; it is never
presented as the probability of finding a mineral deposit.

## Projects Workspace

The Projects workspace is the entry point for the exploration portfolio. It has
three connected flows:

1. **All Projects** — a responsive portfolio with project search, ownership tabs,
   commodity and status filters, sorting, grid/list layouts, recent activity,
   and a featured project.
2. **Project Overview** — project identity and spatial metadata, evidence counts,
   a live project map preview, workflow progress, recent activity, and recommended
   next actions.
3. **Create Project** — a validated four-state wizard for project metadata, Terra
   Draw polygon/rectangle drawing or GeoJSON import, review, API submission, and
   a successful handoff to project details or the Map Workspace.

Select any project card to open its overview. The Great Dyke Chrome Project uses
labelled demonstration geology. Newly created projects open with their saved AOI
as the only approved map layer until project datasets are imported and validated.
Actions that belong to unimplemented workspaces explain their milestone boundary
rather than presenting a dead control.

The static portfolio records remain labelled demonstration data. API-created
projects are loaded from Django and merged into the same reusable project views.

## Create Project workflow

1. Enter the project name, primary commodity, country, project type, and optional
   description. Chrome and Zimbabwe are first-class defaults, while the choices
   remain extensible for other commodities and markets.
2. Draw one polygon or rectangle with Terra Draw, or import a GeoJSON `Polygon`
   or `FeatureCollection`. The UI calculates immediate spherical estimates.
3. Review the metadata, boundary, area, perimeter, and vertex count.
4. Submit once to Django. GeoDjango validates the WGS 84 polygon, stores it in
   PostGIS, projects a copy into the centroid's local UTM zone for authoritative
   metric calculations, and returns the created project.
5. Continue to the new project overview or open its boundary in Map Workspace.

## Map Workspace

The Map Workspace is a shared, map-first interface with four interaction states:

1. **Overview** — project context, approved visible layers, map navigation, scale,
   coordinates, basemap selection, and a compact legend.
2. **Layers** — grouped geological layers with immediate visibility and opacity
   controls, plus an available-data state.
3. **Inspect** — selectable map features, geometry highlighting, a compact popup,
   and an attribute-driven details panel.
4. **Compare** — a synchronized swipe view for comparing magnetic response and
   interpreted geology without duplicating the workspace.

Open **Map Workspace** from the sidebar or from the Great Dyke project overview.
Use the **View** selector in the top bar to review each state. The map tools
provide zoom, fit-to-project, feature inspection, geodesic distance measurement,
and fullscreen mode. Search accepts a target identifier such as `CHR-021` or a
WGS 84 coordinate pair such as `29.82, -18.48`.

The current browser data is explicitly marked as demonstration data. It exists
to validate interaction and visual design while the project-scoped spatial APIs
are implemented. Geological values are not presented as exploration conclusions.

## Technology

| Area | Technology |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Mapping | MapLibre GL JS, OpenFreeMap |
| Drawing foundation | Terra Draw |
| Backend | Django, Django REST Framework, GeoDjango |
| Spatial database | PostgreSQL with PostGIS |
| Development | Docker Compose |

## Repository structure

```text
GTI/
├── frontend/
│   └── src/
│       ├── features/dashboard/       # Portfolio landing screen and live map
│       ├── features/data/            # Library, import, validation and approval
│       ├── features/projects/
│       ├── features/targets/         # Target library, detail and review flow
│       │   ├── components/    # Portfolio, wizard, AOI map and project overview
│       │   ├── data/          # Isolated demonstration portfolio and activity
│       │   ├── services/      # Django project API client and response adapter
│       │   ├── types/         # Project, status, activity and progress contracts
│       │   └── utils/         # Filtering and tested GeoJSON/metric utilities
│       ├── features/map-workspace/
│       │   ├── components/    # Map, panels, toolbar, legend and comparison UI
│       │   ├── data/          # Isolated demonstration dataset
│       │   ├── hooks/         # Workspace data and layer state
│       │   ├── services/      # API boundary for future backend integration
│       │   ├── types/         # Map and domain contracts
│       │   └── utils/         # Geospatial calculations
│       └── shared/            # Global application shell
├── backend/
│   ├── config/                # Django settings and root URLs
│   └── projects/              # GeoDjango model, serializers, API, tests, migration
├── docker-compose.yml
├── .env.example
└── AGENTS.md                  # Persistent product and engineering context
```

The workspaces are feature-based. Portfolio presentation, domain types, fixture
data, and filtering are separate from map rendering, geological layer state, and
spatial utilities. New commodities are data values rather than hard-coded page
variants, while chrome remains the initial product focus.

## Navigation and prototype routes

The browser defaults to the Dashboard. Useful review URLs are:

- `/?workspace=dashboard&view=overview`
- `/?workspace=data&view=library`
- `/?workspace=data&view=add`
- `/?workspace=data&view=upload`
- `/?workspace=data&view=api`
- `/?workspace=data&view=sources`
- `/?workspace=data&view=validation`
- `/?workspace=data&view=detail&dataset=geology-250k`
- `/?workspace=data&view=approval&dataset=airborne-magnetics`
- `/?workspace=targets&view=library`
- `/?workspace=targets&view=detail&target=GT-001`
- `/?workspace=targets&view=review&target=GT-001`
- `/?workspace=projects&view=list`
- `/?workspace=projects&view=create`
- `/?workspace=projects&view=detail&project=great-dyke-chrome-demo`
- `/?workspace=map&view=overview`
- `/?workspace=map&view=layers`
- `/?workspace=map&view=inspect`
- `/?workspace=map&view=compare`

Navigation is intentionally lightweight while the backend and authentication
contracts are being established. The URL is updated for reproducible design
review without introducing a routing dependency prematurely.

## Spatial conventions

- Browser GeoJSON is supplied as WGS 84 longitude/latitude (`EPSG:4326`).
- Uploaded data must retain its declared coordinate reference system.
- Unknown source coordinate systems must not be silently assigned.
- The interactive measure tool uses a Haversine calculation appropriate for
  quick project-scale estimates.
- Authoritative project area and perimeter values are calculated by GeoDjango in
  the local UTM zone selected from the AOI centroid.
- Larger vector datasets should later use viewport queries or vector tiles rather
  than full-dataset downloads.

## Run on Linux

### Docker Compose

Requirements: Docker Engine with the Compose plugin.

```bash
git clone <repository-url>
cd GTI
cp .env.example .env
docker compose up --build
```

Open:

- Frontend: <http://localhost:5173>
- Backend health check: <http://localhost:8010/api/health/>
- Project API: <http://localhost:8010/api/projects/>
- Django admin: <http://localhost:8010/admin/>

Stop the services with `Ctrl+C`, then run `docker compose down`. PostgreSQL data
is retained in the `postgres_data` Docker volume.

### Frontend without Docker

Node.js 22 or newer is recommended.

```bash
cd frontend
npm install
npm run dev
```

### Backend without Docker

GeoDjango requires the GDAL, GEOS, and PROJ system libraries. PostgreSQL must
have the PostGIS extension available.

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
cd backend
python manage.py migrate
python manage.py runserver
```

When running outside Compose, set the PostgreSQL connection variables in your
shell or `.env` equivalent.

## Configuration

Copy `.env.example` to `.env`. The principal settings are:

| Variable | Purpose |
| --- | --- |
| `POSTGRES_DB` | Spatial database name |
| `POSTGRES_USER` | Database user |
| `POSTGRES_PASSWORD` | Database password |
| `POSTGRES_HOST_PORT` | Host-side PostGIS port; defaults to `55433` |
| `BACKEND_HOST_PORT` | Host-side Django port; defaults to `8010` |
| `FRONTEND_HOST_PORT` | Host-side Vite port; defaults to `5173` |
| `DJANGO_SECRET_KEY` | Django signing key |
| `DJANGO_DEBUG` | Development debug mode |
| `DJANGO_ALLOWED_HOSTS` | Accepted backend hosts |
| `DJANGO_CORS_ALLOWED_ORIGINS` | Allowed frontend origins |
| `VITE_API_BASE_URL` | Browser-facing API base URL |

Never commit a real `.env` file or production credentials.

## Quality checks

```bash
# Frontend lint, unit tests, TypeScript compilation and production build
cd frontend
npm run check

# Frontend dependency audit
npm audit

# Backend validation and tests
cd ..
docker compose run --rm --no-deps backend sh -c \
  "python manage.py check && python manage.py test"
```

The frontend tests cover coordinate-distance behavior, project AOI validation and
metrics, display units, search, combined filters, sorting, and project lookup.
Backend tests verify readiness plus project create/list/retrieve behavior and
invalid-geometry rejection.

## Normal request and data workflow

1. On startup the browser requests `GET /api/projects/` and combines persisted
   projects with the explicitly labelled demonstration portfolio.
2. The wizard keeps unfinished metadata and AOI state in the browser. It sends
   one `POST /api/projects/` request only after review.
3. DRF validates the request and GeoDjango persists the polygon in PostGIS using
   SRID 4326, then returns canonical IDs, timestamps, and metric values.
4. The frontend adapts that response into the shared project model and updates
   the portfolio without a reload.
5. Project Details and Map Workspace receive the same saved polygon. New projects
   show a boundary-only map until approved layers are added in a later milestone.

### Project endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/projects/` | List persisted exploration projects |
| `POST` | `/api/projects/` | Validate and create a project with a polygon AOI |
| `GET` | `/api/projects/{uuid}/` | Retrieve one persisted project |

The frontend data adapter is already isolated in
`frontend/src/features/map-workspace/services/mapApi.ts` so fixture data can be
replaced by these APIs without rewriting the map controls.

## Current limitations

- The Map Workspace uses labelled demonstration geometries and attributes.
- Authentication and project permissions are not implemented yet.
- Dataset, layer, and target spatial endpoints are not implemented yet.
- OpenFreeMap styles require an internet connection during browser use.
- Layer comparison is a design-ready interaction and still needs backend-provided
  map layers before production use.

## Next milestone

The next development milestone is **Import and Validate Data**:

- Add project-scoped data source and dataset records with provenance.
- Upload geological, geophysical, occurrence, and sample files.
- Detect or require source CRS, transform validated data to WGS 84 for web maps,
  and report row/geometry validation errors before approval.
- Add project permissions and spatial-query tests.
- Expose approved project layers to Map Workspace through project-scoped APIs.

Later workspaces—data acquisition, validation, target screening, target review,
field planning, and reporting—remain intentionally out of scope until this phase
is reviewed.

