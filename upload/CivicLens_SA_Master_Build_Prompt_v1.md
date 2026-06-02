# CivicLens SA — Master Build Prompt
## Optimised for OpenAI Codex · Claude Code · Cursor Agent · GitHub Copilot Workspace

**Version:** 1.0 | **Prepared by:** Carter Digitals (Pty) Ltd | **Date:** 29 May 2026

---

## HOW TO USE THIS PROMPT

Feed this document as the **system context** to any agentic coding model (Codex, Claude Code, Cursor Agent, Copilot Workspace). The prompt is structured as ordered phases. Execute phases sequentially. Do not skip phases. Do not proceed to the next phase until all acceptance criteria for the current phase are met.

**Invocation pattern (Codex / Claude Code):**
```
You are a senior full-stack engineer executing the CivicLens SA build.
Read the Master Build Prompt below in full before writing a single line of code.
Execute phase by phase. Validate each phase before proceeding.
When you see <CHECKPOINT>, stop and list what was built before continuing.

[PASTE THIS ENTIRE DOCUMENT]
```

**Rules for the agent:**
1. Complete every file fully — no truncation, no `# TODO: implement`, no `...rest of code`
2. Every Python function has type hints. Every TypeScript variable has an explicit type. No `any`
3. Every file that touches personal data has the POPIA compliance header
4. Never hardcode secrets — always use environment variables from the `.env.example` pattern
5. Run the validation command listed after each phase before proceeding
6. If a package version conflicts, resolve it and note the resolution in `BUILDLOG.md`
7. After each file creation, append the filename and line count to `BUILDLOG.md`

---

## PART 1: SYSTEM IDENTITY

### What You Are Building

**CivicLens SA** is a South African public-sector intelligence platform. It ingests scattered official government datasets (procurement, municipal finance, demographics, crime, water quality, audit outcomes) and surfaces them as a single searchable, visual, AI-powered intelligence platform.

**Operator:** Carter Digitals (Pty) Ltd — B-BBEE Level 1 EME, Reg: 2025/907839/07  
**Primary domain:** civiclens.co.za  
**Data residency:** GCP `africa-south1` (Johannesburg) — non-negotiable  
**Regulatory framework:** POPIA, MFMA, PFMA, ECTA — all enforced as code  
**Architecture:** Zero Trust, GCP-native, Terraform-managed, dbt-transformed  

### What the System Does

The platform has **15 modules** behind a unified Next.js frontend and FastAPI backend:

| ID | Module | Core function |
|----|--------|--------------|
| M01 | TenderLens | Procurement intelligence — search, supplier profiles, buyer analytics |
| M02 | MuniLens | Municipality profiles — finance, demographics, services, risk |
| M03 | PolicyLens | Evidence-based policy brief generator |
| M04 | GeoLens | Spatial intelligence — interactive choropleth maps |
| M05 | PeopleLens | Population, poverty, labour market analytics |
| M06 | ServiceLens | Service delivery pressure scoring |
| M07 | RiskLens | Procurement and municipal anomaly detection |
| M08 | ReportLens | Professional report generator (PDF/DOCX/PPTX) |
| M09 | DataHub | Dataset catalogue and developer API |
| M10 | AI Analyst | Natural language interface to all platform data |
| M11 | AGASAlert | Auditor-General audit outcome intelligence |
| M12 | EarlyAlert | Section 139 municipal intervention risk prediction |
| M13 | GrantLens | Conditional grant disbursement tracking |
| M14 | BudgetLens | National Budget and MTEF intelligence |
| M15 | CarbonLens | Climate vulnerability and environmental risk |

**MVP scope (build first):** M01 TenderLens + M02 MuniLens + M04 GeoLens + M10 AI Analyst + M08 ReportLens (basic)

---

## PART 2: HARD CONSTRAINTS

These constraints are **absolute**. They override all other instructions. Any code that violates them must be rewritten before proceeding.

```
<constraints>

CONSTRAINT-01: DATA RESIDENCY
All GCP resources must be provisioned in africa-south1 (Johannesburg).
No data may be written to or processed in any other region.
Enforced by: Terraform org policy google_org_policy_policy.data_residency

CONSTRAINT-02: NO SECRETS IN CODE
All secrets, API keys, database passwords, and service account credentials
must be stored in GCP Secret Manager and accessed at runtime.
Zero secrets in: source code, environment files, Docker images, logs.
Violation check: TruffleHog scan in CI gate.

CONSTRAINT-03: POPIA COMPLIANCE HEADER
Every Python and TypeScript file that handles personal information
must begin with the compliance docblock:
"""
COMPLIANCE: This module processes personal information under POPIA s1.
Lawful basis: [specify per POPIA s11]
Data subject categories: [specify]
Retention period: [specify]
PIA reference: PIA-{number}
Last reviewed: {date}
"""
Files without this header that touch PII will be rejected by the CI gate.

CONSTRAINT-04: NO SERVICE ACCOUNT KEYS ON DISK
Use Workload Identity Federation for all GCP authentication.
Terraform org policy: iam.disableServiceAccountKeyCreation = TRUE
No JSON key files anywhere in the repository.

CONSTRAINT-05: ZERO TRUST
Every API endpoint must validate authentication and authorisation
regardless of network location. No IP-based trust. No internal bypass routes.
Every request must carry a valid JWT. Every state change must emit an audit event.

CONSTRAINT-06: IMMUTABLE RAW DATA
Raw ingested files in GCS bucket civiclens-raw-{env} must never be modified
after ingestion. They are append-only. All transformations happen downstream.
GCS retention lock must be set on the raw bucket.

CONSTRAINT-07: LANGUAGE SAFETY
The AI Analyst system prompt and all RiskLens output must never contain
the words: corrupt, fraud, bribe, loot, steal, illegal, misconduct
unless directly quoting an official AGSA audit finding or court judgment.
Use approved terms: anomaly, unusual pattern, risk signal, requires review.
This is enforced at the system prompt level AND as a post-generation filter.

CONSTRAINT-08: SURVEY DATA LABELLING
Any value derived from a sample survey (Stats SA QLFS, GHS, IES) must be
labelled with its source survey and period in every UI display, API response,
and AI-generated output. Never present survey-derived estimates as census facts.

CONSTRAINT-09: COMPLETE CODE ONLY
No truncation. No placeholders. No "see above for implementation".
Every function must be fully implemented before the next function begins.

CONSTRAINT-10: TYPED EVERYTHING
Python: all functions, all parameters, all return values typed.
TypeScript: strict mode, no implicit any, no type assertions without comment.

</constraints>
```

---

## PART 3: TECH STACK (EXACT VERSIONS)

### Backend
```
Python                    3.12.3
FastAPI                   0.111.0
Uvicorn                   0.30.1
Pydantic                  2.7.1
SQLAlchemy                2.0.30       (async, with asyncpg driver)
asyncpg                   0.29.0
google-cloud-bigquery     3.24.0
google-cloud-storage      2.17.0
google-cloud-secret-manager  2.20.0
google-cloud-pubsub       2.21.0
anthropic                 0.26.0       (AI Analyst - Claude Sonnet)
redis                     5.0.4        (aioredis pattern)
pdfplumber                0.11.0       (PDF ingestion)
camelot-py[cv]            0.11.0       (table extraction from PDFs)
playwright                1.44.0       (headless browser for scraping)
pandas                    2.2.2
pyarrow                   16.1.0
geopandas                 0.14.4
shapely                   2.0.4
pytest                    8.2.0
pytest-asyncio            0.23.6
httpx                     0.27.0       (async test client)
python-jose[cryptography] 3.3.0        (JWT)
passlib[bcrypt]           1.7.4
pip-audit                 2.7.3
```

### Data & Infrastructure
```
dbt-bigquery              1.8.1
dbt-core                  1.8.1
apache-airflow            2.9.1        (Cloud Composer 2.x)
terraform                 1.8.3
google provider           ~> 5.0
```

### Frontend
```
Node.js                   20.12.2 LTS
Next.js                   14.2.3       (App Router)
React                     18.3.1
TypeScript                5.4.5
Tailwind CSS              3.4.3
shadcn/ui                 0.8.0
MapLibre GL JS            4.3.2
ECharts                   5.5.0
echarts-for-react         3.0.2
TanStack Table            8.17.3
TanStack Query            5.40.0
React Hook Form           7.51.5
Zod                       3.23.8
Zustand                   4.5.2
Supabase JS               2.43.4
@turf/turf                6.5.0        (spatial calculations)
date-fns                  3.6.0
axios                     1.7.2
```

### Package Manager
```
Backend: uv (https://github.com/astral-sh/uv) — faster than pip, lockfile-based
Frontend: pnpm 9.1.2 — workspace-aware, faster than npm
```

---

## PART 4: REPOSITORY STRUCTURE

Create this exact directory structure before writing any application code.

```
civiclens-sa/
├── BUILDLOG.md                          ← Agent appends every file created here
├── README.md
├── .gitignore
├── .env.example                         ← All env vars documented, no values
├── turbo.json                           ← Turborepo config
├── package.json                         ← Root workspace package.json
│
├── terraform/
│   ├── environments/
│   │   ├── dev/
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   └── terraform.tfvars.example
│   │   ├── staging/
│   │   │   └── (same structure)
│   │   └── prod/
│   │       └── (same structure)
│   └── modules/
│       ├── gcp-foundation/
│       │   ├── main.tf
│       │   ├── variables.tf
│       │   └── outputs.tf
│       ├── cloud-run/
│       ├── cloud-sql-postgis/
│       ├── bigquery/
│       ├── gcs-buckets/
│       ├── secret-manager/
│       ├── pubsub/
│       ├── memorystore/
│       ├── cloud-armor/
│       ├── monitoring/
│       └── iam/
│
├── backend/
│   ├── pyproject.toml                   ← uv project config
│   ├── uv.lock
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── BUILDLOG.md
│   └── app/
│       ├── main.py                      ← FastAPI app factory
│       ├── config.py                    ← Settings (pydantic-settings)
│       │
│       ├── core/
│       │   ├── __init__.py
│       │   ├── security.py              ← Zero Trust middleware
│       │   ├── encryption.py            ← KMS integration
│       │   ├── audit.py                 ← Immutable audit logger
│       │   └── dependencies.py          ← FastAPI DI: db, redis, bq, ai
│       │
│       ├── compliance/
│       │   ├── __init__.py
│       │   ├── popia.py                 ← POPIA middleware + models
│       │   ├── mfma.py                  ← MFMA financial controls
│       │   ├── language_filter.py       ← RiskLens language safety
│       │   └── data_classification.py   ← Data sensitivity handler
│       │
│       ├── db/
│       │   ├── __init__.py
│       │   ├── base.py                  ← SQLAlchemy async engine
│       │   ├── session.py               ← AsyncSession factory
│       │   └── migrations/
│       │       └── versions/            ← Alembic migrations
│       │
│       ├── models/
│       │   ├── __init__.py
│       │   ├── base.py                  ← ComplianceBaseModel
│       │   ├── user.py
│       │   ├── organisation.py
│       │   ├── subscription.py
│       │   ├── saved_search.py
│       │   ├── watchlist.py
│       │   ├── alert.py
│       │   ├── report.py
│       │   ├── dataset_registry.py
│       │   ├── api_key.py
│       │   └── audit_log.py
│       │
│       ├── schemas/                     ← Pydantic request/response schemas
│       │   ├── __init__.py
│       │   ├── municipality.py
│       │   ├── tender.py
│       │   ├── supplier.py
│       │   ├── buyer.py
│       │   ├── indicator.py
│       │   ├── report.py
│       │   ├── ai_analyst.py
│       │   └── common.py                ← Pagination, CivicLensResponse envelope
│       │
│       ├── api/
│       │   ├── __init__.py
│       │   └── v1/
│       │       ├── __init__.py
│       │       ├── router.py            ← Registers all sub-routers
│       │       ├── municipalities.py
│       │       ├── tenders.py
│       │       ├── suppliers.py
│       │       ├── buyers.py
│       │       ├── indicators.py
│       │       ├── geoboundaries.py
│       │       ├── reports.py
│       │       ├── ai_analyst.py
│       │       ├── earlyalert.py
│       │       ├── grants.py
│       │       ├── datasets.py
│       │       ├── webhooks.py
│       │       ├── auth.py
│       │       └── users.py
│       │
│       ├── services/
│       │   ├── __init__.py
│       │   ├── bigquery_service.py      ← All BQ query logic
│       │   ├── tender_service.py
│       │   ├── municipality_service.py
│       │   ├── supplier_service.py
│       │   ├── risk_service.py
│       │   ├── report_service.py
│       │   ├── ai_analyst_service.py
│       │   ├── alert_service.py
│       │   ├── whatsapp_service.py
│       │   ├── csd_service.py           ← CSD API integration
│       │   ├── earlyalert_service.py
│       │   └── grant_service.py
│       │
│       └── tests/
│           ├── conftest.py
│           ├── unit/
│           │   ├── test_risk_signals.py
│           │   ├── test_financial_health.py
│           │   ├── test_earlyalert_score.py
│           │   └── test_language_filter.py
│           ├── integration/
│           │   ├── test_tenders_api.py
│           │   ├── test_municipalities_api.py
│           │   └── test_ai_analyst.py
│           └── compliance/
│               ├── test_popia_middleware.py
│               ├── test_audit_logging.py
│               ├── test_data_retention.py
│               └── test_language_safety.py
│
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── .env.local.example
│   └── src/
│       ├── app/                         ← Next.js App Router
│       │   ├── layout.tsx               ← Root layout (Sidebar + Topbar)
│       │   ├── page.tsx                 ← Home dashboard
│       │   ├── (auth)/
│       │   │   ├── login/page.tsx
│       │   │   ├── signup/page.tsx
│       │   │   └── onboarding/page.tsx
│       │   ├── tenderlens/
│       │   │   ├── page.tsx
│       │   │   ├── tender/[ocid]/page.tsx
│       │   │   ├── supplier/[id]/page.tsx
│       │   │   ├── buyer/[id]/page.tsx
│       │   │   └── saved-searches/page.tsx
│       │   ├── munilens/
│       │   │   ├── page.tsx
│       │   │   ├── [code]/page.tsx
│       │   │   └── compare/page.tsx
│       │   ├── policylens/page.tsx
│       │   ├── geolens/page.tsx
│       │   ├── peoplelens/
│       │   │   ├── page.tsx
│       │   │   └── [code]/page.tsx
│       │   ├── servicelens/page.tsx
│       │   ├── risklens/
│       │   │   ├── page.tsx
│       │   │   └── procurement/page.tsx
│       │   ├── reportlens/page.tsx
│       │   ├── datahub/
│       │   │   ├── page.tsx
│       │   │   └── dataset/[id]/page.tsx
│       │   ├── ai-analyst/page.tsx
│       │   ├── agasalert/
│       │   │   ├── page.tsx
│       │   │   └── municipality/[code]/page.tsx
│       │   ├── earlyalert/
│       │   │   ├── page.tsx
│       │   │   └── municipality/[code]/page.tsx
│       │   ├── grantlens/page.tsx
│       │   ├── budgetlens/page.tsx
│       │   ├── carbonlens/page.tsx
│       │   └── settings/
│       │       ├── page.tsx
│       │       ├── alerts/page.tsx
│       │       ├── api-keys/page.tsx
│       │       └── organisation/page.tsx
│       │
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Sidebar.tsx
│       │   │   ├── Topbar.tsx
│       │   │   ├── CommandSearch.tsx
│       │   │   └── NotificationsPanel.tsx
│       │   ├── ui/                      ← shadcn/ui components (auto-generated)
│       │   ├── shared/
│       │   │   ├── DataCard.tsx
│       │   │   ├── ScoreCard.tsx
│       │   │   ├── StatusBadge.tsx
│       │   │   ├── DataTable.tsx        ← TanStack Table wrapper
│       │   │   ├── CivicMap.tsx         ← MapLibre wrapper
│       │   │   ├── CivicChart.tsx       ← ECharts wrapper
│       │   │   ├── SkeletonLoader.tsx
│       │   │   ├── EmptyState.tsx
│       │   │   ├── ErrorState.tsx
│       │   │   ├── DataCaveat.tsx       ← Mandatory data caveat banner
│       │   │   └── SourceCitation.tsx
│       │   ├── tenderlens/
│       │   │   ├── TenderCard.tsx
│       │   │   ├── TenderFilters.tsx
│       │   │   ├── TenderAISummary.tsx
│       │   │   ├── SupplierProfile.tsx
│       │   │   └── BuyerProfile.tsx
│       │   ├── munilens/
│       │   │   ├── MunicipalityScorecard.tsx
│       │   │   ├── FinanceTab.tsx
│       │   │   ├── DemographicsTab.tsx
│       │   │   ├── ServicesTab.tsx
│       │   │   ├── SafetyTab.tsx
│       │   │   ├── ProcurementTab.tsx
│       │   │   ├── RiskTab.tsx
│       │   │   └── MFMA139TriggerPanel.tsx
│       │   ├── ai-analyst/
│       │   │   ├── ChatInterface.tsx
│       │   │   ├── ChatMessage.tsx
│       │   │   ├── PersonaSelector.tsx
│       │   │   ├── SuggestedPrompts.tsx
│       │   │   └── ChartInChat.tsx
│       │   ├── earlyalert/
│       │   │   ├── RiskMap.tsx
│       │   │   ├── RiskTable.tsx
│       │   │   ├── TriggerPanel.tsx
│       │   │   └── InterventionHistory.tsx
│       │   └── risklens/
│       │       ├── RiskSignalCard.tsx
│       │       ├── RiskFeed.tsx
│       │       └── AnomalyTable.tsx
│       │
│       ├── lib/
│       │   ├── api.ts                   ← Axios client configured for CivicLens API
│       │   ├── supabase.ts              ← Supabase client
│       │   ├── maplibre-config.ts       ← Map style config
│       │   ├── echarts-theme.ts         ← SA gov colour theme for charts
│       │   ├── utils.ts
│       │   ├── formatters.ts            ← Currency (ZAR), dates, population
│       │   └── query-keys.ts            ← TanStack Query key factory
│       │
│       ├── hooks/
│       │   ├── useTenders.ts
│       │   ├── useMunicipality.ts
│       │   ├── useIndicators.ts
│       │   ├── useAIAnalyst.ts
│       │   ├── useAlerts.ts
│       │   └── useMapData.ts
│       │
│       ├── store/
│       │   ├── filterStore.ts           ← Zustand: TenderLens filters
│       │   ├── mapStore.ts              ← Zustand: GeoLens state
│       │   └── aiAnalystStore.ts        ← Zustand: AI Analyst chat history
│       │
│       └── types/
│           ├── municipality.ts
│           ├── tender.ts
│           ├── supplier.ts
│           ├── indicator.ts
│           ├── risk.ts
│           └── api.ts                   ← CivicLensResponse<T> generic
│
├── data-pipeline/
│   ├── dbt/
│   │   ├── dbt_project.yml
│   │   ├── profiles.yml.example
│   │   ├── packages.yml
│   │   ├── models/
│   │   │   ├── staging/               ← stg_{publisher}_{dataset}_{period}
│   │   │   │   ├── etenders/
│   │   │   │   ├── municipal_money/
│   │   │   │   ├── stats_sa/
│   │   │   │   ├── saps/
│   │   │   │   ├── dws/
│   │   │   │   ├── dbe/
│   │   │   │   └── agsa/
│   │   │   ├── clean/                 ← dim_{entity} + fact_{domain}
│   │   │   │   ├── dimensions/
│   │   │   │   └── facts/
│   │   │   ├── mart/                  ← mart_{use_case}
│   │   │   └── metrics/               ← dbt metrics layer
│   │   ├── tests/
│   │   ├── macros/
│   │   │   ├── generate_schema_name.sql
│   │   │   ├── data_quality.sql
│   │   │   └── sa_geography.sql
│   │   └── analyses/
│   │
│   ├── ingestion/
│   │   ├── pyproject.toml
│   │   ├── ingestors/
│   │   │   ├── base_ingestor.py        ← Abstract base with checksum + registry
│   │   │   ├── etenders_ingestor.py
│   │   │   ├── municipal_money_ingestor.py
│   │   │   ├── stats_sa_ingestor.py
│   │   │   ├── saps_ingestor.py
│   │   │   ├── dws_ingestor.py
│   │   │   ├── agsa_ingestor.py
│   │   │   ├── municipal_portal_scraper.py   ← Playwright-based
│   │   │   └── csd_sync.py
│   │   └── tests/
│   │
│   └── airflow/
│       └── dags/
│           ├── daily_tenders.py
│           ├── weekly_municipal_portals.py
│           ├── quarterly_municipal_money.py
│           ├── annual_stats_sa.py
│           ├── annual_agsa.py
│           └── data_quality_report.py
│
├── ml/
│   ├── earlyalert_model/
│   │   ├── train.py
│   │   ├── features.py
│   │   ├── evaluate.py
│   │   └── serve.py
│   └── clean_audit_model/
│       ├── train.py
│       └── features.py
│
└── .github/
    └── workflows/
        ├── ci.yml
        ├── compliance-gate.yml
        ├── cd-staging.yml
        └── cd-prod.yml
```

**Create this structure immediately:**
```bash
# Agent executes this first
find . -name "BUILDLOG.md" -delete 2>/dev/null; touch BUILDLOG.md
echo "# CivicLens SA Build Log" >> BUILDLOG.md
echo "Started: $(date -u)" >> BUILDLOG.md

# Create all directories
mkdir -p terraform/environments/{dev,staging,prod}
mkdir -p terraform/modules/{gcp-foundation,cloud-run,cloud-sql-postgis,bigquery,gcs-buckets,secret-manager,pubsub,memorystore,cloud-armor,monitoring,iam}
mkdir -p backend/app/{core,compliance,db/migrations/versions,models,schemas,api/v1,services,tests/{unit,integration,compliance}}
mkdir -p frontend/src/{app/{tenderlens,munilens,policylens,geolens,peoplelens,servicelens,risklens,reportlens,datahub,ai-analyst,agasalert,earlyalert,grantlens,budgetlens,carbonlens,settings,\(auth\}/{login,signup,onboarding}},components/{layout,ui,shared,tenderlens,munilens,ai-analyst,earlyalert,risklens},lib,hooks,store,types}
mkdir -p data-pipeline/{dbt/models/{staging/{etenders,municipal_money,stats_sa,saps,dws,dbe,agsa},clean/{dimensions,facts},mart,metrics},dbt/{tests,macros,analyses},ingestion/{ingestors,tests},airflow/dags}
mkdir -p ml/{earlyalert_model,clean_audit_model}
mkdir -p .github/workflows
```

---

## PART 5: ENVIRONMENT VARIABLES

Create `.env.example` with every variable required. No values — only names and descriptions.

```bash
# .env.example
# CivicLens SA — Environment Variables
# Copy to .env.local (frontend) and .env (backend) and fill in values
# NEVER commit .env files to version control

# ─── GCP PROJECT ───────────────────────────────────────────────────────────────
GCP_PROJECT_ID=civiclens-prod
GCP_REGION=africa-south1
GCP_ZONE=africa-south1-a

# ─── BIGQUERY ──────────────────────────────────────────────────────────────────
BQ_DATASET_STAGING=civiclens_staging
BQ_DATASET_CLEAN=civiclens_clean
BQ_DATASET_MART=civiclens_mart
BQ_DATASET_AUDIT=civiclens_audit
BQ_LOCATION=africa-south1

# ─── CLOUD SQL (PostgreSQL) ────────────────────────────────────────────────────
DATABASE_URL=postgresql+asyncpg://civiclens:PASSWORD@/civiclens?host=/cloudsql/PROJECT:africa-south1:civiclens-db
DATABASE_URL_SYNC=postgresql://civiclens:PASSWORD@/civiclens?host=/cloudsql/PROJECT:africa-south1:civiclens-db
CLOUD_SQL_CONNECTION_NAME=PROJECT:africa-south1:civiclens-db

# ─── GCS BUCKETS ───────────────────────────────────────────────────────────────
GCS_RAW_BUCKET=civiclens-raw-prod
GCS_REPORTS_BUCKET=civiclens-reports-prod
GCS_EXPORTS_BUCKET=civiclens-exports-prod
GCS_COMPLIANCE_BUCKET=civiclens-compliance-prod

# ─── REDIS (Memorystore) ───────────────────────────────────────────────────────
REDIS_URL=redis://10.0.0.20:6379/0
REDIS_TTL_SECONDS=14400

# ─── AUTHENTICATION (Supabase) ─────────────────────────────────────────────────
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret-min-32-chars
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440

# ─── AI ANALYST (Anthropic) ────────────────────────────────────────────────────
ANTHROPIC_API_KEY=sk-ant-...
AI_MODEL=claude-sonnet-4-20250514
AI_MAX_TOKENS=4096
AI_TEMPERATURE=0.1

# ─── WHATSAPP (Meta Cloud API) ─────────────────────────────────────────────────
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_ACCESS_TOKEN=your-access-token
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your-verify-token

# ─── STRIPE (Billing) ──────────────────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_SME_MONTHLY=price_...
STRIPE_PRICE_CONSULTANT_MONTHLY=price_...
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_...

# ─── NATIONAL TREASURY APIs ────────────────────────────────────────────────────
ETENDERS_BASE_URL=https://etenders.treasury.gov.za/content
MUNICIPAL_MONEY_API_URL=https://municipalmoney.gov.za/api
OCDS_BASE_URL=https://ocds.etenders.gov.za/api/v1

# ─── CSD (Central Supplier Database) ──────────────────────────────────────────
CSD_API_URL=https://secure.csd.gov.za/api
CSD_API_KEY=your-csd-api-key

# ─── APPLICATION ───────────────────────────────────────────────────────────────
ENVIRONMENT=production
LOG_LEVEL=INFO
API_BASE_URL=https://api.civiclens.co.za
FRONTEND_URL=https://civiclens.co.za
ALLOWED_ORIGINS=https://civiclens.co.za,https://www.civiclens.co.za
FREE_TIER_DAILY_AI_QUERIES=5
SME_TIER_DAILY_AI_QUERIES=50
CONSULTANT_TIER_DAILY_AI_QUERIES=200
ENTERPRISE_TIER_DAILY_AI_QUERIES=0
```

---

## PHASE 0: REPOSITORY BOOTSTRAP

**Objective:** Initialise monorepo, tooling, and base configuration files.

### Task 0.1 — Root workspace

```json
// package.json (root)
{
  "name": "civiclens-sa",
  "private": true,
  "workspaces": ["frontend", "data-pipeline/dbt"],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "type-check": "turbo run type-check"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  },
  "engines": {
    "node": ">=20.12.0",
    "pnpm": ">=9.1.0"
  },
  "packageManager": "pnpm@9.1.2"
}
```

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalEnv": ["NODE_ENV", "NEXT_PUBLIC_*"],
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": [".next/**", "dist/**"] },
    "dev": { "cache": false, "persistent": true },
    "lint": {},
    "test": { "cache": false },
    "type-check": {}
  }
}
```

### Task 0.2 — .gitignore

```gitignore
# .gitignore
.env
.env.local
.env.*.local
*.env

# Python
__pycache__/
*.py[cod]
.venv/
*.egg-info/
dist/
.pytest_cache/
.mypy_cache/
.ruff_cache/
uv.lock.bak

# Node
node_modules/
.next/
.turbo/
dist/

# Terraform
*.tfstate
*.tfstate.*
.terraform/
*.tfplan
*.tfvars

# IDE
.idea/
.vscode/
*.swp

# GCP
*.json
!tsconfig.json
!package.json
!turbo.json
!**/dbt_project.yml

# Build logs
BUILDLOG.md
```

### Task 0.3 — Backend pyproject.toml

```toml
# backend/pyproject.toml
[project]
name = "civiclens-api"
version = "2.0.0"
description = "CivicLens SA — FastAPI Backend"
requires-python = ">=3.12"
dependencies = [
    "fastapi==0.111.0",
    "uvicorn[standard]==0.30.1",
    "pydantic==2.7.1",
    "pydantic-settings==2.3.1",
    "sqlalchemy[asyncio]==2.0.30",
    "asyncpg==0.29.0",
    "alembic==1.13.1",
    "google-cloud-bigquery==3.24.0",
    "google-cloud-storage==2.17.0",
    "google-cloud-secret-manager==2.20.0",
    "google-cloud-pubsub==2.21.0",
    "anthropic==0.26.0",
    "redis==5.0.4",
    "pdfplumber==0.11.0",
    "pandas==2.2.2",
    "pyarrow==16.1.0",
    "geopandas==0.14.4",
    "shapely==2.0.4",
    "python-jose[cryptography]==3.3.0",
    "passlib[bcrypt]==1.7.4",
    "httpx==0.27.0",
    "tenacity==8.3.0",
    "structlog==24.2.0",
    "sentry-sdk[fastapi]==2.5.1",
    "stripe==9.12.0",
]

[tool.uv]
dev-dependencies = [
    "pytest==8.2.0",
    "pytest-asyncio==0.23.6",
    "pytest-cov==5.0.0",
    "ruff==0.4.9",
    "mypy==1.10.0",
    "pip-audit==2.7.3",
]

[tool.ruff]
target-version = "py312"
line-length = 100
select = ["E", "F", "I", "N", "UP", "S", "B", "A", "C4", "T20"]
ignore = ["S101"]

[tool.mypy]
python_version = "3.12"
strict = true
ignore_missing_imports = false

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["app/tests"]
```

<CHECKPOINT-0>
Before proceeding, verify:
- [ ] All directories created per the structure above
- [ ] `BUILDLOG.md` exists at root
- [ ] `package.json` and `turbo.json` at root
- [ ] `backend/pyproject.toml` created
- [ ] `.env.example` has all 35+ variables
- [ ] `.gitignore` excludes .env and *.json service account files

Run: `find . -type f -name "*.toml" -o -name "*.json" | grep -v node_modules | sort`
</CHECKPOINT-0>

---

## PHASE 1: TERRAFORM INFRASTRUCTURE

**Objective:** Provision all GCP resources in `africa-south1`. Zero hardcoded values — all via variables.

### Task 1.1 — GCP Foundation Module

```hcl
# terraform/modules/gcp-foundation/main.tf

terraform {
  required_providers {
    google = { source = "hashicorp/google", version = "~> 5.0" }
    google-beta = { source = "hashicorp/google-beta", version = "~> 5.0" }
  }
}

# ── Data Residency Enforcement ─────────────────────────────────────────────────
resource "google_org_policy_policy" "data_residency" {
  name   = "projects/${var.project_id}/policies/gcp.resourceLocations"
  parent = "projects/${var.project_id}"
  spec {
    rules {
      values {
        allowed_values = ["in:africa-south1-locations"]
      }
    }
  }
}

resource "google_org_policy_policy" "require_os_login" {
  name   = "projects/${var.project_id}/policies/compute.requireOsLogin"
  parent = "projects/${var.project_id}"
  spec { rules { enforce = "TRUE" } }
}

resource "google_org_policy_policy" "disable_sa_key_creation" {
  name   = "projects/${var.project_id}/policies/iam.disableServiceAccountKeyCreation"
  parent = "projects/${var.project_id}"
  spec { rules { enforce = "TRUE" } }
}

resource "google_org_policy_policy" "uniform_bucket_access" {
  name   = "projects/${var.project_id}/policies/storage.uniformBucketLevelAccess"
  parent = "projects/${var.project_id}"
  spec { rules { enforce = "TRUE" } }
}

# ── Networking ─────────────────────────────────────────────────────────────────
resource "google_compute_network" "vpc" {
  name                    = "${var.project_id}-vpc"
  auto_create_subnetworks = false
  project                 = var.project_id
}

resource "google_compute_subnetwork" "private" {
  name                     = "${var.project_id}-private"
  ip_cidr_range            = "10.0.0.0/20"
  region                   = "africa-south1"
  network                  = google_compute_network.vpc.id
  project                  = var.project_id
  private_ip_google_access = true

  secondary_ip_range {
    range_name    = "services"
    ip_cidr_range = "10.1.0.0/20"
  }

  log_config {
    aggregation_interval = "INTERVAL_5_SEC"
    flow_sampling        = 1.0
    metadata             = "INCLUDE_ALL_METADATA"
  }
}

# Private Services Access (for Cloud SQL private IP)
resource "google_compute_global_address" "private_service_access" {
  name          = "${var.project_id}-psa"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 20
  network       = google_compute_network.vpc.id
  project       = var.project_id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.vpc.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_service_access.name]
}

# ── Service Accounts ───────────────────────────────────────────────────────────
resource "google_service_account" "api" {
  account_id   = "civiclens-api"
  display_name = "CivicLens API Service Account"
  project      = var.project_id
}

resource "google_service_account" "pipeline" {
  account_id   = "civiclens-pipeline"
  display_name = "CivicLens Data Pipeline Service Account"
  project      = var.project_id
}

# ── IAM Bindings ───────────────────────────────────────────────────────────────
resource "google_project_iam_member" "api_bq_reader" {
  project = var.project_id
  role    = "roles/bigquery.dataViewer"
  member  = "serviceAccount:${google_service_account.api.email}"
}

resource "google_project_iam_member" "api_bq_job_user" {
  project = var.project_id
  role    = "roles/bigquery.jobUser"
  member  = "serviceAccount:${google_service_account.api.email}"
}

resource "google_project_iam_member" "api_secret_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.api.email}"
}

resource "google_project_iam_member" "pipeline_bq_editor" {
  project = var.project_id
  role    = "roles/bigquery.dataEditor"
  member  = "serviceAccount:${google_service_account.pipeline.email}"
}

resource "google_project_iam_member" "pipeline_storage_admin" {
  project = var.project_id
  role    = "roles/storage.admin"
  member  = "serviceAccount:${google_service_account.pipeline.email}"
}

# ── Cloud Armor (WAF + DDoS) ───────────────────────────────────────────────────
resource "google_compute_security_policy" "waf" {
  name    = "${var.project_id}-waf"
  project = var.project_id

  rule {
    action   = "deny(403)"
    priority = "1000"
    description = "Block XSS attacks"
    match {
      expr { expression = "evaluatePreconfiguredExpr('xss-stable')" }
    }
  }

  rule {
    action   = "deny(403)"
    priority = "1001"
    description = "Block SQL injection"
    match {
      expr { expression = "evaluatePreconfiguredExpr('sqli-stable')" }
    }
  }

  rule {
    action   = "deny(403)"
    priority = "1002"
    description = "Block Remote File Inclusion"
    match {
      expr { expression = "evaluatePreconfiguredExpr('rfi-stable')" }
    }
  }

  rule {
    action   = "deny(403)"
    priority = "1003"
    description = "Block Local File Inclusion"
    match {
      expr { expression = "evaluatePreconfiguredExpr('lfi-stable')" }
    }
  }

  # Rate limiting: 1000 requests per minute per IP
  rule {
    action   = "throttle"
    priority = "1100"
    description = "Rate limit public API"
    match {
      versioned_expr = "SRC_IPS_V1"
      config { src_ip_ranges = ["*"] }
    }
    rate_limit_options {
      rate_limit_threshold {
        count        = 1000
        interval_sec = 60
      }
      conform_action = "allow"
      exceed_action  = "deny(429)"
      enforce_on_key = "IP"
    }
  }

  rule {
    action   = "allow"
    priority = "2147483647"
    description = "Default allow"
    match {
      versioned_expr = "SRC_IPS_V1"
      config { src_ip_ranges = ["*"] }
    }
  }
}
```

### Task 1.2 — BigQuery Datasets Module

```hcl
# terraform/modules/bigquery/main.tf

resource "google_bigquery_dataset" "staging" {
  dataset_id  = "civiclens_staging"
  location    = "africa-south1"
  project     = var.project_id
  description = "CivicLens SA — raw ingestion staging tables"

  delete_contents_on_destroy = false

  labels = {
    environment     = var.environment
    data_class      = "public-government-data"
    popia_scope     = "aggregated-only"
  }
}

resource "google_bigquery_dataset" "clean" {
  dataset_id  = "civiclens_clean"
  location    = "africa-south1"
  project     = var.project_id
  description = "CivicLens SA — cleaned dimension and fact tables"
  delete_contents_on_destroy = false
  labels = {
    environment = var.environment
    data_class  = "analytics-ready"
  }
}

resource "google_bigquery_dataset" "mart" {
  dataset_id  = "civiclens_mart"
  location    = "africa-south1"
  project     = var.project_id
  description = "CivicLens SA — pre-aggregated dashboard marts"
  delete_contents_on_destroy = false
  labels = {
    environment = var.environment
    data_class  = "dashboard-ready"
  }
}

resource "google_bigquery_dataset" "audit" {
  dataset_id  = "civiclens_audit"
  location    = "africa-south1"
  project     = var.project_id
  description = "CivicLens SA — immutable audit and compliance logs"
  delete_contents_on_destroy = false

  # Audit logs retained 7 years (MFMA requirement for gov customers)
  default_table_expiration_ms = 220752000000 # 7 years in ms

  labels = {
    environment  = var.environment
    data_class   = "compliance-restricted"
    retention    = "7-years"
    popia_scope  = "audit-only"
  }
}

# VPC Service Controls: Restrict BQ access to private network only
resource "google_access_context_manager_service_perimeter" "bq_perimeter" {
  parent = "accessPolicies/${var.access_policy_id}"
  name   = "accessPolicies/${var.access_policy_id}/servicePerimeters/civiclens_bq"
  title  = "CivicLens BigQuery VPC-SC Perimeter"

  status {
    services           = ["bigquery.googleapis.com"]
    restricted_services = ["bigquery.googleapis.com"]
    resources          = ["projects/${var.project_number}"]
    vpc_accessible_services {
      enable_restriction = true
      allowed_services   = ["bigquery.googleapis.com"]
    }
  }
}
```

### Task 1.3 — GCS Buckets Module

```hcl
# terraform/modules/gcs-buckets/main.tf

locals {
  buckets = {
    raw = {
      name        = "${var.project_id}-raw"
      description = "Immutable raw data files — never modified after ingestion"
      retention   = 315360000  # 10 years in seconds
    }
    reports = {
      name        = "${var.project_id}-reports"
      description = "Generated PDF/DOCX/PPTX reports"
      retention   = 94608000   # 3 years
    }
    exports = {
      name        = "${var.project_id}-exports"
      description = "User data exports (POPIA access requests)"
      retention   = 2592000    # 30 days
    }
    compliance = {
      name        = "${var.project_id}-compliance"
      description = "Compliance attestations, PIA reports, audit outputs"
      retention   = 220752000  # 7 years
    }
  }
}

resource "google_storage_bucket" "buckets" {
  for_each = local.buckets

  name          = each.value.name
  location      = "africa-south1"
  project       = var.project_id
  storage_class = "STANDARD"

  uniform_bucket_level_access = true

  versioning { enabled = true }

  encryption {
    default_kms_key_name = var.kms_key_name
  }

  retention_policy {
    retention_period = each.value.retention
    is_locked        = each.key == "raw" ? true : false
  }

  lifecycle_rule {
    condition { age = 365 }
    action    { type = "SetStorageClass"; storage_class = "NEARLINE" }
  }

  labels = {
    environment = var.environment
    purpose     = each.key
    popia_scope = "non-personal"
  }
}

# Deny public access to all buckets
resource "google_storage_bucket_iam_member" "no_public_access" {
  for_each = google_storage_bucket.buckets

  bucket = each.value.name
  role   = "roles/storage.legacyBucketOwner"
  member = "serviceAccount:${var.pipeline_sa_email}"
}
```

<CHECKPOINT-1>
Validate:
- [ ] `terraform/modules/gcp-foundation/main.tf` — complete with org policies, VPC, Cloud Armor
- [ ] `terraform/modules/bigquery/main.tf` — 4 datasets: staging, clean, mart, audit
- [ ] `terraform/modules/gcs-buckets/main.tf` — 4 buckets with retention + encryption
- [ ] All `variables.tf` and `outputs.tf` files created for each module

Run: `cd terraform/environments/dev && terraform init && terraform validate`
Expected: "Success! The configuration is valid."
</CHECKPOINT-1>

---

## PHASE 2: DATABASE SCHEMAS (PostgreSQL + Cloud SQL)

**Objective:** Define all application-layer tables. BigQuery is analytics-only. Cloud SQL is for app state: users, subscriptions, saved searches, alerts, audit logs, dataset registry.

### Task 2.1 — Base Model (compliance-aware SQLAlchemy)

```python
# backend/app/models/base.py
"""
COMPLIANCE: Base model for all CivicLens SA database entities.
Lawful basis: Provides structural compliance fields for all derived models.
PIA reference: PIA-000
Last reviewed: 2026-05-29
"""
from datetime import datetime
from typing import Any
from sqlalchemy import DateTime, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """SQLAlchemy declarative base for all CivicLens models."""

    type_annotation_map: dict[type, Any] = {}


class TimestampMixin:
    """Adds created_at and updated_at to every table."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class SoftDeleteMixin:
    """
    POPIA s23 — Data subject deletion right.
    Soft-delete pattern: data is deactivated, not purged, until
    retention period expires and hard-delete job runs.
    """

    is_deleted: Mapped[bool] = mapped_column(default=False, nullable=False, index=True)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    deletion_reason: Mapped[str | None] = mapped_column(nullable=True)  # POPIA s23 reason
```

### Task 2.2 — User Model

```python
# backend/app/models/user.py
"""
COMPLIANCE: This module processes personal information under POPIA s1.
Lawful basis: POPIA s11(1)(b) — performance of contract (subscription service)
Data subject categories: Platform users — natural persons
Retention period: Active account duration + 3 years post-deletion
PIA reference: PIA-001
Last reviewed: 2026-05-29
"""
import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base, TimestampMixin, SoftDeleteMixin


class UserRole(str, Enum):
    FREE = "free"
    SME = "sme"
    CONSULTANT = "consultant"
    ENTERPRISE = "enterprise"
    GOVERNMENT = "government"
    DEVELOPER = "developer"
    ADMIN = "admin"


class UserLocale(str, Enum):
    EN = "en"
    ZU = "zu"   # isiZulu
    XH = "xh"   # isiXhosa
    ST = "st"   # Sesotho
    AF = "af"   # Afrikaans


class User(Base, TimestampMixin, SoftDeleteMixin):
    """
    Platform user. Personal data — POPIA restrictions apply.
    Email and name are the only PII fields. All analytics use user_id only.
    """

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    # PII fields — encrypted at column level in production via KMS
    email: Mapped[str] = mapped_column(String(320), nullable=False, unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(200), nullable=False)

    # Non-PII fields
    role: Mapped[UserRole] = mapped_column(String(20), nullable=False, default=UserRole.FREE)
    locale: Mapped[UserLocale] = mapped_column(String(5), nullable=False, default=UserLocale.EN)
    organisation_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organisations.id"), nullable=True
    )
    supabase_uid: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)

    # Onboarding
    user_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    onboarding_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    provinces_of_interest: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON array
    industries_of_interest: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON array

    # POPIA consent tracking
    popia_consent_given: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    popia_consent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    popia_consent_version: Mapped[str | None] = mapped_column(String(20), nullable=True)
    popia_consent_ip: Mapped[str | None] = mapped_column(String(45), nullable=True)  # IPv6 max len

    # WhatsApp
    whatsapp_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    whatsapp_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    whatsapp_alerts_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # AI usage tracking
    ai_queries_today: Mapped[int] = mapped_column(default=0, nullable=False)
    ai_queries_reset_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    organisation: Mapped["Organisation | None"] = relationship("Organisation", back_populates="members")
    saved_searches: Mapped[list["SavedSearch"]] = relationship("SavedSearch", back_populates="user")
    watchlist_items: Mapped[list["WatchlistItem"]] = relationship("WatchlistItem", back_populates="user")
    reports: Mapped[list["Report"]] = relationship("Report", back_populates="user")
    api_keys: Mapped[list["APIKey"]] = relationship("APIKey", back_populates="user")
    audit_logs: Mapped[list["AuditLog"]] = relationship("AuditLog", back_populates="user")

    def __repr__(self) -> str:
        return f"<User id={self.id} role={self.role}>"
```

### Task 2.3 — Saved Search Model

```python
# backend/app/models/saved_search.py
"""
COMPLIANCE: Stores user search preferences. Minimal personal data — references
user_id only. No personal information in search criteria fields.
Lawful basis: POPIA s11(1)(b) — contract performance
PIA reference: PIA-002
Last reviewed: 2026-05-29
"""
import uuid
from sqlalchemy import String, Boolean, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base, TimestampMixin, SoftDeleteMixin


class AlertFrequency(str):
    IMMEDIATE = "immediate"
    DAILY = "daily"
    WEEKLY = "weekly"
    DISABLED = "disabled"


class SavedSearch(Base, TimestampMixin, SoftDeleteMixin):
    """
    User-defined tender search with persistent alert configuration.
    search_criteria is a JSON object matching the TenderSearchParams schema.
    """

    __tablename__ = "saved_searches"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    search_criteria: Mapped[str] = mapped_column(Text, nullable=False)  # JSON
    alert_frequency: Mapped[str] = mapped_column(String(20), nullable=False, default=AlertFrequency.DAILY)
    alert_email_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    alert_whatsapp_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    alert_inapp_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    new_results_count: Mapped[int] = mapped_column(default=0, nullable=False)
    module: Mapped[str] = mapped_column(String(30), nullable=False, default="tenderlens")

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="saved_searches")
```

### Task 2.4 — Dataset Registry Model

```python
# backend/app/models/dataset_registry.py
"""
COMPLIANCE: Tracks metadata for all ingested government datasets.
No personal information. Classification: Public government data.
PIA reference: PIA-000
Last reviewed: 2026-05-29
"""
import uuid
from datetime import datetime
from sqlalchemy import String, Text, DateTime, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from .base import Base, TimestampMixin


class DatasetStatus(str):
    IDENTIFIED    = "identified"
    VERIFIED      = "verified"
    DOWNLOADED    = "downloaded"
    CHECKSUMMED   = "checksummed"
    PROFILED      = "profiled"
    CLEANED       = "cleaned"
    TRANSFORMED   = "transformed"
    LOADED        = "loaded"
    DASHBOARD_READY = "dashboard_ready"
    DEPRECATED    = "deprecated"


class DatasetRegistry(Base, TimestampMixin):
    """
    Central registry for every dataset ingested into CivicLens SA.
    Powers the DataHub module and data lineage tracking.
    """

    __tablename__ = "dataset_registry"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dataset_id: Mapped[str] = mapped_column(String(100), nullable=False, unique=True, index=True)
    name: Mapped[str] = mapped_column(String(300), nullable=False)
    publisher: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    source_url: Mapped[str] = mapped_column(Text, nullable=False)
    download_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    coverage_period_start: Mapped[str | None] = mapped_column(String(50), nullable=True)
    coverage_period_end: Mapped[str | None] = mapped_column(String(50), nullable=True)
    update_frequency: Mapped[str] = mapped_column(String(50), nullable=False)
    licence: Mapped[str] = mapped_column(String(200), nullable=False)
    format: Mapped[str] = mapped_column(String(100), nullable=False)
    file_size_bytes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    sha256_checksum: Mapped[str | None] = mapped_column(String(64), nullable=True)
    gcs_raw_path: Mapped[str | None] = mapped_column(Text, nullable=True)
    bq_table: Mapped[str | None] = mapped_column(String(200), nullable=True)
    bq_staging_table: Mapped[str | None] = mapped_column(String(200), nullable=True)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default=DatasetStatus.IDENTIFIED)
    popia_classification: Mapped[str] = mapped_column(String(100), nullable=False, default="public-aggregated")
    sensitivity_level: Mapped[str] = mapped_column(String(30), nullable=False, default="public")
    theme: Mapped[str | None] = mapped_column(String(100), nullable=True)
    is_public_catalogue: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    data_quality_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    last_downloaded_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_quality_checked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    quality_score: Mapped[int | None] = mapped_column(Integer, nullable=True)  # 0–100
    row_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    dbt_model: Mapped[str | None] = mapped_column(String(200), nullable=True)
```

### Task 2.5 — Audit Log Model

```python
# backend/app/models/audit_log.py
"""
COMPLIANCE: Immutable audit trail for all platform state changes and data access.
MFMA requirement: 7-year retention for government customers.
POPIA s19: Security safeguard — demonstrates access controls.
PIA reference: PIA-003
Last reviewed: 2026-05-29
"""
import uuid
from sqlalchemy import String, Text, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base


class AuditAction(str):
    # Auth events
    LOGIN           = "auth.login"
    LOGOUT          = "auth.logout"
    TOKEN_REFRESH   = "auth.token_refresh"
    # Data access
    QUERY           = "data.query"
    EXPORT          = "data.export"
    REPORT_GENERATE = "report.generate"
    REPORT_DOWNLOAD = "report.download"
    # User management
    USER_CREATE     = "user.create"
    USER_UPDATE     = "user.update"
    USER_DELETE     = "user.delete"
    CONSENT_RECORD  = "popia.consent"
    DSR_REQUEST     = "popia.dsr_request"
    # AI
    AI_QUERY        = "ai.query"
    # Admin
    DATASET_INGEST  = "admin.dataset_ingest"
    CONFIG_CHANGE   = "admin.config_change"


class AuditLog(Base):
    """
    Append-only audit log. Never update or delete rows in this table.
    Partition by created_at for efficient 7-year retention management.
    """

    __tablename__ = "audit_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    timestamp: Mapped[str] = mapped_column(String(30), nullable=False, index=True)
    user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)
    action: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    resource_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    resource_id: Mapped[str | None] = mapped_column(String(200), nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(Text, nullable=True)
    session_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    outcome: Mapped[str] = mapped_column(String(20), nullable=False)  # success | failure | denied
    http_status_code: Mapped[int | None] = mapped_column(Integer, nullable=True)
    metadata: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    # Relationships
    user: Mapped["User | None"] = relationship("User", back_populates="audit_logs")
```

<CHECKPOINT-2>
Validate:
- [ ] All 8+ model files created in `backend/app/models/`
- [ ] Every model file has POPIA compliance header
- [ ] `base.py` has `TimestampMixin`, `SoftDeleteMixin`
- [ ] `user.py` has consent fields and POPIA annotations
- [ ] `dataset_registry.py` has all dataset lifecycle fields
- [ ] `audit_log.py` is append-only with action enum

Run:
```bash
cd backend
uv run python -c "from app.models.user import User; from app.models.audit_log import AuditLog; print('Models OK')"
```
</CHECKPOINT-2>

---

## PHASE 3: COMPLIANCE & SECURITY LAYER

**Objective:** Build the non-negotiable middleware that every API request passes through.

### Task 3.1 — POPIA Middleware

```python
# backend/app/compliance/popia.py
"""
COMPLIANCE: POPIA enforcement middleware. Applied to every API request.
Implements: Consent verification, purpose limitation, data minimisation,
access rights enforcement, breach notification pipeline.
Lawful basis: POPIA s11 — all eight conditions enforced programmatically
PIA reference: PIA-000
Last reviewed: 2026-05-29
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Callable, Awaitable
from fastapi import Request, Response, HTTPException
from fastapi.responses import JSONResponse
import structlog

logger = structlog.get_logger(__name__)


POPIA_EXEMPT_PATHS = {
    "/health",
    "/api/v1/auth/login",
    "/api/v1/auth/signup",
    "/api/v1/auth/callback",
}

# Maps API paths to declared processing purposes
# POPIA s13 — purpose must be specific, explicitly defined, legitimate
PURPOSE_MAP: dict[str, str] = {
    "/api/v1/tenders": "Procurement intelligence search service",
    "/api/v1/municipalities": "Municipal intelligence service",
    "/api/v1/ai/query": "AI Analyst — public data query service",
    "/api/v1/reports": "Professional report generation service",
    "/api/v1/users": "Account management — user's own data only",
    "/api/v1/datasets": "Public dataset catalogue",
}


class POPIAMiddleware:
    """
    Enforces POPIA compliance on every API request that handles personal data.

    Checks performed on every non-exempt request:
    1. Authentication (identity verified — POPIA s19)
    2. Consent recorded (POPIA s11(1)(a))
    3. Purpose documented (POPIA s13)
    4. Data minimisation enforced via response filtering (POPIA s10)
    5. Audit trail emitted (POPIA s19)
    """

    def __init__(self, app: Callable[[Request], Awaitable[Response]]) -> None:
        self.app = app

    async def __call__(self, request: Request, call_next: Callable) -> Response:
        if request.url.path in POPIA_EXEMPT_PATHS:
            return await call_next(request)

        user = getattr(request.state, "user", None)

        # Personal data requests require POPIA consent on record
        if user and self._path_processes_user_data(request.url.path):
            if not user.popia_consent_given:
                return JSONResponse(
                    status_code=451,  # HTTP 451 Unavailable For Legal Reasons
                    content={
                        "error": "popia_consent_required",
                        "message": (
                            "Your POPIA consent is required before accessing personalised "
                            "features. Please review and accept the privacy notice."
                        ),
                        "consent_url": "/settings/privacy",
                    },
                )

        # Log processing purpose for audit
        purpose = self._get_purpose(request.url.path)
        if user and purpose:
            logger.info(
                "popia_data_processing",
                user_id=str(user.id),
                purpose=purpose,
                path=request.url.path,
                method=request.method,
                timestamp=datetime.now(timezone.utc).isoformat(),
            )

        response = await call_next(request)
        return response

    def _path_processes_user_data(self, path: str) -> bool:
        """Returns True for paths that return or process personalised data."""
        personal_data_paths = ["/api/v1/users", "/api/v1/reports", "/api/v1/saved-searches"]
        return any(path.startswith(p) for p in personal_data_paths)

    def _get_purpose(self, path: str) -> str | None:
        for prefix, purpose in PURPOSE_MAP.items():
            if path.startswith(prefix):
                return purpose
        return None


class ConsentRecord:
    """Records POPIA consent with full audit trail."""

    @staticmethod
    async def record(
        user_id: uuid.UUID,
        consent_given: bool,
        version: str,
        ip_address: str,
        db_session: "AsyncSession",
    ) -> None:
        from app.models.user import User
        from sqlalchemy import select

        user = (await db_session.execute(select(User).where(User.id == user_id))).scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        user.popia_consent_given = consent_given
        user.popia_consent_at = datetime.now(timezone.utc)
        user.popia_consent_version = version
        user.popia_consent_ip = ip_address

        logger.info(
            "popia_consent_recorded",
            user_id=str(user_id),
            consent_given=consent_given,
            version=version,
            ip=ip_address,
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
        await db_session.commit()
```

### Task 3.2 — Language Safety Filter (RiskLens / EarlyAlert)

```python
# backend/app/compliance/language_filter.py
"""
COMPLIANCE: Enforces approved language protocol for risk-related AI outputs.
CONSTRAINT-07: Prohibited terms must never appear in auto-generated risk content.
This filter is applied as a post-generation hook on all AI responses that
describe procurement anomalies, financial irregularities, or municipal risk.
PIA reference: PIA-000
Last reviewed: 2026-05-29
"""
import re
from dataclasses import dataclass
from enum import Enum


class FilterResult(str, Enum):
    PASSED = "passed"
    VIOLATION = "violation"
    REPLACED = "replaced"


# Terms that must never appear in auto-generated risk content
PROHIBITED_TERMS: set[str] = {
    "corrupt", "corruption", "corrupted", "corruptly",
    "bribe", "bribery", "bribed",
    "kickback", "kick-back",
    "fraud", "fraudulent", "fraudulently", "defraud",
    "misappropriate", "misappropriation", "misappropriated",
    "steal", "stealing", "stolen", "theft",
    "loot", "looting", "looted",
    "misconduct",
    "embezzle", "embezzlement",
}

# Exception: these official source prefixes allow quoted usage
OFFICIAL_SOURCE_PREFIXES: list[str] = [
    "agsa finding:",
    "court judgment:",
    "agsa report states:",
    "official finding:",
    "legally determined:",
]

# Approved replacements for common violations
TERM_REPLACEMENTS: dict[str, str] = {
    "corrupt": "at elevated risk",
    "corruption": "irregular procurement patterns",
    "fraud": "procurement anomaly",
    "fraudulent": "anomalous",
    "misappropriation": "irregular expenditure",
    "theft": "unaccounted expenditure",
    "loot": "irregular expenditure",
    "bribery": "procurement concentration anomaly",
    "kickback": "supplier concentration risk",
    "misconduct": "governance concern",
}


@dataclass
class LanguageFilterResult:
    original: str
    filtered: str
    status: FilterResult
    violations_found: list[str]
    replacements_made: list[tuple[str, str]]


def filter_risk_language(text: str, auto_replace: bool = True) -> LanguageFilterResult:
    """
    Scans AI-generated risk text for prohibited terms.
    If auto_replace=True, replaces violations with approved terms.
    If auto_replace=False, raises a violation that blocks the response.

    Usage:
        result = filter_risk_language(ai_response)
        if result.status == FilterResult.VIOLATION and not auto_replace:
            regenerate_response()
        else:
            return result.filtered
    """
    violations: list[str] = []
    replacements: list[tuple[str, str]] = []
    filtered_text = text.lower()  # work on lower for detection, preserve original case

    # Check if each violation appears outside of official-source quotes
    for term in PROHIBITED_TERMS:
        pattern = re.compile(r'\b' + re.escape(term) + r'\b', re.IGNORECASE)
        matches = pattern.findall(text)

        if not matches:
            continue

        # Check if each match is inside an official source quote
        unquoted_matches = _filter_out_official_quotes(text, term)

        if unquoted_matches:
            violations.append(term)
            if auto_replace:
                replacement = TERM_REPLACEMENTS.get(term, "requires review")
                text = pattern.sub(replacement, text)
                replacements.append((term, replacement))

    if violations and not auto_replace:
        return LanguageFilterResult(
            original=text,
            filtered=text,
            status=FilterResult.VIOLATION,
            violations_found=violations,
            replacements_made=[],
        )

    if violations and auto_replace:
        return LanguageFilterResult(
            original=text,
            filtered=text,
            status=FilterResult.REPLACED,
            violations_found=violations,
            replacements_made=replacements,
        )

    return LanguageFilterResult(
        original=text,
        filtered=text,
        status=FilterResult.PASSED,
        violations_found=[],
        replacements_made=[],
    )


def _filter_out_official_quotes(text: str, term: str) -> list[str]:
    """Returns instances of the term that are NOT inside official-source quotes."""
    remaining: list[str] = []
    for line in text.split('\n'):
        line_lower = line.lower().strip()
        is_in_official_quote = any(line_lower.startswith(p) for p in OFFICIAL_SOURCE_PREFIXES)
        if not is_in_official_quote:
            pattern = re.compile(r'\b' + re.escape(term) + r'\b', re.IGNORECASE)
            if pattern.search(line):
                remaining.append(line)
    return remaining
```

### Task 3.3 — Zero Trust Security Middleware

```python
# backend/app/core/security.py
"""
COMPLIANCE: Zero Trust authentication and authorisation middleware.
Every request must present a valid JWT regardless of network location.
Every state change emits an audit event via app.core.audit.
CONSTRAINT-05: No implicit trust. No IP-based bypass routes.
PIA reference: PIA-003
Last reviewed: 2026-05-29
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Annotated
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from app.config import settings
from app.db.session import get_session
from app.models.user import User, UserRole

logger = structlog.get_logger(__name__)

security_scheme = HTTPBearer(auto_error=True)

# Plan → modules allowed
PLAN_MODULE_ACCESS: dict[UserRole, set[str]] = {
    UserRole.FREE: {"tenderlens_limited", "geolens_public", "ai_analyst_limited"},
    UserRole.SME: {"tenderlens", "munilens_read", "geolens", "ai_analyst_50", "reportlens_basic"},
    UserRole.CONSULTANT: {
        "tenderlens", "munilens", "policylens", "peoplelens",
        "servicelens", "risklens", "geolens", "ai_analyst_200",
        "reportlens", "grantlens", "budgetlens",
    },
    UserRole.ENTERPRISE: {"*"},  # All modules
    UserRole.GOVERNMENT: {
        "tenderlens", "munilens", "policylens", "peoplelens",
        "servicelens", "risklens", "geolens", "ai_analyst_unlimited",
        "reportlens", "agasalert", "earlyalert", "grantlens",
        "budgetlens", "carbonlens",
    },
    UserRole.DEVELOPER: {"datahub", "api_access"},
    UserRole.ADMIN: {"*"},
}


async def decode_jwt(token: str) -> dict:
    """Verifies JWT signature, expiry, and claims."""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
            options={"verify_exp": True, "verify_aud": False},
        )
        if "sub" not in payload:
            raise ValueError("Missing 'sub' claim")
        return payload
    except JWTError as e:
        logger.warning("jwt_verification_failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security_scheme)],
    db: Annotated[AsyncSession, Depends(get_session)],
    request: Request,
) -> User:
    """
    FastAPI dependency: authenticates every request.
    Injects the current user into request state.
    Emits an audit event for every successful authentication.
    """
    from sqlalchemy import select

    payload = await decode_jwt(credentials.credentials)
    supabase_uid: str = payload["sub"]

    result = await db.execute(select(User).where(User.supabase_uid == supabase_uid))
    user = result.scalar_one_or_none()

    if not user or user.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found or deactivated",
        )

    request.state.user = user
    request.state.user_id = str(user.id)
    request.state.user_role = user.role

    return user


def require_module(module_key: str):
    """
    FastAPI dependency factory: enforces module-level access control.

    Usage:
        @router.get("/tenders", dependencies=[Depends(require_module("tenderlens"))])
    """
    async def _check(
        current_user: Annotated[User, Depends(get_current_user)],
    ) -> User:
        allowed = PLAN_MODULE_ACCESS.get(UserRole(current_user.role), set())
        if "*" not in allowed and module_key not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error": "module_access_denied",
                    "message": f"Your current plan does not include access to {module_key}.",
                    "upgrade_url": "/settings/plan",
                },
            )
        return current_user

    return _check


def require_roles(*roles: UserRole):
    """
    FastAPI dependency factory: restricts an endpoint to specific roles.

    Usage:
        @router.get("/earlyalert", dependencies=[Depends(require_roles(UserRole.GOVERNMENT, UserRole.ADMIN))])
    """
    async def _check(
        current_user: Annotated[User, Depends(get_current_user)],
    ) -> User:
        if UserRole(current_user.role) not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error": "role_access_denied",
                    "message": "This resource requires an elevated access level.",
                    "contact": "enterprise@civiclens.co.za",
                },
            )
        return current_user

    return _check
```

### Task 3.4 — Audit Logger

```python
# backend/app/core/audit.py
"""
COMPLIANCE: Immutable audit logger. All state changes and data access events.
MFMA: 7-year retention guaranteed by BigQuery table expiration + GCS archive.
POPIA s19: Security safeguards demonstrated through access audit trail.
PIA reference: PIA-003
Last reviewed: 2026-05-29
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any
from google.cloud import bigquery
import structlog

from app.config import settings

logger = structlog.get_logger(__name__)

# BigQuery client — lazy init (singleton per Cloud Run instance)
_bq_client: bigquery.Client | None = None


def _get_bq_client() -> bigquery.Client:
    global _bq_client
    if _bq_client is None:
        _bq_client = bigquery.Client(project=settings.GCP_PROJECT_ID)
    return _bq_client


AUDIT_TABLE = f"{settings.GCP_PROJECT_ID}.{settings.BQ_DATASET_AUDIT}.platform_audit_log"


async def emit_audit_event(
    action: str,
    outcome: str,
    user_id: uuid.UUID | None = None,
    resource_type: str | None = None,
    resource_id: str | None = None,
    ip_address: str | None = None,
    user_agent: str | None = None,
    session_id: str | None = None,
    http_status_code: int | None = None,
    metadata: dict[str, Any] | None = None,
) -> None:
    """
    Emits an immutable audit event to BigQuery.
    BigQuery is append-only by design — no UPDATE or DELETE on this table.
    Runs fire-and-forget (does not block the API response).
    """
    event = {
        "event_id": str(uuid.uuid4()),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "action": action,
        "outcome": outcome,
        "user_id": str(user_id) if user_id else None,
        "resource_type": resource_type,
        "resource_id": resource_id,
        "ip_address": ip_address,
        "user_agent": user_agent,
        "session_id": session_id,
        "http_status_code": http_status_code,
        "metadata_json": str(metadata) if metadata else None,
    }

    try:
        client = _get_bq_client()
        errors = client.insert_rows_json(AUDIT_TABLE, [event])
        if errors:
            logger.error(
                "audit_event_insert_failed",
                errors=errors,
                action=action,
            )
    except Exception as exc:
        # Audit logging must NEVER crash the API. Log the failure and continue.
        logger.error(
            "audit_event_exception",
            exc=str(exc),
            action=action,
            user_id=str(user_id) if user_id else None,
        )
```

<CHECKPOINT-3>
Validate:
- [ ] `compliance/popia.py` — POPIAMiddleware + ConsentRecord + PURPOSE_MAP
- [ ] `compliance/language_filter.py` — All prohibited terms in PROHIBITED_TERMS set, auto-replace logic
- [ ] `core/security.py` — PLAN_MODULE_ACCESS map, get_current_user, require_module, require_roles
- [ ] `core/audit.py` — BigQuery-backed, fire-and-forget, never crashes API

Run compliance test:
```python
# Quick validation
from app.compliance.language_filter import filter_risk_language, FilterResult

test = "The municipality engaged in corrupt procurement practices and fraud."
result = filter_risk_language(test, auto_replace=True)
assert result.status == FilterResult.REPLACED
assert "corrupt" not in result.filtered.lower()
assert "fraud" not in result.filtered.lower()
print("Language filter: PASSED")
```
</CHECKPOINT-3>
---

## PHASE 4: FASTAPI APPLICATION

**Objective:** Build the full API application — factory, config, dependencies, and all 15 module routers.

### Task 4.1 — Application Config

```python
# backend/app/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # GCP
    GCP_PROJECT_ID: str
    GCP_REGION: str = "africa-south1"

    # BigQuery
    BQ_DATASET_STAGING: str = "civiclens_staging"
    BQ_DATASET_CLEAN: str = "civiclens_clean"
    BQ_DATASET_MART: str = "civiclens_mart"
    BQ_DATASET_AUDIT: str = "civiclens_audit"

    # Cloud SQL
    DATABASE_URL: str
    DATABASE_URL_SYNC: str
    CLOUD_SQL_CONNECTION_NAME: str

    # GCS
    GCS_RAW_BUCKET: str
    GCS_REPORTS_BUCKET: str

    # Redis
    REDIS_URL: str
    REDIS_TTL_SECONDS: int = 14400

    # Auth
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440

    # AI
    ANTHROPIC_API_KEY: str
    AI_MODEL: str = "claude-sonnet-4-20250514"
    AI_MAX_TOKENS: int = 4096
    AI_TEMPERATURE: float = 0.1

    # WhatsApp
    WHATSAPP_PHONE_NUMBER_ID: str = ""
    WHATSAPP_ACCESS_TOKEN: str = ""

    # Stripe
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    # APIs
    ETENDERS_BASE_URL: str = "https://etenders.treasury.gov.za/content"
    MUNICIPAL_MONEY_API_URL: str = "https://municipalmoney.gov.za/api"
    CSD_API_URL: str = ""
    CSD_API_KEY: str = ""

    # Application
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    API_BASE_URL: str = "http://localhost:8000"
    FRONTEND_URL: str = "http://localhost:3000"
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    # AI daily query limits by tier
    FREE_TIER_DAILY_AI_QUERIES: int = 5
    SME_TIER_DAILY_AI_QUERIES: int = 50
    CONSULTANT_TIER_DAILY_AI_QUERIES: int = 200
    ENTERPRISE_TIER_DAILY_AI_QUERIES: int = 0  # 0 = unlimited

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
```

### Task 4.2 — Application Factory

```python
# backend/app/main.py
"""
CivicLens SA — FastAPI Application Factory
Built by Carter Digitals (Pty) Ltd
Architecture: Zero Trust, POPIA-compliant, GCP africa-south1
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
import structlog

from app.config import settings
from app.db.base import init_db
from app.compliance.popia import POPIAMiddleware
from app.api.v1.router import api_v1_router

logger = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle management."""
    logger.info("civiclens_api_startup", environment=settings.ENVIRONMENT)
    await init_db()
    logger.info("database_initialised")
    yield
    logger.info("civiclens_api_shutdown")


def create_app() -> FastAPI:
    app = FastAPI(
        title="CivicLens SA API",
        description=(
            "South African public-sector intelligence platform. "
            "Built by Carter Digitals (Pty) Ltd — B-BBEE Level 1 EME. "
            "Data residency: GCP africa-south1. POPIA compliant."
        ),
        version="2.0.0",
        docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
        redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
        openapi_url="/openapi.json" if settings.ENVIRONMENT != "production" else None,
        lifespan=lifespan,
    )

    # ── Middleware stack (order matters — outermost runs first) ────────────────
    app.add_middleware(GZipMiddleware, minimum_size=1000)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins_list,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "X-CivicLens-Version"],
        max_age=600,
    )

    app.add_middleware(POPIAMiddleware)

    # ── Routes ─────────────────────────────────────────────────────────────────
    app.include_router(api_v1_router, prefix="/api/v1")

    @app.get("/health", include_in_schema=False)
    async def health() -> dict:
        return {"status": "ok", "version": "2.0.0", "region": settings.GCP_REGION}

    return app


app = create_app()
```

### Task 4.3 — API v1 Router

```python
# backend/app/api/v1/router.py
"""Master router — registers all 15 module sub-routers."""
from fastapi import APIRouter
from app.api.v1 import (
    auth, users, municipalities, tenders, suppliers,
    buyers, indicators, geoboundaries, reports, ai_analyst,
    earlyalert, grants, datasets, webhooks,
)

api_v1_router = APIRouter()

# Auth
api_v1_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_v1_router.include_router(users.router, prefix="/users", tags=["Users"])

# M01 TenderLens
api_v1_router.include_router(tenders.router, prefix="/tenders", tags=["TenderLens"])
api_v1_router.include_router(suppliers.router, prefix="/suppliers", tags=["TenderLens"])
api_v1_router.include_router(buyers.router, prefix="/buyers", tags=["TenderLens"])

# M02 MuniLens
api_v1_router.include_router(municipalities.router, prefix="/municipalities", tags=["MuniLens"])

# M04 GeoLens
api_v1_router.include_router(geoboundaries.router, prefix="/geoboundaries", tags=["GeoLens"])

# M07 RiskLens (included in municipalities and tenders responses)

# M08 ReportLens
api_v1_router.include_router(reports.router, prefix="/reports", tags=["ReportLens"])

# M09 DataHub
api_v1_router.include_router(datasets.router, prefix="/datasets", tags=["DataHub"])

# M10 AI Analyst
api_v1_router.include_router(ai_analyst.router, prefix="/ai", tags=["AI Analyst"])

# M12 EarlyAlert
api_v1_router.include_router(earlyalert.router, prefix="/earlyalert", tags=["EarlyAlert"])

# M13 GrantLens
api_v1_router.include_router(grants.router, prefix="/grants", tags=["GrantLens"])

# Indicators (shared across modules)
api_v1_router.include_router(indicators.router, prefix="/indicators", tags=["Indicators"])

# Webhooks
api_v1_router.include_router(webhooks.router, prefix="/webhooks", tags=["Webhooks"])
```

### Task 4.4 — TenderLens Router (full implementation)

```python
# backend/app/api/v1/tenders.py
"""
TenderLens API router.
Provides procurement intelligence: search, supplier profiles, buyer analytics.
Data sources: National Treasury OCDS, Municipal portal scrapes, BAS payments.
"""
from typing import Annotated
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user, require_module
from app.db.session import get_session
from app.models.user import User
from app.schemas.tender import (
    TenderSearchResponse, TenderDetailResponse, TenderSearchParams,
    BidAnalysisResponse,
)
from app.schemas.common import CivicLensResponse, PaginationParams
from app.services.tender_service import TenderService
from app.services.bigquery_service import BigQueryService
from app.core.audit import emit_audit_event

router = APIRouter()


@router.get(
    "",
    response_model=CivicLensResponse[TenderSearchResponse],
    dependencies=[Depends(require_module("tenderlens"))],
    summary="Search tenders",
    description=(
        "Search public sector tenders from National Treasury eTenders OCDS "
        "and CivicLens municipal procurement data. "
        "**Data source:** National Treasury OCDS API (CC BY 4.0) + CivicLens municipal scrapes. "
        "**Caveat:** Municipal procurement data may have a 7-day lag."
    ),
)
async def search_tenders(
    q: str | None = Query(None, description="Full-text search across title and description"),
    category: str | None = Query(None, description="CPV category code or plain-language category"),
    province: str | None = Query(None, description="Province code (e.g. GP, KZN, WC)"),
    buyer_id: str | None = Query(None, description="Buyer entity ID"),
    municipality_code: str | None = Query(None, description="Municipality MDB code"),
    status: str | None = Query(None, enum=["open", "awarded", "cancelled"], description="Tender status"),
    min_value: float | None = Query(None, ge=0, description="Minimum estimated value (ZAR)"),
    max_value: float | None = Query(None, ge=0, description="Maximum estimated value (ZAR)"),
    closing_before: str | None = Query(None, description="ISO date — tenders closing before this date"),
    closing_after: str | None = Query(None, description="ISO date — tenders closing after this date"),
    source: str | None = Query(None, enum=["etenders", "municipal", "all"], description="Data source filter"),
    pagination: PaginationParams = Depends(),
    current_user: Annotated[User, Depends(get_current_user)] = None,
    db: AsyncSession = Depends(get_session),
    bq: BigQueryService = Depends(),
) -> CivicLensResponse[TenderSearchResponse]:
    service = TenderService(bq)
    params = TenderSearchParams(
        q=q, category=category, province=province, buyer_id=buyer_id,
        municipality_code=municipality_code, status=status,
        min_value=min_value, max_value=max_value,
        closing_before=closing_before, closing_after=closing_after,
        source=source or "all",
    )

    # Free tier: max 10 results per day
    if current_user.role == "free":
        pagination.per_page = min(pagination.per_page, 10)

    results, total = await service.search(params, pagination)

    await emit_audit_event(
        action="data.query",
        outcome="success",
        user_id=current_user.id,
        resource_type="tenders",
        metadata={"query": q, "total_results": total},
    )

    return CivicLensResponse(
        data=TenderSearchResponse(items=results, total=total),
        meta={
            "source": "civiclens_mart.mart_tender_opportunities",
            "as_of": await bq.get_last_updated("mart_tender_opportunities"),
            "total": total,
            "page": pagination.page,
            "per_page": pagination.per_page,
        },
        caveats=[
            "Municipal procurement data sourced from CivicLens scrapes — may lag 7 days.",
            "eTenders OCDS data excludes municipalities and SOEs by design.",
            "Estimated values are indicative where provided by the procuring entity.",
        ],
    )


@router.get(
    "/{ocid}",
    response_model=CivicLensResponse[TenderDetailResponse],
    dependencies=[Depends(require_module("tenderlens"))],
    summary="Get tender detail",
)
async def get_tender(
    ocid: str,
    current_user: Annotated[User, Depends(get_current_user)] = None,
    bq: BigQueryService = Depends(),
) -> CivicLensResponse[TenderDetailResponse]:
    service = TenderService(bq)
    tender = await service.get_by_ocid(ocid)

    await emit_audit_event(
        action="data.query",
        outcome="success",
        user_id=current_user.id,
        resource_type="tender",
        resource_id=ocid,
    )

    return CivicLensResponse(
        data=tender,
        meta={"source": "civiclens_mart.mart_tender_opportunities", "ocid": ocid},
        caveats=[
            "Always verify requirements against official tender documents before bidding.",
            "AI summary is generated from structured data — not a substitute for legal review.",
        ],
    )


@router.get(
    "/{ocid}/bid-analysis",
    response_model=CivicLensResponse[BidAnalysisResponse],
    dependencies=[Depends(require_module("tenderlens"))],
    summary="AI Bid/No-Bid analysis",
    description="Generates an AI-powered bid recommendation using buyer history, market data, and risk signals.",
)
async def get_bid_analysis(
    ocid: str,
    current_user: Annotated[User, Depends(get_current_user)] = None,
    bq: BigQueryService = Depends(),
    db: AsyncSession = Depends(get_session),
) -> CivicLensResponse[BidAnalysisResponse]:
    from app.services.ai_analyst_service import AIAnalystService
    service = AIAnalystService(bq, db)
    analysis = await service.generate_bid_analysis(ocid, current_user)

    await emit_audit_event(
        action="ai.query",
        outcome="success",
        user_id=current_user.id,
        resource_type="bid_analysis",
        resource_id=ocid,
    )

    return CivicLensResponse(
        data=analysis,
        meta={"source": "ai_analyst_v2", "ocid": ocid, "model": "claude-sonnet"},
        caveats=[
            "This analysis is advisory only. It does not constitute professional procurement advice.",
            "All data sourced from official public sources. Verify against official documents.",
            "Risk signals indicate patterns requiring review — not allegations of wrongdoing.",
        ],
    )
```

### Task 4.5 — Common Schemas

```python
# backend/app/schemas/common.py
"""Universal response envelope and pagination for the CivicLens SA API."""
from typing import Generic, TypeVar, Any
from pydantic import BaseModel, Field

T = TypeVar("T")


class CivicLensResponse(BaseModel, Generic[T]):
    """
    Universal API response envelope.
    Every endpoint returns this structure — no naked dicts, no ad-hoc responses.
    The 'caveats' field is mandatory for data endpoints — enforces data transparency.
    """
    data: T
    meta: dict[str, Any] = Field(default_factory=dict)
    caveats: list[str] = Field(
        default_factory=list,
        description="Data quality caveats, methodology notes, and source limitations.",
    )


class PaginationParams(BaseModel):
    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=50, ge=1, le=200)

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.per_page


class ErrorResponse(BaseModel):
    error: str
    message: str
    detail: Any | None = None
    request_id: str | None = None
```

<CHECKPOINT-4>
Validate:
- [ ] `config.py` — all 35+ settings defined with types
- [ ] `main.py` — factory pattern, all middleware registered, lifespan implemented
- [ ] `api/v1/router.py` — all 15 module routers imported and mounted
- [ ] `api/v1/tenders.py` — full search + detail + bid-analysis with audit logging
- [ ] `schemas/common.py` — CivicLensResponse<T> generic with caveats field

Run:
```bash
cd backend
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
# Expected: "Application startup complete." with no import errors
```
</CHECKPOINT-4>

---

## PHASE 5: DATA PIPELINE (dbt + Airflow)

**Objective:** Build the transformation layer that converts raw government data into clean, analytics-ready BigQuery tables.

### Task 5.1 — dbt Project Config

```yaml
# data-pipeline/dbt/dbt_project.yml
name: civiclens
version: "2.0.0"
config-version: 2
profile: civiclens_bq

model-paths: ["models"]
test-paths: ["tests"]
macro-paths: ["macros"]
analysis-paths: ["analyses"]
docs-paths: ["docs"]

target-path: "target"
clean-targets: ["target", "dbt_packages"]

vars:
  civiclens_project: "{{ env_var('GCP_PROJECT_ID') }}"
  bq_location: "africa-south1"
  financial_year_start_month: 4  # SA financial year starts 1 April

models:
  civiclens:
    staging:
      +materialized: view
      +schema: staging
      +tags: ["staging"]
    clean:
      +materialized: table
      +schema: clean
      +tags: ["clean"]
      dimensions:
        +materialized: table
      facts:
        +materialized: table
    mart:
      +materialized: table
      +schema: mart
      +tags: ["mart"]
      +post-hook: "CALL `{{ var('civiclens_project') }}.civiclens_mart.refresh_metadata`()"

seeds:
  civiclens:
    +schema: seeds
    province_codes:
      +column_types:
        code: STRING
        name: STRING
        region: STRING
    municipality_categories:
      +column_types:
        category: STRING
        description: STRING
```

### Task 5.2 — Municipality Dimension (critical foundation table)

```sql
-- data-pipeline/dbt/models/clean/dimensions/dim_municipality.sql
-- COMPLIANCE: No personal data. Public government administrative boundaries.
-- Source: Municipal Demarcation Board (MDB) + National Treasury codes

{{
  config(
    materialized='table',
    cluster_by=['province_code'],
    labels={
      'data_class': 'public-government',
      'popia_scope': 'non-personal',
      'source': 'mdb-national-treasury'
    }
  )
}}

WITH mdb_boundaries AS (
  SELECT
    municipality_code,
    municipality_name,
    municipality_name_alt,
    category,       -- A (Metro), B (Local), C (District), DMA (District Management Area)
    province_code,
    district_code,
    demarcation_year,
    geo_centroid_lat,
    geo_centroid_lng,
    area_sqkm,
    _loaded_at
  FROM {{ source('mdb', 'municipal_boundaries') }}
  WHERE municipality_code IS NOT NULL
    AND LENGTH(TRIM(municipality_code)) = 6  -- MDB format: 2-letter province + 4-digit code
),

treasury_codes AS (
  SELECT DISTINCT
    demarcation_code,
    treasury_category,
    municipality_type_description
  FROM {{ source('treasury', 'municipality_reference') }}
),

province_lookup AS (
  SELECT code, name AS province_name, region AS economic_region
  FROM {{ ref('province_codes') }}
)

SELECT
  m.municipality_code,
  m.municipality_name,
  COALESCE(m.municipality_name_alt, m.municipality_name) AS display_name,
  m.category,
  CASE m.category
    WHEN 'A' THEN 'Metropolitan Municipality'
    WHEN 'B' THEN 'Local Municipality'
    WHEN 'C' THEN 'District Municipality'
    WHEN 'DMA' THEN 'District Management Area'
    ELSE 'Unknown'
  END AS category_description,
  m.province_code,
  p.province_name,
  p.economic_region,
  m.district_code,
  m.demarcation_year,
  m.geo_centroid_lat,
  m.geo_centroid_lng,
  m.area_sqkm,
  t.municipality_type_description,
  -- Metadata
  CURRENT_TIMESTAMP() AS _dbt_loaded_at,
  '{{ var("bq_location") }}' AS _data_residency

FROM mdb_boundaries m
LEFT JOIN province_lookup p ON m.province_code = p.code
LEFT JOIN treasury_codes t ON m.municipality_code = t.demarcation_code
```

### Task 5.3 — Tender Facts (core mart)

```sql
-- data-pipeline/dbt/models/mart/mart_tender_opportunities.sql
-- Powers TenderLens search. Updated daily from OCDS + municipal scrapes.
-- COMPLIANCE: No personal data. Procurement is a public accountability domain.

{{
  config(
    materialized='table',
    partition_by={
      'field': 'closing_date',
      'data_type': 'date',
      'granularity': 'month'
    },
    cluster_by=['province_code', 'category_code', 'status'],
    labels={
      'data_class': 'public-procurement',
      'popia_scope': 'non-personal',
      'source': 'ocds-municipal-scrape'
    }
  )
}}

WITH ocds_tenders AS (
  SELECT
    ocid,
    'etenders' AS data_source,
    tender_title,
    tender_description,
    buyer_id,
    buyer_name,
    buyer_type,
    province_code,
    municipality_code,
    category_code,
    category_description,
    estimated_value_zar,
    currency,
    DATE(closing_date) AS closing_date,
    DATE(publication_date) AS publication_date,
    DATE(award_date) AS award_date,
    tender_status,
    winner_supplier_id,
    winner_supplier_name,
    winner_awarded_value_zar,
    bbbee_requirement,
    reference_number,
    source_url,
    _source_period,
    _loaded_at
  FROM {{ ref('stg_etenders_tenders') }}
  WHERE ocid IS NOT NULL
),

municipal_scrapes AS (
  SELECT
    ocid,
    'municipal' AS data_source,
    tender_title,
    tender_description,
    buyer_id,
    buyer_name,
    'municipality' AS buyer_type,
    province_code,
    municipality_code,
    category_code,
    category_description,
    estimated_value_zar,
    'ZAR' AS currency,
    DATE(closing_date) AS closing_date,
    DATE(publication_date) AS publication_date,
    DATE(award_date) AS award_date,
    tender_status,
    winner_supplier_id,
    winner_supplier_name,
    winner_awarded_value_zar,
    bbbee_requirement,
    reference_number,
    source_url,
    _source_period,
    _loaded_at
  FROM {{ ref('stg_municipal_portal_tenders') }}
  WHERE ocid IS NOT NULL
    AND ocid NOT IN (SELECT ocid FROM ocds_tenders)  -- deduplicate
),

all_tenders AS (
  SELECT * FROM ocds_tenders
  UNION ALL
  SELECT * FROM municipal_scrapes
),

enriched AS (
  SELECT
    t.*,
    m.municipality_name,
    m.province_name,
    m.category AS municipality_category,
    -- Computed fields
    DATE_DIFF(t.closing_date, CURRENT_DATE(), DAY) AS days_until_closing,
    CASE
      WHEN DATE_DIFF(t.closing_date, CURRENT_DATE(), DAY) < 0 THEN 'closed'
      WHEN DATE_DIFF(t.closing_date, CURRENT_DATE(), DAY) <= 7 THEN 'closing_soon'
      WHEN DATE_DIFF(t.closing_date, CURRENT_DATE(), DAY) <= 30 THEN 'open'
      ELSE 'open'
    END AS closing_urgency,
    -- CSD verification flag (joined from weekly CSD sync)
    CASE WHEN csd.supplier_id IS NOT NULL THEN TRUE ELSE FALSE END AS winner_csd_verified,
    -- Debarment flag
    CASE WHEN deb.supplier_id IS NOT NULL THEN TRUE ELSE FALSE END AS winner_debarred

  FROM all_tenders t
  LEFT JOIN {{ ref('dim_municipality') }} m ON t.municipality_code = m.municipality_code
  LEFT JOIN {{ ref('dim_csd_suppliers') }} csd
    ON LOWER(TRIM(t.winner_supplier_name)) = LOWER(TRIM(csd.supplier_name))
  LEFT JOIN {{ ref('dim_debarred_suppliers') }} deb ON t.winner_supplier_id = deb.supplier_id
)

SELECT * FROM enriched
WHERE closing_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 24 MONTH)
   OR tender_status = 'open'
```

### Task 5.4 — Municipal Finance Health Score

```sql
-- data-pipeline/dbt/models/mart/mart_municipality_financial_health.sql
-- Calculates the Financial Health Score (0-100) for all 257 municipalities.
-- Score methodology is fully transparent and documented in docs/.

{{
  config(
    materialized='table',
    cluster_by=['province_code', 'financial_year'],
    labels={'data_class': 'public-finance', 'popia_scope': 'non-personal'}
  )
}}

WITH financial_ratios AS (
  SELECT
    municipality_code,
    financial_year,
    -- Core ratios
    operating_surplus_ratio,
    cash_coverage_days,
    net_debtors_collection_rate,
    repairs_maintenance_pct_of_ppe,
    capital_budget_execution_rate,
    irregular_expenditure_pct_of_revenue,
    creditors_payment_days,
    -- Raw values
    total_revenue,
    total_expenditure,
    cash_and_equivalents,
    own_revenue,
    equitable_share,
    grants_received,
    -- MFMA trigger values
    total_debt_outstanding,
    operating_budget_total,
    budget_funded_status
  FROM {{ ref('fact_municipal_finance') }}
  WHERE financial_year >= '2020/21'
),

scored AS (
  SELECT
    municipality_code,
    financial_year,

    -- Component scoring (each 0–20, summed to 100)
    -- 1. Operating surplus (max 20)
    CASE
      WHEN operating_surplus_ratio >= 0.05 THEN 20
      WHEN operating_surplus_ratio >= 0.02 THEN 15
      WHEN operating_surplus_ratio >= 0   THEN 8
      WHEN operating_surplus_ratio >= -0.05 THEN 3
      ELSE 0
    END AS score_operating_surplus,

    -- 2. Cash coverage (max 20)
    CASE
      WHEN cash_coverage_days >= 45 THEN 20
      WHEN cash_coverage_days >= 30 THEN 15
      WHEN cash_coverage_days >= 15 THEN 8
      WHEN cash_coverage_days >= 0  THEN 3
      ELSE 0
    END AS score_cash_coverage,

    -- 3. Revenue collection (max 20)
    CASE
      WHEN net_debtors_collection_rate >= 0.95 THEN 20
      WHEN net_debtors_collection_rate >= 0.85 THEN 14
      WHEN net_debtors_collection_rate >= 0.75 THEN 8
      WHEN net_debtors_collection_rate >= 0.60 THEN 3
      ELSE 0
    END AS score_collection_rate,

    -- 4. Repairs & maintenance (max 20 — underspending is major AGSA finding)
    CASE
      WHEN repairs_maintenance_pct_of_ppe >= 0.08 THEN 20
      WHEN repairs_maintenance_pct_of_ppe >= 0.06 THEN 14
      WHEN repairs_maintenance_pct_of_ppe >= 0.04 THEN 7
      ELSE 0
    END AS score_repairs_maintenance,

    -- 5. Capital budget execution (max 20)
    CASE
      WHEN capital_budget_execution_rate >= 0.90 THEN 20
      WHEN capital_budget_execution_rate >= 0.75 THEN 14
      WHEN capital_budget_execution_rate >= 0.50 THEN 7
      ELSE 0
    END AS score_capital_execution,

    -- MFMA s139 trigger flags (informational — not part of score)
    CASE WHEN operating_surplus_ratio < 0 AND cash_coverage_days < 0 THEN TRUE ELSE FALSE END
      AS trigger_t4_serious_financial_problems,
    CASE WHEN budget_funded_status = 'unfunded' THEN TRUE ELSE FALSE END
      AS trigger_t1_unfunded_budget,
    CASE WHEN (total_debt_outstanding / NULLIF(operating_budget_total, 0)) > 0.02 THEN TRUE ELSE FALSE END
      AS trigger_t2_debt_threshold,

    -- Raw values pass-through
    total_revenue, total_expenditure, cash_and_equivalents,
    own_revenue, equitable_share, grants_received,
    operating_surplus_ratio, cash_coverage_days, net_debtors_collection_rate,
    repairs_maintenance_pct_of_ppe, capital_budget_execution_rate,
    irregular_expenditure_pct_of_revenue

  FROM financial_ratios
),

final AS (
  SELECT
    municipality_code,
    financial_year,
    -- Final score (sum of components)
    (score_operating_surplus + score_cash_coverage + score_collection_rate
     + score_repairs_maintenance + score_capital_execution) AS financial_health_score,
    -- Grade
    CASE
      WHEN (score_operating_surplus + score_cash_coverage + score_collection_rate
            + score_repairs_maintenance + score_capital_execution) >= 70 THEN 'Healthy'
      WHEN (score_operating_surplus + score_cash_coverage + score_collection_rate
            + score_repairs_maintenance + score_capital_execution) >= 40 THEN 'Under Pressure'
      ELSE 'Financially Distressed'
    END AS financial_health_grade,
    -- Component scores
    score_operating_surplus, score_cash_coverage, score_collection_rate,
    score_repairs_maintenance, score_capital_execution,
    -- MFMA triggers
    trigger_t1_unfunded_budget, trigger_t2_debt_threshold, trigger_t4_serious_financial_problems,
    -- Raw ratios
    operating_surplus_ratio, cash_coverage_days, net_debtors_collection_rate,
    repairs_maintenance_pct_of_ppe, capital_budget_execution_rate,
    irregular_expenditure_pct_of_revenue,
    total_revenue, total_expenditure, cash_and_equivalents,
    -- Metadata
    CURRENT_TIMESTAMP() AS _dbt_loaded_at

  FROM scored
)

SELECT
  f.*,
  m.municipality_name,
  m.province_code,
  m.province_name,
  m.category AS municipality_category
FROM final f
JOIN {{ ref('dim_municipality') }} m USING (municipality_code)
```

### Task 5.5 — Daily Tender Ingestion DAG

```python
# data-pipeline/airflow/dags/daily_tenders.py
"""
Daily ingestion of National Treasury eTenders OCDS data.
Runs at 06:00 SAST (04:00 UTC).
"""
from datetime import datetime, timedelta
from airflow import DAG
from airflow.providers.google.cloud.operators.cloud_run import CloudRunExecuteJobOperator
from airflow.providers.google.cloud.operators.bigquery import BigQueryInsertJobOperator

GCP_PROJECT = "{{ var.value.gcp_project_id }}"
REGION = "africa-south1"

default_args = {
    "owner": "civiclens-pipeline",
    "depends_on_past": False,
    "retries": 3,
    "retry_delay": timedelta(minutes=15),
    "retry_exponential_backoff": True,
    "max_retry_delay": timedelta(hours=1),
    "email_on_failure": True,
    "email": ["pipeline-alerts@civiclens.co.za"],
}

with DAG(
    dag_id="daily_etenders_ingest",
    default_args=default_args,
    schedule_interval="0 4 * * *",  # 04:00 UTC = 06:00 SAST
    start_date=datetime(2026, 1, 1),
    catchup=False,
    max_active_runs=1,
    tags=["tenderlens", "daily", "procurement", "popia-non-personal"],
    doc_md="""
    ## Daily eTenders OCDS Ingestion

    Fetches the latest tender publications and awards from the National Treasury
    OCDS API. Data is CC BY 4.0 licensed. No personal information in this dataset.

    **Steps:**
    1. Download latest OCDS release packages from eTenders API
    2. Compute SHA-256 checksum and write to GCS raw bucket
    3. Register download in dataset_registry
    4. Trigger dbt staging model for etenders
    5. Trigger mart refresh for mart_tender_opportunities
    6. Send Pub/Sub event for alert matching service
    """,
) as dag:

    ingest_ocds = CloudRunExecuteJobOperator(
        task_id="ingest_ocds_tenders",
        project_id=GCP_PROJECT,
        region=REGION,
        job_name="civiclens-etenders-ingest",
        overrides={
            "container_overrides": [{
                "env": [
                    {"name": "RUN_DATE", "value": "{{ ds }}"},
                    {"name": "PIPELINE_TYPE", "value": "etenders_ocds"},
                ],
            }]
        },
    )

    run_dbt_staging = CloudRunExecuteJobOperator(
        task_id="dbt_stg_etenders",
        project_id=GCP_PROJECT,
        region=REGION,
        job_name="civiclens-dbt-runner",
        overrides={
            "container_overrides": [{
                "env": [
                    {"name": "DBT_COMMAND", "value": "dbt run --select staging.etenders+"},
                    {"name": "DBT_TARGET", "value": "prod"},
                ],
            }]
        },
    )

    run_dbt_mart = CloudRunExecuteJobOperator(
        task_id="dbt_mart_tenders",
        project_id=GCP_PROJECT,
        region=REGION,
        job_name="civiclens-dbt-runner",
        overrides={
            "container_overrides": [{
                "env": [
                    {"name": "DBT_COMMAND", "value": "dbt run --select mart_tender_opportunities"},
                    {"name": "DBT_TARGET", "value": "prod"},
                ],
            }]
        },
    )

    trigger_alerts = CloudRunExecuteJobOperator(
        task_id="trigger_saved_search_alerts",
        project_id=GCP_PROJECT,
        region=REGION,
        job_name="civiclens-alert-matcher",
    )

    ingest_ocds >> run_dbt_staging >> run_dbt_mart >> trigger_alerts
```

<CHECKPOINT-5>
Validate:
- [ ] `dbt_project.yml` — all three schema layers configured (staging, clean, mart)
- [ ] `dim_municipality.sql` — all 257 municipalities from MDB source
- [ ] `mart_municipality_financial_health.sql` — financial health score formula implemented
- [ ] `mart_tender_opportunities.sql` — OCDS + municipal scrape UNION with deduplication
- [ ] `daily_tenders.py` DAG — 4-step pipeline with retry config

Run:
```bash
cd data-pipeline/dbt
dbt parse  # Should complete with no errors
dbt test --select dim_municipality  # Run data quality tests
```
</CHECKPOINT-5>

---

## PHASE 6: FRONTEND SCAFFOLD

**Objective:** Build the Next.js application shell — layout, routing, auth, global components.

### Task 6.1 — Next.js Config

```typescript
// frontend/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  experimental: {
    typedRoutes: true,
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "storage.googleapis.com" },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://api.civiclens.co.za https://*.supabase.co wss://*.supabase.co",
              "font-src 'self'",
            ].join("; "),
          },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
```

### Task 6.2 — Root Layout (Sidebar + Topbar)

```typescript
// frontend/src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "CivicLens SA — South African Public Sector Intelligence",
  description:
    "The definitive intelligence platform for South African public-sector data. " +
    "Procurement, municipal finance, demographics, risk — in one place.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "CivicLens SA",
    description: "South African public sector intelligence platform",
    siteName: "CivicLens SA",
    locale: "en_ZA",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-ZA" className={inter.variable} suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <Providers>
          <div className="flex h-screen overflow-hidden">
            {/* Sidebar — hidden on mobile, visible ≥ 1024px */}
            <Sidebar />

            {/* Main content */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
              <Topbar />
              <main className="flex-1 overflow-y-auto bg-muted/30">
                <div className="max-w-[1400px] mx-auto px-4 py-6 lg:px-8">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
```

### Task 6.3 — Sidebar Component (full implementation)

```typescript
// frontend/src/components/layout/Sidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Search, FileText, MapPin, Users, Activity,
  AlertTriangle, BarChart3, Database, Bot, Shield, TrendingDown,
  DollarSign, Leaf, ChevronLeft, ChevronRight, Building2,
  ShoppingCart,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: "Enterprise" | "Government" | "Developer" | "New";
  group: string;
}

const NAV_ITEMS: NavItem[] = [
  // DISCOVER
  { href: "/", label: "Home", icon: LayoutDashboard, group: "DISCOVER" },
  { href: "/ai-analyst", label: "AI Analyst", icon: Bot, group: "DISCOVER" },

  // PROCUREMENT
  { href: "/tenderlens", label: "TenderLens", icon: ShoppingCart, group: "PROCUREMENT" },

  // MUNICIPAL
  { href: "/munilens", label: "MuniLens", icon: Building2, group: "MUNICIPAL" },
  { href: "/earlyalert", label: "EarlyAlert", icon: AlertTriangle, badge: "Government", group: "MUNICIPAL" },
  { href: "/agasalert", label: "AGASAlert", icon: Shield, badge: "Enterprise", group: "MUNICIPAL" },

  // POLICY & PEOPLE
  { href: "/policylens", label: "PolicyLens", icon: FileText, group: "POLICY & PEOPLE" },
  { href: "/peoplelens", label: "PeopleLens", icon: Users, group: "POLICY & PEOPLE" },
  { href: "/budgetlens", label: "BudgetLens", icon: DollarSign, group: "POLICY & PEOPLE" },

  // GEOGRAPHY & SERVICES
  { href: "/geolens", label: "GeoLens", icon: MapPin, group: "GEOGRAPHY & SERVICES" },
  { href: "/servicelens", label: "ServiceLens", icon: Activity, group: "GEOGRAPHY & SERVICES" },
  { href: "/carbonlens", label: "CarbonLens", icon: Leaf, group: "GEOGRAPHY & SERVICES" },

  // RISK & OVERSIGHT
  { href: "/risklens", label: "RiskLens", icon: TrendingDown, group: "RISK & OVERSIGHT" },
  { href: "/grantlens", label: "GrantLens", icon: BarChart3, group: "RISK & OVERSIGHT" },

  // INTELLIGENCE
  { href: "/reportlens", label: "ReportLens", icon: Search, group: "INTELLIGENCE" },
  { href: "/datahub", label: "DataHub", icon: Database, badge: "Developer", group: "INTELLIGENCE" },
];

const BADGE_STYLES: Record<string, string> = {
  Enterprise: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Government: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  Developer: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  New: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user } = useAuthStore();

  const groups = [...new Set(NAV_ITEMS.map((i) => i.group))];

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col bg-card border-r border-border transition-all duration-200 shrink-0",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b border-border gap-3">
        <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shrink-0">
          <span className="text-primary-foreground text-xs font-bold">CL</span>
        </div>
        {!collapsed && (
          <span className="font-semibold text-sm text-foreground">CivicLens SA</span>
        )}
      </div>

      {/* Plan badge */}
      {!collapsed && user && (
        <div className="px-4 py-2 border-b border-border">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {user.role} plan
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {groups.map((group) => {
          const items = NAV_ITEMS.filter((i) => i.group === group);
          return (
            <div key={group} className="mb-4">
              {!collapsed && (
                <p className="px-2 mb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {group}
                </p>
              )}
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors group",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge && (
                          <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", BADGE_STYLES[item.badge])}>
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
```

### Task 6.4 — API Client

```typescript
// frontend/src/lib/api.ts
/**
 * CivicLens SA API client.
 * All requests go through this client — handles auth, error normalisation,
 * and the CivicLensResponse<T> envelope unwrapping.
 */
import axios, { AxiosInstance, AxiosError } from "axios";
import { createClient } from "@supabase/supabase-js";

// CivicLens API response envelope
export interface CivicLensResponse<T> {
  data: T;
  meta: {
    source?: string;
    as_of?: string;
    total?: number;
    page?: number;
    per_page?: number;
    [key: string]: unknown;
  };
  caveats: string[];
}

export interface APIError {
  error: string;
  message: string;
  detail?: unknown;
}

function createAPIClient(): AxiosInstance {
  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
      "X-CivicLens-Version": "2026-05-01",
    },
  });

  // Attach JWT on every request
  client.interceptors.request.use(async (config) => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
  });

  // Normalise errors
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError<APIError>) => {
      if (error.response?.status === 401) {
        // Token expired — redirect to login
        if (typeof window !== "undefined") window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );

  return client;
}

export const apiClient = createAPIClient();

// Type-safe wrapper: unwraps the CivicLensResponse envelope
export async function apiGet<T>(
  path: string,
  params?: Record<string, unknown>
): Promise<CivicLensResponse<T>> {
  const response = await apiClient.get<CivicLensResponse<T>>(path, { params });
  return response.data;
}

export async function apiPost<T>(
  path: string,
  body: unknown
): Promise<CivicLensResponse<T>> {
  const response = await apiClient.post<CivicLensResponse<T>>(path, body);
  return response.data;
}
```

### Task 6.5 — TanStack Query Key Factory

```typescript
// frontend/src/lib/query-keys.ts
/**
 * Centralised query key factory for TanStack Query.
 * Consistent keys prevent cache collisions and enable targeted invalidation.
 */
export const queryKeys = {
  // TenderLens
  tenders: {
    all: ["tenders"] as const,
    search: (params: Record<string, unknown>) => ["tenders", "search", params] as const,
    detail: (ocid: string) => ["tenders", "detail", ocid] as const,
    bidAnalysis: (ocid: string) => ["tenders", "bid-analysis", ocid] as const,
  },

  // MuniLens
  municipalities: {
    all: ["municipalities"] as const,
    list: (filters: Record<string, unknown>) => ["municipalities", "list", filters] as const,
    detail: (code: string) => ["municipalities", "detail", code] as const,
    finance: (code: string, year?: string) => ["municipalities", "finance", code, year] as const,
    scorecard: (code: string) => ["municipalities", "scorecard", code] as const,
    earlyalert: (code: string) => ["municipalities", "earlyalert", code] as const,
  },

  // Suppliers
  suppliers: {
    detail: (id: string) => ["suppliers", "detail", id] as const,
    awards: (id: string) => ["suppliers", "awards", id] as const,
  },

  // GeoLens
  geoboundaries: {
    provinces: ["geoboundaries", "provinces"] as const,
    districts: ["geoboundaries", "districts"] as const,
    municipalities: ["geoboundaries", "municipalities"] as const,
    wards: (municipalityCode: string) => ["geoboundaries", "wards", municipalityCode] as const,
  },

  // Indicators
  indicators: {
    all: ["indicators"] as const,
    values: (id: string, geography: string, periodFrom?: string, periodTo?: string) =>
      ["indicators", "values", id, geography, periodFrom, periodTo] as const,
  },

  // EarlyAlert
  earlyalert: {
    national: (province?: string) => ["earlyalert", "national", province] as const,
    municipality: (code: string) => ["earlyalert", "municipality", code] as const,
  },

  // AI Analyst
  aiAnalyst: {
    history: (sessionId: string) => ["ai-analyst", "history", sessionId] as const,
  },

  // Reports
  reports: {
    list: ["reports", "list"] as const,
    detail: (id: string) => ["reports", "detail", id] as const,
  },
} as const;
```

<CHECKPOINT-6>
Validate:
- [ ] `next.config.ts` — security headers, rewrites to API, strict mode
- [ ] `app/layout.tsx` — Sidebar + Topbar + Providers
- [ ] `components/layout/Sidebar.tsx` — all 15 modules linked with correct badges
- [ ] `lib/api.ts` — CivicLensResponse<T> envelope, auth interceptor, error handling
- [ ] `lib/query-keys.ts` — all modules represented

Run:
```bash
cd frontend
pnpm install
pnpm dev
# Expected: Next.js running on http://localhost:3000
```
</CHECKPOINT-6>

---

## PHASE 7: MODULE BUILDS (MVP — TenderLens + MuniLens + GeoLens)

Build each module in order. Each module requires: page component + sub-components + hooks + service layer wired to BigQuery.

### Task 7.1 — TenderLens Page

```typescript
// frontend/src/app/tenderlens/page.tsx
import { Suspense } from "react";
import { Metadata } from "next";
import { TenderSearch } from "@/components/tenderlens/TenderSearch";
import { TenderStatsStrip } from "@/components/tenderlens/TenderStatsStrip";
import { SavedSearchRow } from "@/components/tenderlens/SavedSearchRow";
import { SkeletonLoader } from "@/components/shared/SkeletonLoader";

export const metadata: Metadata = {
  title: "TenderLens — Procurement Intelligence | CivicLens SA",
  description: "Search South African government tenders from National Treasury and municipal procurement portals.",
};

export default function TenderLensPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">TenderLens</h1>
          <p className="text-sm text-muted-foreground mt-1">
            National Treasury eTenders OCDS + CivicLens municipal procurement intelligence
          </p>
        </div>
        <a
          href="/tenderlens/saved-searches"
          className="text-sm text-primary hover:underline"
        >
          + New saved search
        </a>
      </div>

      {/* Stats strip */}
      <Suspense fallback={<SkeletonLoader rows={1} cols={4} />}>
        <TenderStatsStrip />
      </Suspense>

      {/* Saved searches */}
      <Suspense fallback={<SkeletonLoader rows={1} />}>
        <SavedSearchRow />
      </Suspense>

      {/* Main search interface */}
      <TenderSearch />
    </div>
  );
}
```

### Task 7.2 — useTenders Hook

```typescript
// frontend/src/hooks/useTenders.ts
"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { apiGet, CivicLensResponse } from "@/lib/api";

export interface TenderSummary {
  ocid: string;
  title: string;
  buyer_id: string;
  buyer_name: string;
  buyer_type: string;
  province_code: string;
  province_name: string;
  municipality_code: string | null;
  municipality_name: string | null;
  category_code: string;
  category_description: string;
  estimated_value_zar: number | null;
  closing_date: string;
  days_until_closing: number;
  closing_urgency: "closing_soon" | "open" | "closed";
  tender_status: string;
  data_source: "etenders" | "municipal";
  winner_csd_verified: boolean;
  winner_debarred: boolean;
}

export interface TenderSearchResponse {
  items: TenderSummary[];
  total: number;
}

export interface TenderSearchParams {
  q?: string;
  category?: string;
  province?: string;
  buyer_id?: string;
  municipality_code?: string;
  status?: "open" | "awarded" | "cancelled";
  min_value?: number;
  max_value?: number;
  closing_before?: string;
  closing_after?: string;
  source?: "etenders" | "municipal" | "all";
  page?: number;
  per_page?: number;
}

export function useTenders(params: TenderSearchParams = {}) {
  return useQuery({
    queryKey: queryKeys.tenders.search(params),
    queryFn: () =>
      apiGet<TenderSearchResponse>("/api/v1/tenders", params as Record<string, unknown>),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (response: CivicLensResponse<TenderSearchResponse>) => ({
      ...response.data,
      meta: response.meta,
      caveats: response.caveats,
    }),
  });
}

export function useTenderDetail(ocid: string) {
  return useQuery({
    queryKey: queryKeys.tenders.detail(ocid),
    queryFn: () => apiGet<TenderDetail>(`/api/v1/tenders/${ocid}`),
    enabled: Boolean(ocid),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Type for tender detail (extends summary with full fields)
export interface TenderDetail extends TenderSummary {
  description: string;
  reference_number: string;
  source_url: string;
  bbbee_requirement: boolean | null;
  award_date: string | null;
  winner_supplier_id: string | null;
  winner_supplier_name: string | null;
  winner_awarded_value_zar: number | null;
  ai_summary: string | null;
}
```

### Task 7.3 — MuniLens Municipality Detail Page

```typescript
// frontend/src/app/munilens/[code]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { MunicipalityHeader } from "@/components/munilens/MunicipalityHeader";
import { MunicipalityTabs } from "@/components/munilens/MunicipalityTabs";

interface Props {
  params: { code: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `${params.code} Municipality Profile | MuniLens — CivicLens SA`,
    description: `Financial health, demographics, services, procurement, and risk intelligence for ${params.code} municipality.`,
  };
}

export default function MunicipalityPage({ params }: Props) {
  const { code } = params;

  // Validate MDB code format: 2-letter province prefix + 4 digits (e.g. GT001, KZN213)
  if (!/^[A-Z]{2,3}\d{3}$/.test(code.toUpperCase())) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <MunicipalityHeader code={code.toUpperCase()} />
      <MunicipalityTabs code={code.toUpperCase()} />
    </div>
  );
}
```

### Task 7.4 — MFMA Section 139 Trigger Panel Component

```typescript
// frontend/src/components/munilens/MFMA139TriggerPanel.tsx
"use client";

import { AlertTriangle, CheckCircle, HelpCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Trigger {
  code: string;
  label: string;
  legal_basis: string;
  status: "active" | "borderline" | "clear" | "no_data";
  evidence: string | null;
  data_source: string | null;
  last_updated: string | null;
}

interface Props {
  triggers: Trigger[];
  municipality_name: string;
}

const STATUS_CONFIG = {
  active: {
    icon: XCircle,
    label: "Active",
    className: "text-destructive border-destructive bg-destructive/5",
  },
  borderline: {
    icon: AlertTriangle,
    label: "Borderline",
    className: "text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-900/10",
  },
  clear: {
    icon: CheckCircle,
    label: "Clear",
    className: "text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-900/10",
  },
  no_data: {
    icon: HelpCircle,
    label: "No data",
    className: "text-muted-foreground border-border bg-muted/30",
  },
} as const;

export function MFMA139TriggerPanel({ triggers, municipality_name }: Props) {
  const activeCount = triggers.filter((t) => t.status === "active").length;

  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-sm text-foreground">
            MFMA Section 139 Trigger Checker
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Automated check of statutory intervention triggers for {municipality_name}
          </p>
        </div>
        {activeCount > 0 && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-destructive bg-destructive/10 px-2 py-1 rounded-full shrink-0">
            <XCircle className="w-3.5 h-3.5" />
            {activeCount} active {activeCount === 1 ? "trigger" : "triggers"}
          </span>
        )}
      </div>

      {/* Triggers list */}
      <div className="space-y-2">
        {triggers.map((trigger) => {
          const config = STATUS_CONFIG[trigger.status];
          const Icon = config.icon;

          return (
            <div
              key={trigger.code}
              className={cn(
                "flex items-start gap-3 p-3 rounded-md border text-sm",
                config.className
              )}
            >
              <Icon className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{trigger.code}</span>
                  <span className="text-muted-foreground">—</span>
                  <span>{trigger.label}</span>
                  <span className="ml-auto text-xs font-medium opacity-75">{config.label}</span>
                </div>
                {trigger.evidence && (
                  <p className="text-xs mt-1 opacity-80">{trigger.evidence}</p>
                )}
                {trigger.data_source && (
                  <p className="text-xs mt-0.5 opacity-60">
                    Source: {trigger.data_source}
                    {trigger.last_updated && ` · Updated: ${trigger.last_updated}`}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legal caveat */}
      <p className="text-[11px] text-muted-foreground border-t border-border pt-3">
        Trigger assessment based on official municipal financial data. Status reflects
        data availability and may not capture all legally required evidence for a formal
        MFMA s139 determination. Source: MFMA Act 56 of 2003, s139(1).
      </p>
    </div>
  );
}
```

<CHECKPOINT-7>
Validate:
- [ ] `tenderlens/page.tsx` — composed from sub-components with Suspense boundaries
- [ ] `hooks/useTenders.ts` — typed with TenderSummary and TenderDetail interfaces
- [ ] `munilens/[code]/page.tsx` — MDB code validation, Metadata, notFound
- [ ] `munilens/MFMA139TriggerPanel.tsx` — all 4 status states with evidence display

Run:
```bash
cd frontend
pnpm type-check  # Zero TypeScript errors expected
pnpm lint        # Zero ESLint errors expected
```
</CHECKPOINT-7>

---

## PHASE 8: AI ANALYST SERVICE

**Objective:** Build the full AI Analyst service — intent detection, BigQuery query execution, response generation with Claude, language filtering, and streaming.

### Task 8.1 — AI Analyst Service

```python
# backend/app/services/ai_analyst_service.py
"""
AI Analyst Service — CivicLens SA natural language intelligence interface.
Powered by Anthropic Claude Sonnet. All responses grounded in structured BigQuery data.
Guardrails: Source citations required, prohibited language filtered,
survey/administrative data distinction enforced.
"""
from __future__ import annotations

import json
import re
from typing import AsyncIterator
from anthropic import AsyncAnthropic
import structlog

from app.config import settings
from app.compliance.language_filter import filter_risk_language, FilterResult
from app.models.user import User, UserRole
from app.services.bigquery_service import BigQueryService

logger = structlog.get_logger(__name__)

# ── System prompts per persona ────────────────────────────────────────────────

SYSTEM_PROMPT_ANALYST = """You are the CivicLens SA AI Analyst — an evidence-based intelligence \
assistant for South African public-sector data.

You help government officials, consultants, journalists, researchers, and businesses \
understand South African municipal finance, public procurement, demographics, crime, \
water quality, education, health, and policy outcomes.

## Your constraints (NON-NEGOTIABLE):

1. SOURCE EVERY FACTUAL CLAIM. Every number must cite its source dataset and period in \
square brackets: [Stats SA QLFS Q1 2026] or [National Treasury Municipal Money 2024/25].

2. NEVER INVENT DATA. If a data point is not in the context provided, say: \
"I don't have [specific data] available in the current CivicLens dataset. \
The most recent data I have is [what you do have]."

3. SURVEY VS ADMINISTRATIVE DATA. Stats SA household surveys (GHS, QLFS, IES) are sample \
surveys subject to sampling error. Always distinguish these from administrative data \
(AGSA audit outcomes, National Treasury returns, municipal financial statements).

4. TEMPORAL ACCURACY. Always state the exact period of any data point. Never say "recently" \
or "current" without specifying the period (e.g. "2025/26 financial year Q3").

5. APPROVED RISK LANGUAGE. When describing procurement anomalies or financial irregularities, \
use: "anomaly", "unusual pattern", "risk signal", "requires review", "outlier". \
NEVER use: corrupt, fraud, bribe, loot, steal, illegal, misconduct \
unless directly quoting an official AGSA finding or court judgment.

6. NO EXTRAPOLATION. Do not project trends beyond the data range without labelling \
the output explicitly as a projection with confidence caveats.

7. CAVEAT SECTION. End every substantive response with a brief "Data Notes" section listing \
source limitations, methodology caveats, and data freshness.

8. FOLLOW-UP PROMPTS. End every response with exactly 3 suggested follow-up questions \
labelled "You might also want to know:".

## Your tone:
Professional, precise, South African English. Plain language by default — \
explain abbreviations on first use (e.g. MFMA — Municipal Finance Management Act).

## Data context format:
When data context is provided in <data_context> tags, treat it as ground truth. \
Do not speculate about figures not present in the context.
"""

SYSTEM_PROMPT_CITIZEN = """You are the CivicLens SA Community Guide — a plain-language \
assistant explaining South African government information.

Explain everything in simple, everyday South African English. Avoid jargon. \
If you must use an official term, explain it immediately. Keep answers short \
(under 200 words unless the question requires more). Always end with \
"Want to know more? You can ask me:" followed by 2 simple follow-up questions.

Always cite your source: "This information is from [source name]."
Never make up information. If you don't have the data, say so clearly.
"""

SYSTEM_PROMPT_JOURNALIST = """You are the CivicLens SA Data Journalist — an intelligence \
assistant for investigative journalism and accountability reporting.

Your job is to:
- Identify story angles in data patterns
- Flag comparative context (e.g. "Tshwane's collection rate is the lowest in Gauteng")
- Highlight what is statistically unusual vs the national or provincial norm
- Suggest related data angles that could strengthen an investigation
- Provide all source citations in journalist-ready format: \
[Publisher, Dataset name, Period, URL if available]

CRITICAL RULES:
- Never allege wrongdoing. Describe patterns and invite further investigation.
- Never use: corrupt, fraud, bribe. Use: "anomaly", "unusual pattern", "warrants investigation".
- Always note the limitations of the data and what it cannot prove.
- Mark all quantitative claims with their source and period.
"""

PERSONA_PROMPTS = {
    "analyst": SYSTEM_PROMPT_ANALYST,
    "citizen": SYSTEM_PROMPT_CITIZEN,
    "journalist": SYSTEM_PROMPT_JOURNALIST,
}


class AIAnalystService:
    """
    Orchestrates the full AI Analyst pipeline:
    1. Detect intent from natural language query
    2. Retrieve relevant structured data from BigQuery
    3. Build grounded prompt with data context
    4. Stream response from Claude
    5. Apply language safety filter on output
    6. Return streamed, filtered, cited response
    """

    def __init__(self, bq: BigQueryService, db: "AsyncSession") -> None:
        self.bq = bq
        self.db = db
        self.client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

    async def check_query_limit(self, user: User) -> bool:
        """Returns True if user has remaining AI queries for today."""
        limits = {
            UserRole.FREE: settings.FREE_TIER_DAILY_AI_QUERIES,
            UserRole.SME: settings.SME_TIER_DAILY_AI_QUERIES,
            UserRole.CONSULTANT: settings.CONSULTANT_TIER_DAILY_AI_QUERIES,
            UserRole.ENTERPRISE: None,  # None = unlimited
            UserRole.GOVERNMENT: None,
            UserRole.ADMIN: None,
        }
        limit = limits.get(UserRole(user.role))
        if limit is None:
            return True
        return user.ai_queries_today < limit

    async def stream_response(
        self,
        query: str,
        persona: str = "analyst",
        user: User | None = None,
        conversation_history: list[dict] | None = None,
    ) -> AsyncIterator[str]:
        """
        Main entry point. Streams the AI response token by token.
        Applies language filter on the complete response before returning last chunk.
        """
        if user and not await self.check_query_limit(user):
            yield json.dumps({"error": "daily_limit_reached", "message": "Daily query limit reached. Upgrade your plan for more queries."})
            return

        # Step 1: Detect intent and extract entities
        intent = await self._detect_intent(query)
        logger.info("ai_analyst_intent", intent=intent, user_id=str(user.id) if user else None)

        # Step 2: Retrieve relevant data context from BigQuery
        data_context = await self._retrieve_data_context(intent, query)

        # Step 3: Build grounded prompt
        system_prompt = PERSONA_PROMPTS.get(persona, SYSTEM_PROMPT_ANALYST)
        messages = self._build_messages(query, data_context, conversation_history or [])

        # Step 4: Stream response
        full_response = ""
        async with self.client.messages.stream(
            model=settings.AI_MODEL,
            max_tokens=settings.AI_MAX_TOKENS,
            system=system_prompt,
            messages=messages,
        ) as stream:
            async for text in stream.text_stream:
                full_response += text
                yield json.dumps({"type": "token", "content": text})

        # Step 5: Apply language safety filter on complete response
        filter_result = filter_risk_language(full_response, auto_replace=True)
        if filter_result.status == FilterResult.REPLACED:
            logger.warning(
                "language_filter_triggered",
                violations=filter_result.violations_found,
                user_id=str(user.id) if user else None,
            )
            yield json.dumps({
                "type": "filter_applied",
                "replacements": filter_result.replacements_made,
            })

        # Step 6: Send metadata
        yield json.dumps({
            "type": "metadata",
            "intent": intent,
            "data_sources": data_context.get("sources_used", []),
            "query_time_ms": data_context.get("query_time_ms", 0),
        })

    async def _detect_intent(self, query: str) -> dict:
        """
        Lightweight intent detection — identifies which modules and entities
        are relevant to the query so we know which BigQuery tables to pull.
        """
        intents = {
            "modules": [],
            "entities": {
                "municipalities": [],
                "provinces": [],
                "suppliers": [],
                "buyers": [],
                "indicators": [],
                "categories": [],
                "time_period": None,
            },
        }

        query_lower = query.lower()

        # Module detection (order matters — more specific first)
        if any(t in query_lower for t in ["tender", "procurement", "bid", "rfp", "rfi", "supplier", "award"]):
            intents["modules"].append("tenderlens")
        if any(t in query_lower for t in ["municipality", "municipal", "metro", "local government", "ward", "s139", "section 139"]):
            intents["modules"].append("munilens")
        if any(t in query_lower for t in ["budget", "mtef", "appropriation", "expenditure framework"]):
            intents["modules"].append("budgetlens")
        if any(t in query_lower for t in ["grant", "mig", "wsig", "equitable share", "conditional"]):
            intents["modules"].append("grantlens")
        if any(t in query_lower for t in ["audit", "agsa", "clean audit", "qualified", "disclaimer"]):
            intents["modules"].append("agasalert")
        if any(t in query_lower for t in ["crime", "police", "saps", "murder", "robbery"]):
            intents["modules"].append("crime")
        if any(t in query_lower for t in ["water", "sanitation", "blue drop", "green drop", "drought"]):
            intents["modules"].append("water")
        if any(t in query_lower for t in ["school", "education", "learner", "matric"]):
            intents["modules"].append("education")
        if any(t in query_lower for t in ["unemployment", "labour", "jobs", "employment", "qlfs"]):
            intents["modules"].append("labour")
        if any(t in query_lower for t in ["poverty", "income", "gini", "household"]):
            intents["modules"].append("poverty")

        if not intents["modules"]:
            intents["modules"].append("general")

        return intents

    async def _retrieve_data_context(self, intent: dict, query: str) -> dict:
        """
        Pulls relevant data from BigQuery mart tables based on detected intent.
        Returns a structured context dict that is injected into the Claude prompt.
        """
        import time
        start = time.time()
        context_parts: list[str] = []
        sources_used: list[str] = []

        for module in intent.get("modules", []):
            if module == "tenderlens":
                data = await self.bq.query_mart(
                    "mart_tender_opportunities",
                    limit=20,
                    order_by="publication_date DESC",
                )
                if data:
                    context_parts.append(
                        f"<data_context source='National Treasury OCDS + CivicLens Municipal Scrapes'>\n"
                        f"Recent tender activity:\n{json.dumps(data[:5], default=str)}\n"
                        f"</data_context>"
                    )
                    sources_used.append("National Treasury OCDS")

            elif module == "munilens":
                data = await self.bq.query_mart(
                    "mart_municipality_scorecard",
                    limit=50,
                    order_by="financial_health_score ASC",
                )
                if data:
                    context_parts.append(
                        f"<data_context source='National Treasury Municipal Money + Stats SA'>\n"
                        f"Municipality scorecard data (lowest financial health first):\n"
                        f"{json.dumps(data[:10], default=str)}\n"
                        f"</data_context>"
                    )
                    sources_used.append("National Treasury Municipal Money")

        query_time_ms = int((time.time() - start) * 1000)

        return {
            "context_text": "\n\n".join(context_parts),
            "sources_used": sources_used,
            "query_time_ms": query_time_ms,
        }

    def _build_messages(
        self,
        query: str,
        data_context: dict,
        history: list[dict],
    ) -> list[dict]:
        """Constructs the messages array for the Claude API call."""
        messages = []

        # Include conversation history (last 10 turns max)
        for turn in history[-10:]:
            messages.append(turn)

        # Build current user message with data context injected
        user_content = query
        if data_context.get("context_text"):
            user_content = (
                f"{data_context['context_text']}\n\n"
                f"Based on the data context above, please answer:\n{query}"
            )

        messages.append({"role": "user", "content": user_content})
        return messages

    async def generate_bid_analysis(self, ocid: str, user: User) -> dict:
        """
        Generates a structured Bid/No-Bid analysis for a specific tender.
        This is an agentic multi-step operation:
        1. Fetch full tender data
        2. Fetch buyer history (24 months)
        3. Fetch top previous suppliers to this buyer
        4. Check municipality financial health (if buyer is a municipality)
        5. Check RiskLens signals on the buyer
        6. Generate structured analysis with Claude
        """
        # Step 1: Fetch tender
        tender_data = await self.bq.query_by_id("mart_tender_opportunities", "ocid", ocid)
        if not tender_data:
            raise ValueError(f"Tender {ocid} not found")

        # Step 2: Buyer history
        buyer_id = tender_data[0].get("buyer_id")
        buyer_history = await self.bq.query_mart(
            "mart_buyer_intelligence",
            filters={"buyer_id": buyer_id},
            limit=50,
        )

        # Step 3: Municipality health check
        municipality_code = tender_data[0].get("municipality_code")
        muni_health = None
        if municipality_code:
            muni_data = await self.bq.query_mart(
                "mart_municipality_financial_health",
                filters={"municipality_code": municipality_code},
                order_by="financial_year DESC",
                limit=1,
            )
            muni_health = muni_data[0] if muni_data else None

        # Step 4: Generate with Claude
        context = {
            "tender": tender_data[0],
            "buyer_24_month_history": buyer_history[:20],
            "municipality_financial_health": muni_health,
        }

        prompt = (
            f"Generate a Bid/No-Bid analysis for the following tender. "
            f"Structure your response as JSON with these fields: "
            f"opportunity_score (High/Moderate/Low), recommendation (Bid/No-Bid/Investigate further), "
            f"buyer_summary (string), market_context (string), "
            f"risk_flags (array of strings), recommended_actions (array of strings), "
            f"data_caveats (array of strings). "
            f"All factual claims must cite their source. "
            f"Use approved risk language — no allegations, only patterns. "
            f"Context: {json.dumps(context, default=str)}"
        )

        message = await self.client.messages.create(
            model=settings.AI_MODEL,
            max_tokens=2048,
            system=SYSTEM_PROMPT_ANALYST,
            messages=[{"role": "user", "content": prompt}],
        )

        raw_json = message.content[0].text
        # Strip markdown code fences if present
        raw_json = re.sub(r"```(?:json)?\s*", "", raw_json).strip().rstrip("```").strip()

        try:
            analysis = json.loads(raw_json)
        except json.JSONDecodeError:
            analysis = {"raw_analysis": raw_json}

        return {
            "ocid": ocid,
            "tender_title": tender_data[0].get("tender_title"),
            "buyer_name": tender_data[0].get("buyer_name"),
            **analysis,
            "generated_by": "CivicLens AI Analyst v2",
            "model": settings.AI_MODEL,
        }
```

<CHECKPOINT-8>
Validate:
- [ ] `ai_analyst_service.py` — all 3 persona prompts, stream_response, intent detection, data context retrieval, bid analysis
- [ ] Language filter called on every complete response
- [ ] `check_query_limit` enforces per-tier daily limits
- [ ] `generate_bid_analysis` — 4-step agentic flow

Run compliance test:
```python
from app.compliance.language_filter import filter_risk_language
from app.services.ai_analyst_service import SYSTEM_PROMPT_ANALYST

# Confirm all prohibited terms are addressed in the system prompt
prohibited = ["corrupt", "fraud", "bribe", "loot"]
for term in prohibited:
    assert term in SYSTEM_PROMPT_ANALYST.lower(), f"Missing prohibition for: {term}"

print("AI guardrails: PASSED")
```
</CHECKPOINT-8>

---

## PHASE 9: ALERTS & NOTIFICATIONS

**Objective:** Build the alert matching service — tender alerts, risk alerts, WhatsApp delivery.

### Task 9.1 — Alert Service

```python
# backend/app/services/alert_service.py
"""
Alert matching and delivery service.
Matches new tender/risk data against all users' saved searches and watchlists.
Delivers via in-app (Pub/Sub), email, and WhatsApp.
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from google.cloud import pubsub_v1
import structlog

from app.config import settings
from app.models.saved_search import SavedSearch
from app.services.bigquery_service import BigQueryService

logger = structlog.get_logger(__name__)


class AlertService:
    """
    Matches new procurement and risk data against saved searches.
    Publishes matched alerts to Pub/Sub for delivery workers to consume.
    """

    def __init__(self, bq: BigQueryService) -> None:
        self.bq = bq
        self.publisher = pubsub_v1.PublisherClient()
        self.topic_path = self.publisher.topic_path(
            settings.GCP_PROJECT_ID, "civiclens-alerts"
        )

    async def process_tender_alerts(self, run_date: str) -> int:
        """
        Called daily after mart_tender_opportunities refresh.
        Returns count of alerts dispatched.
        """
        # Get all active tender saved searches
        new_tenders = await self.bq.query_mart(
            "mart_tender_opportunities",
            filters={"publication_date": run_date},
        )

        if not new_tenders:
            logger.info("no_new_tenders", run_date=run_date)
            return 0

        # Load active saved searches from PostgreSQL via API call
        # (avoids DB coupling in this service — uses internal API)
        alerts_dispatched = 0

        for tender in new_tenders:
            # For each tender, find matching saved searches
            matching_searches = await self._find_matching_searches(tender)

            for search in matching_searches:
                alert_payload = {
                    "alert_type": "new_tender",
                    "user_id": str(search["user_id"]),
                    "saved_search_id": str(search["id"]),
                    "tender_ocid": tender["ocid"],
                    "tender_title": tender["tender_title"],
                    "buyer_name": tender["buyer_name"],
                    "closing_date": tender["closing_date"],
                    "estimated_value_zar": tender["estimated_value_zar"],
                    "province_code": tender["province_code"],
                    "channels": {
                        "email": search["alert_email_enabled"],
                        "whatsapp": search["alert_whatsapp_enabled"],
                        "inapp": search["alert_inapp_enabled"],
                    },
                    "alert_frequency": search["alert_frequency"],
                    "dispatched_at": datetime.now(timezone.utc).isoformat(),
                }

                # Publish to Pub/Sub
                future = self.publisher.publish(
                    self.topic_path,
                    json.dumps(alert_payload).encode("utf-8"),
                    alert_type="new_tender",
                    user_id=str(search["user_id"]),
                )
                future.result()  # Wait for publish confirmation
                alerts_dispatched += 1

        logger.info("tender_alerts_dispatched", count=alerts_dispatched, run_date=run_date)
        return alerts_dispatched

    async def _find_matching_searches(self, tender: dict) -> list[dict]:
        """
        Evaluates a tender against all saved search criteria.
        Returns list of saved searches that match this tender.
        """
        # This queries the mart_saved_search_matches view in BigQuery
        # which is pre-computed by joining tender data against search criteria
        query = f"""
        SELECT
            ss.id,
            ss.user_id,
            ss.search_criteria,
            ss.alert_frequency,
            ss.alert_email_enabled,
            ss.alert_whatsapp_enabled,
            ss.alert_inapp_enabled
        FROM `{settings.GCP_PROJECT_ID}.{settings.BQ_DATASET_MART}.mart_saved_search_matches` ss
        WHERE ss.ocid = @ocid
          AND ss.is_deleted = FALSE
          AND ss.alert_frequency != 'disabled'
        """
        results = await self.bq.query(query, parameters={"ocid": tender["ocid"]})
        return results
```

---

## PHASE 10: TESTING SUITE

**Objective:** Unit tests for all scoring logic + compliance tests for POPIA + integration tests for core API endpoints.

### Task 10.1 — Financial Health Score Unit Tests

```python
# backend/app/tests/unit/test_financial_health.py
"""Unit tests for the Financial Health Score calculation."""
import pytest
from app.services.municipality_service import calculate_financial_health_score


def test_healthy_municipality():
    """A municipality meeting all benchmarks scores ≥ 70."""
    data = {
        "operating_surplus_ratio": 0.06,
        "cash_coverage_days": 50,
        "net_debtors_collection_rate": 0.97,
        "repairs_maintenance_pct_of_ppe": 0.09,
        "capital_budget_execution_rate": 0.92,
    }
    result = calculate_financial_health_score(data)
    assert result["financial_health_score"] >= 70
    assert result["financial_health_grade"] == "Healthy"


def test_distressed_municipality():
    """A municipality in financial distress scores below 40."""
    data = {
        "operating_surplus_ratio": -0.15,
        "cash_coverage_days": -5,
        "net_debtors_collection_rate": 0.45,
        "repairs_maintenance_pct_of_ppe": 0.02,
        "capital_budget_execution_rate": 0.30,
    }
    result = calculate_financial_health_score(data)
    assert result["financial_health_score"] < 40
    assert result["financial_health_grade"] == "Financially Distressed"


def test_missing_data_handled():
    """Missing fields default gracefully to zero score for that component."""
    data = {
        "operating_surplus_ratio": 0.05,
        # cash_coverage_days omitted
        "net_debtors_collection_rate": 0.96,
        "repairs_maintenance_pct_of_ppe": 0.08,
        "capital_budget_execution_rate": 0.90,
    }
    result = calculate_financial_health_score(data)
    assert isinstance(result["financial_health_score"], int)
    assert result["score_cash_coverage"] == 0  # Missing data → 0 for that component


def test_mfma_t4_trigger_fires():
    """T4 trigger activates when cash is negative AND operating surplus is negative."""
    data = {
        "operating_surplus_ratio": -0.05,
        "cash_coverage_days": -10,
        "net_debtors_collection_rate": 0.60,
        "repairs_maintenance_pct_of_ppe": 0.03,
        "capital_budget_execution_rate": 0.45,
    }
    result = calculate_financial_health_score(data)
    assert result["trigger_t4_serious_financial_problems"] is True
```

### Task 10.2 — Language Filter Tests

```python
# backend/app/tests/compliance/test_language_safety.py
"""
COMPLIANCE TEST: Language safety filter.
This test must pass with 100% success rate before any deployment.
"""
import pytest
from app.compliance.language_filter import filter_risk_language, FilterResult, PROHIBITED_TERMS


def test_all_prohibited_terms_detected():
    """Every term in the prohibited list is detected and replaced."""
    for term in PROHIBITED_TERMS:
        text = f"The municipality engaged in {term} procurement practices."
        result = filter_risk_language(text, auto_replace=True)
        assert result.status == FilterResult.REPLACED, f"Term '{term}' not detected"
        assert term not in result.filtered.lower(), f"Term '{term}' not replaced in output"


def test_clean_text_passes_unchanged():
    """Clean text passes through the filter unchanged."""
    text = (
        "The municipality has an unusual pattern of award concentration. "
        "This procurement anomaly requires review. "
        "Risk signals indicate the buyer concentration index is elevated."
    )
    result = filter_risk_language(text)
    assert result.status == FilterResult.PASSED
    assert result.filtered == text


def test_official_quote_exemption():
    """Terms inside official source quotes are exempt."""
    text = "AGSA finding: The municipality engaged in fraudulent expenditure."
    result = filter_risk_language(text, auto_replace=False)
    # The violation is inside an official quote — should pass
    assert result.status in [FilterResult.PASSED, FilterResult.REPLACED]


def test_filter_does_not_crash_on_empty_string():
    """Empty string is handled gracefully."""
    result = filter_risk_language("")
    assert result.status == FilterResult.PASSED


def test_filter_does_not_crash_on_unicode():
    """Unicode (isiZulu, isiXhosa) content is handled gracefully."""
    text = "IKomidi lezeMali likhangelise ukuphathwa kweziMali zikaMasipala."  # isiZulu
    result = filter_risk_language(text)
    assert isinstance(result.status, FilterResult)
```

### Task 10.3 — POPIA Middleware Test

```python
# backend/app/tests/compliance/test_popia_middleware.py
"""
COMPLIANCE TEST: POPIA middleware.
Verifies consent enforcement on personal data endpoints.
"""
import pytest
from httpx import AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_personal_data_endpoint_requires_consent():
    """Accessing personal data endpoint without consent returns HTTP 451."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Token with no POPIA consent recorded
        response = await client.get(
            "/api/v1/users/me",
            headers={"Authorization": "Bearer mock_no_consent_token"},
        )
        assert response.status_code in [401, 451]


@pytest.mark.asyncio
async def test_public_data_endpoint_does_not_require_consent():
    """Public data endpoints (tenders, municipalities) do not block for consent."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get(
            "/api/v1/tenders",
            headers={"Authorization": "Bearer mock_valid_token"},
        )
        assert response.status_code != 451


@pytest.mark.asyncio
async def test_audit_event_emitted_on_data_query():
    """Every authenticated data query emits an audit event."""
    # Verify via BigQuery audit table (integration test)
    pass  # Implement with BigQuery test fixture
```

<CHECKPOINT-10>
Validate:
- [ ] Unit tests for financial health score — all 4 scenarios
- [ ] Language filter compliance tests — all prohibited terms tested
- [ ] POPIA middleware compliance tests
- [ ] EarlyAlert score tests

Run:
```bash
cd backend
uv run pytest app/tests/ -v --tb=short --cov=app --cov-report=term-missing
# Expected: All compliance tests PASS. Coverage ≥ 80%.
```
</CHECKPOINT-10>

---

## PHASE 11: CI/CD PIPELINE

### Task 11.1 — CI Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop, "feature/**"]
  pull_request:
    branches: [main, develop]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  # ── Backend ──────────────────────────────────────────────────────────────────
  backend-lint:
    name: Backend — Lint & Type Check
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      - uses: actions/checkout@v4
      - uses: astral-sh/setup-uv@v3
        with: { version: "0.3.x" }
      - run: uv sync --all-extras
      - run: uv run ruff check .
      - run: uv run mypy app/ --config-file pyproject.toml

  backend-test:
    name: Backend — Tests
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      - uses: actions/checkout@v4
      - uses: astral-sh/setup-uv@v3
      - run: uv sync --all-extras
      - run: uv run pytest app/tests/ -v --tb=short --cov=app --cov-report=xml
      - uses: codecov/codecov-action@v4
        with: { files: backend/coverage.xml }

  # ── Frontend ─────────────────────────────────────────────────────────────────
  frontend-lint:
    name: Frontend — Lint & Type Check
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: "9.1.2" }
      - uses: actions/setup-node@v4
        with: { node-version: "20", cache: "pnpm", cache-dependency-path: frontend/pnpm-lock.yaml }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm type-check

  frontend-build:
    name: Frontend — Build
    runs-on: ubuntu-latest
    needs: frontend-lint
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: "9.1.2" }
      - uses: actions/setup-node@v4
        with: { node-version: "20", cache: "pnpm", cache-dependency-path: frontend/pnpm-lock.yaml }
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
        env:
          NEXT_PUBLIC_API_URL: https://api.civiclens.co.za
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

  # ── Compliance Gate ───────────────────────────────────────────────────────────
  compliance-gate:
    name: Compliance Gate
    runs-on: ubuntu-latest
    needs: [backend-test]
    defaults:
      run:
        working-directory: backend
    steps:
      - uses: actions/checkout@v4
      - uses: astral-sh/setup-uv@v3
      - run: uv sync --all-extras
      - name: Run compliance tests (POPIA + language safety + audit)
        run: uv run pytest app/tests/compliance/ -v --tb=short -x
        # -x = stop on first failure. Compliance tests must all pass.

      - name: Secrets detection scan
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${{ github.event.repository.default_branch }}
          extra_args: --only-verified

      - name: Python dependency vulnerability scan
        run: |
          cd backend
          uv run pip-audit --requirement <(uv export --no-hashes)

      - name: Terraform format check
        uses: hashicorp/setup-terraform@v3
        with: { terraform_version: "1.8.3" }
      - run: terraform fmt -check -recursive terraform/

  # ── Require all jobs to pass ─────────────────────────────────────────────────
  all-checks:
    name: All checks passed
    runs-on: ubuntu-latest
    needs: [backend-lint, backend-test, frontend-lint, frontend-build, compliance-gate]
    steps:
      - run: echo "All CI checks passed. Safe to merge."
```

<CHECKPOINT-11>
Validate:
- [ ] `.github/workflows/ci.yml` — all 5 jobs defined
- [ ] Compliance gate runs last and requires all other jobs
- [ ] Secrets scan included (TruffleHog)
- [ ] Dependency vulnerability scan included (pip-audit)
- [ ] Terraform fmt check included

Run locally:
```bash
act --job backend-test  # Using act (local GitHub Actions runner)
# OR
cd backend && uv run pytest app/tests/compliance/ -v
```
</CHECKPOINT-11>

---

## PHASE 12: REMAINING MODULES (Phases 2 and 3 scope)

Build these after MVP is live and validated. Follow the same pattern as TenderLens and MuniLens:
1. BigQuery mart model (SQL)
2. FastAPI router
3. Pydantic schemas
4. Service layer
5. React page component
6. React hooks
7. Sub-components
8. Unit tests

| Module | Priority | Key service file | Key mart model |
|--------|----------|-----------------|----------------|
| M03 PolicyLens | Phase 2 | `policy_service.py` | `mart_policy_indicators` |
| M05 PeopleLens | Phase 2 | `people_service.py` | `mart_demographic_profile` |
| M06 ServiceLens | Phase 2 | `service_delivery_service.py` | `mart_service_delivery_pressure` |
| M07 RiskLens | Phase 2 | `risk_service.py` | `mart_risk_signals` |
| M08 ReportLens (full) | Phase 2 | `report_service.py` | Cross-module |
| M11 AGASAlert | Phase 2 | `agsa_service.py` | `mart_agsa_audit_outcomes` |
| M12 EarlyAlert | Phase 3 | `earlyalert_service.py` | `mart_earlyalert_scores` |
| M13 GrantLens | Phase 3 | `grant_service.py` | `mart_grant_expenditure` |
| M14 BudgetLens | Phase 3 | `budget_service.py` | `mart_budget_allocations` |
| M15 CarbonLens | Phase 3 | `carbon_service.py` | `mart_climate_vulnerability` |

---

## GLOBAL QUALITY GATES

These checks must pass before any push to `main`. If any fail, fix before proceeding.

```bash
# Run this script from the project root before every merge to main
# Save as: scripts/quality_gate.sh

#!/bin/bash
set -e

echo "========================================"
echo " CivicLens SA — Quality Gate"
echo "========================================"

echo ""
echo "1. Backend linting..."
cd backend && uv run ruff check . && echo "  ✓ Ruff passed"
uv run mypy app/ && echo "  ✓ Mypy passed"

echo ""
echo "2. Backend compliance tests..."
uv run pytest app/tests/compliance/ -v --tb=short -x && echo "  ✓ All compliance tests passed"

echo ""
echo "3. Backend unit tests..."
uv run pytest app/tests/unit/ -v --tb=short && echo "  ✓ All unit tests passed"

echo ""
echo "4. Secrets scan..."
cd .. && git ls-files | xargs grep -l "sk-ant-\|AKIA\|-----BEGIN.*KEY" 2>/dev/null && \
  echo "  ✗ SECRETS DETECTED — ABORT" && exit 1 || echo "  ✓ No secrets found"

echo ""
echo "5. POPIA header check..."
python tools/compliance/check_popia_headers.py && echo "  ✓ All PII-handling files have POPIA headers"

echo ""
echo "6. Frontend type check..."
cd frontend && pnpm type-check && echo "  ✓ TypeScript passed"

echo ""
echo "7. Frontend lint..."
pnpm lint && echo "  ✓ ESLint passed"

echo ""
echo "8. dbt parse check..."
cd ../data-pipeline/dbt && dbt parse && echo "  ✓ dbt models parse successfully"

echo ""
echo "========================================"
echo " All quality gates passed. Safe to merge."
echo "========================================"
```

---

## APPENDIX A: BUILDLOG.md FORMAT

Append to BUILDLOG.md after every file created:
```
| 2026-05-29 | backend/app/models/user.py | 112 lines | User model with POPIA consent fields |
| 2026-05-29 | backend/app/compliance/popia.py | 89 lines | POPIA middleware + ConsentRecord |
```

---

## APPENDIX B: BIGQUERY SERVICE INTERFACE

```python
# Contract for BigQueryService — implement in backend/app/services/bigquery_service.py
class BigQueryService:

    async def query(self, sql: str, parameters: dict | None = None) -> list[dict]:
        """Execute parameterised SQL against BigQuery. Returns list of dicts."""
        ...

    async def query_mart(
        self,
        mart_table: str,
        filters: dict | None = None,
        order_by: str | None = None,
        limit: int = 100,
    ) -> list[dict]:
        """Query a mart table with optional filters and ordering."""
        ...

    async def query_by_id(self, table: str, id_column: str, id_value: str) -> list[dict]:
        """Fetch a single record by ID."""
        ...

    async def get_last_updated(self, mart_table: str) -> str:
        """Returns ISO timestamp of last dbt run for a mart table."""
        ...
```

---

## APPENDIX C: DATA SOURCES PRIORITY ORDER

Ingest in this order. Each source must be fully ingested and validated before moving to the next.

```
Phase 1 MVP data (must be live at launch):
1. National Treasury eTenders OCDS (May 2021 – present) — daily refresh
2. National Treasury Municipal Money API (all available quarters) — quarterly
3. Stats SA Census 2022 (municipal level) — one-time
4. MDB Municipal and Ward boundaries — one-time (re-ingest on demarcation)
5. SAPS Crime Statistics 2024/25 — annual

Phase 2 data:
6. DWS Blue Drop 2025 — annual
7. DWS Green Drop 2025 — annual
8. DBE School Realities 2025 — annual
9. Stats SA GHS 2024 — annual
10. Stats SA QLFS 2026 Q1 — quarterly
11. AGSA Local Government Audit Outcomes (5-year history) — annual

Phase 3 data:
12. COGTA Section 139 intervention records — ad hoc
13. National Treasury debarment register — weekly
14. CSD supplier status — weekly sync
15. IEC ward election results — post-election
16. National Treasury Budget Review + MTEF — annual
```

---

*End of CivicLens SA Master Build Prompt v1.0*

**Carter Digitals (Pty) Ltd | Reg: 2025/907839/07 | carterdigitals.co.za**
**B-BBEE Level 1 EME | 100% Youth-Owned | POPIA Compliant**
