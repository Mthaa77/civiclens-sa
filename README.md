# CivicLens SA

**The Intelligence Layer for South Africa's Public Sector**

A premium civic data analytics platform providing real-time intelligence on South Africa's 257 municipalities, procurement processes, service delivery, and governance.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwind-css)
![VLM Rating](https://img.shields.io/badge/VLM_Quality-8.5%2F10-brightgreen)

## Overview

CivicLens SA is a comprehensive public-sector intelligence platform featuring 16+ interactive modules with premium dark-themed UI, glass morphism effects, and responsive design optimized for both mobile and desktop devices.

## Modules

### Core Intelligence (MVP)
| Module | Description |
|--------|-------------|
| **Command Centre** | National dashboard with KPIs, charts, risk signals, and live activity feed |
| **TenderLens** | AI-powered procurement intelligence with bid recommendations |
| **MuniLens** | Definitive municipality profiles with 8-tab deep analysis |
| **GeoLens** | Interactive SVG choropleth map of SA's 9 provinces |
| **AI Analyst** | Natural language intelligence interface with 4 persona modes |
| **RiskLens** | Procurement and municipal anomaly detection |

### Phase 2
| Module | Description |
|--------|-------------|
| **ElectionLens** | 2026 LGE ward accountability intelligence |
| **ReportLens** | Professional report generator with templates |
| **PolicyLens** | Evidence-based policy intelligence with impact scoring |
| **PeopleLens** | Population demographics and market sizing |
| **ServiceLens** | Service delivery pressure scoring (Blue/Green Drop) |
| **AGASAlert** | Auditor-General audit outcome intelligence |
| **EarlyAlert** | Section 139 intervention risk prediction |

### Phase 3
| Module | Description |
|--------|-------------|
| **BudgetLens** | National budget intelligence and MTEF analysis |
| **GrantLens** | Conditional grant tracking and opportunity matching |
| **CarbonLens** | Climate vulnerability and dam level monitoring |
| **DataHub** | Dataset catalogue, quality metrics, and API documentation |

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Charts**: Recharts (Bar, Line, Pie, Radar, Area)
- **Animations**: Framer Motion
- **State Management**: Zustand + TanStack Query
- **Database**: Prisma ORM (SQLite)
- **AI**: z-ai-web-dev-sdk (LLM, VLM, Image Generation)
- **Auth**: NextAuth.js v4

## Features

- Premium dark-themed UI with glass morphism effects
- Fully responsive design (mobile + desktop)
- Interactive SVG choropleth map
- AI-powered chat with 4 persona modes
- Animated data visualizations with Framer Motion
- Real-time activity feed and risk monitoring
- Command palette (Ctrl+K) for quick navigation
- POPIA-compliant data handling

## Getting Started

```bash
# Install dependencies
bun install

# Set up database
bun run db:push

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## License

MIT
