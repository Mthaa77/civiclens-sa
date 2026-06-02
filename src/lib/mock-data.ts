// CivicLens SA — Mock Data for Development
// Realistic South African government data for all modules

import type { Municipality, Tender, Supplier, RiskSignal, Indicator, WardProfile, ModuleDef } from '@/types';

// ─── MODULE DEFINITIONS ───────────────────────────────────────────────────────

export const MODULES: ModuleDef[] = [
  { id: 'dashboard', name: 'Command Centre', shortName: 'Dashboard', description: 'National intelligence overview', icon: 'LayoutDashboard', phase: 'MVP', color: '#0077B6' },
  { id: 'tenderlens', name: 'TenderLens', shortName: 'Tenders', description: 'Procurement intelligence — search, supplier profiles, buyer analytics', icon: 'FileSearch', phase: 'MVP', color: '#2D6A4F' },
  { id: 'munilens', name: 'MuniLens', shortName: 'Municipalities', description: 'Municipality profiles — finance, demographics, services, risk', icon: 'Building2', phase: 'MVP', color: '#7B2D8E' },
  { id: 'geolens', name: 'GeoLens', shortName: 'Maps', description: 'Spatial intelligence — interactive choropleth maps', icon: 'Map', phase: 'MVP', color: '#B45309' },
  { id: 'ai-analyst', name: 'AI Analyst', shortName: 'AI', description: 'Natural language interface to all platform data', icon: 'Bot', phase: 'MVP', color: '#0F766E' },
  { id: 'reportlens', name: 'ReportLens', shortName: 'Reports', description: 'Professional report generator (PDF/DOCX/PPTX)', icon: 'FileBarChart', phase: 'MVP', color: '#4338CA' },
  { id: 'risklens', name: 'RiskLens', shortName: 'Risk', description: 'Procurement and municipal anomaly detection', icon: 'ShieldAlert', phase: 'Phase 2', color: '#DC2626' },
  { id: 'electionlens', name: 'ElectionLens', shortName: 'Elections', description: '2026 LGE ward accountability intelligence', icon: 'Vote', phase: 'MVP', color: '#1D4ED8' },
  { id: 'policylens', name: 'PolicyLens', shortName: 'Policy', description: 'Evidence-based policy brief generator', icon: 'ScrollText', phase: 'Phase 2', color: '#6D28D9' },
  { id: 'peoplelens', name: 'PeopleLens', shortName: 'People', description: 'Population, poverty, labour market analytics', icon: 'Users', phase: 'Phase 2', color: '#059669' },
  { id: 'servicelens', name: 'ServiceLens', shortName: 'Services', description: 'Service delivery pressure scoring', icon: 'Droplets', phase: 'Phase 2', color: '#0891B2' },
  { id: 'agasalert', name: 'AGASAlert', shortName: 'AGSA', description: 'Auditor-General audit outcome intelligence', icon: 'ClipboardCheck', phase: 'Phase 2', color: '#CA8A04' },
  { id: 'earlyalert', name: 'EarlyAlert', shortName: 'EarlyAlert', description: 'Section 139 municipal intervention risk prediction', icon: 'AlertTriangle', phase: 'Phase 3', color: '#EA580C' },
  { id: 'grantlens', name: 'GrantLens', shortName: 'Grants', description: 'Conditional grant disbursement tracking', icon: 'HandCoins', phase: 'Phase 3', color: '#65A30D' },
  { id: 'budgetlens', name: 'BudgetLens', shortName: 'Budget', description: 'National Budget and MTEF intelligence', icon: 'Landmark', phase: 'Phase 3', color: '#9333EA' },
  { id: 'carbonlens', name: 'CarbonLens', shortName: 'Climate', description: 'Climate vulnerability and environmental risk', icon: 'Leaf', phase: 'Phase 3', color: '#16A34A' },
  { id: 'datahub', name: 'DataHub', shortName: 'Data', description: 'Dataset catalogue and developer API', icon: 'Database', phase: 'Phase 3', color: '#64748B' },
];

// ─── MUNICIPALITIES ───────────────────────────────────────────────────────────

export const MOCK_MUNICIPALITIES: Municipality[] = [
  {
    id: '1', code: 'CPT', name: 'City of Cape Town', category: 'A', province: 'Western Cape',
    district: null, population2022: 4778553, geographicAreaKm2: 2461, wardCount: 116,
    financialHealthScore: 72, serviceDeliveryScore: 25, socioEconomicIndex: 35, procurementScore: 68,
    auditOutcome: 'Unqualified', auditYear: '2023/24',
    operatingBudget: 61200000000, capitalBudget: 8900000000,
    cashCoverageDays: 89, debtorCollectionRate: 95.2,
    waterAccess: 98.5, sanitationAccess: 94.2, electricityAccess: 96.8, refuseRemoval: 92.1,
    povertyRate: 22.4, youthUnemployment: 34.1, sassaDependency: 18.2,
    section139Status: 'None', earlyAlertScore: 12, climateRiskScore: 45,
  },
  {
    id: '2', code: 'JHB', name: 'City of Johannesburg', category: 'A', province: 'Gauteng',
    district: null, population2022: 5783200, geographicAreaKm2: 1645, wardCount: 135,
    financialHealthScore: 48, serviceDeliveryScore: 42, socioEconomicIndex: 40, procurementScore: 52,
    auditOutcome: 'Qualified', auditYear: '2023/24',
    operatingBudget: 75400000000, capitalBudget: 11200000000,
    cashCoverageDays: 32, debtorCollectionRate: 78.5,
    waterAccess: 92.1, sanitationAccess: 88.5, electricityAccess: 91.3, refuseRemoval: 78.9,
    povertyRate: 31.2, youthUnemployment: 42.8, sassaDependency: 22.5,
    section139Status: 'Warning', earlyAlertScore: 55, climateRiskScore: 38,
  },
  {
    id: '3', code: 'ETH', name: 'eThekwini', category: 'A', province: 'KwaZulu-Natal',
    district: null, population2022: 3634100, geographicAreaKm2: 2297, wardCount: 110,
    financialHealthScore: 38, serviceDeliveryScore: 55, socioEconomicIndex: 52, procurementScore: 42,
    auditOutcome: 'Qualified', auditYear: '2023/24',
    operatingBudget: 52300000000, capitalBudget: 7800000000,
    cashCoverageDays: 21, debtorCollectionRate: 68.3,
    waterAccess: 85.2, sanitationAccess: 78.4, electricityAccess: 87.6, refuseRemoval: 72.5,
    povertyRate: 38.6, youthUnemployment: 48.2, sassaDependency: 28.3,
    section139Status: 'Warning', earlyAlertScore: 68, climateRiskScore: 62,
  },
  {
    id: '4', code: 'TSH', name: 'City of Tshwane', category: 'A', province: 'Gauteng',
    district: null, population2022: 3275000, geographicAreaKm2: 6298, wardCount: 107,
    financialHealthScore: 42, serviceDeliveryScore: 38, socioEconomicIndex: 33, procurementScore: 55,
    auditOutcome: 'Unqualified', auditYear: '2023/24',
    operatingBudget: 44100000000, capitalBudget: 6500000000,
    cashCoverageDays: 28, debtorCollectionRate: 82.1,
    waterAccess: 95.3, sanitationAccess: 91.2, electricityAccess: 93.7, refuseRemoval: 85.6,
    povertyRate: 25.8, youthUnemployment: 38.5, sassaDependency: 19.4,
    section139Status: 'Warning', earlyAlertScore: 48, climateRiskScore: 35,
  },
  {
    id: '5', code: 'EKU', name: 'Ekurhuleni', category: 'A', province: 'Gauteng',
    district: null, population2022: 3178000, geographicAreaKm2: 1923, wardCount: 101,
    financialHealthScore: 35, serviceDeliveryScore: 48, socioEconomicIndex: 45, procurementScore: 38,
    auditOutcome: 'Disclaimer', auditYear: '2023/24',
    operatingBudget: 38900000000, capitalBudget: 5600000000,
    cashCoverageDays: 15, debtorCollectionRate: 62.4,
    waterAccess: 88.7, sanitationAccess: 82.1, electricityAccess: 89.5, refuseRemoval: 74.3,
    povertyRate: 34.2, youthUnemployment: 45.8, sassaDependency: 25.1,
    section139Status: 'Intervention', earlyAlertScore: 78, climateRiskScore: 42,
  },
  {
    id: '6', code: 'BUF', name: 'Buffalo City', category: 'B', province: 'Eastern Cape',
    district: null, population2022: 755200, geographicAreaKm2: 2568, wardCount: 50,
    financialHealthScore: 28, serviceDeliveryScore: 62, socioEconomicIndex: 68, procurementScore: 32,
    auditOutcome: 'Qualified', auditYear: '2023/24',
    operatingBudget: 6800000000, capitalBudget: 1200000000,
    cashCoverageDays: 8, debtorCollectionRate: 52.3,
    waterAccess: 78.4, sanitationAccess: 65.2, electricityAccess: 82.1, refuseRemoval: 58.3,
    povertyRate: 48.5, youthUnemployment: 55.2, sassaDependency: 35.8,
    section139Status: 'Intervention', earlyAlertScore: 82, climateRiskScore: 55,
  },
  {
    id: '7', code: 'MAN', name: 'Mangaung', category: 'B', province: 'Free State',
    district: null, population2022: 789600, geographicAreaKm2: 6283, wardCount: 52,
    financialHealthScore: 22, serviceDeliveryScore: 68, socioEconomicIndex: 62, procurementScore: 28,
    auditOutcome: 'Disclaimer', auditYear: '2023/24',
    operatingBudget: 7200000000, capitalBudget: 980000000,
    cashCoverageDays: 5, debtorCollectionRate: 45.6,
    waterAccess: 72.3, sanitationAccess: 58.7, electricityAccess: 78.9, refuseRemoval: 52.1,
    povertyRate: 52.1, youthUnemployment: 58.4, sassaDependency: 38.2,
    section139Status: 'Intervention', earlyAlertScore: 88, climateRiskScore: 48,
  },
  {
    id: '8', code: 'NMB', name: 'Nelson Mandela Bay', category: 'B', province: 'Eastern Cape',
    district: null, population2022: 1201300, geographicAreaKm2: 1959, wardCount: 60,
    financialHealthScore: 32, serviceDeliveryScore: 55, socioEconomicIndex: 58, procurementScore: 45,
    auditOutcome: 'Qualified', auditYear: '2023/24',
    operatingBudget: 10200000000, capitalBudget: 1800000000,
    cashCoverageDays: 12, debtorCollectionRate: 58.7,
    waterAccess: 82.1, sanitationAccess: 74.5, electricityAccess: 85.3, refuseRemoval: 68.9,
    povertyRate: 42.3, youthUnemployment: 52.1, sassaDependency: 32.5,
    section139Status: 'Warning', earlyAlertScore: 72, climateRiskScore: 40,
  },
  {
    id: '9', code: 'MSU', name: 'Msunduzi', category: 'B', province: 'KwaZulu-Natal',
    district: 'Umgungundlovu', population2022: 678200, geographicAreaKm2: 649, wardCount: 37,
    financialHealthScore: 30, serviceDeliveryScore: 58, socioEconomicIndex: 55, procurementScore: 35,
    auditOutcome: 'Adverse', auditYear: '2023/24',
    operatingBudget: 6200000000, capitalBudget: 890000000,
    cashCoverageDays: 10, debtorCollectionRate: 55.2,
    waterAccess: 80.2, sanitationAccess: 72.1, electricityAccess: 83.5, refuseRemoval: 62.4,
    povertyRate: 44.8, youthUnemployment: 53.6, sassaDependency: 34.1,
    section139Status: 'Intervention', earlyAlertScore: 80, climateRiskScore: 52,
  },
  {
    id: '10', code: 'SOL', name: 'Sol Plaatje', category: 'B', province: 'Northern Cape',
    district: 'Frances Baard', population2022: 248900, geographicAreaKm2: 5185, wardCount: 24,
    financialHealthScore: 45, serviceDeliveryScore: 42, socioEconomicIndex: 48, procurementScore: 58,
    auditOutcome: 'Unqualified', auditYear: '2023/24',
    operatingBudget: 3200000000, capitalBudget: 560000000,
    cashCoverageDays: 35, debtorCollectionRate: 72.5,
    waterAccess: 90.5, sanitationAccess: 85.2, electricityAccess: 92.1, refuseRemoval: 78.4,
    povertyRate: 32.5, youthUnemployment: 42.3, sassaDependency: 24.6,
    section139Status: 'None', earlyAlertScore: 35, climateRiskScore: 68,
  },
  {
    id: '11', code: 'STE', name: 'Stellenbosch', category: 'B', province: 'Western Cape',
    district: 'Cape Winelands', population2022: 178500, geographicAreaKm2: 862, wardCount: 19,
    financialHealthScore: 82, serviceDeliveryScore: 18, socioEconomicIndex: 22, procurementScore: 75,
    auditOutcome: 'Clean', auditYear: '2023/24',
    operatingBudget: 2800000000, capitalBudget: 620000000,
    cashCoverageDays: 120, debtorCollectionRate: 97.5,
    waterAccess: 99.2, sanitationAccess: 97.8, electricityAccess: 98.5, refuseRemoval: 96.2,
    povertyRate: 15.2, youthUnemployment: 24.8, sassaDependency: 12.5,
    section139Status: 'None', earlyAlertScore: 5, climateRiskScore: 32,
  },
  {
    id: '12', code: 'RUST', name: 'Rustenburg', category: 'B', province: 'North West',
    district: 'Bojanala', population2022: 528900, geographicAreaKm2: 3542, wardCount: 32,
    financialHealthScore: 40, serviceDeliveryScore: 50, socioEconomicIndex: 45, procurementScore: 42,
    auditOutcome: 'Qualified', auditYear: '2023/24',
    operatingBudget: 5400000000, capitalBudget: 980000000,
    cashCoverageDays: 22, debtorCollectionRate: 65.8,
    waterAccess: 85.3, sanitationAccess: 78.9, electricityAccess: 88.5, refuseRemoval: 72.6,
    povertyRate: 36.2, youthUnemployment: 46.5, sassaDependency: 27.8,
    section139Status: 'Warning', earlyAlertScore: 52, climateRiskScore: 45,
  },
];

// ─── TENDERS ──────────────────────────────────────────────────────────────────

export const MOCK_TENDERS: Tender[] = [
  {
    id: '1', ocid: 'OCDS-123456-001', title: 'Provision of Water and Sanitation Infrastructure Upgrades — Phase 3',
    description: 'The City of Cape Town invites bids for the provision of water and sanitation infrastructure upgrades in Khayelitsha and Mitchell\'s Plain, including pipe replacement, pump station upgrades, and community ablution facilities.',
    status: 'Active', buyerName: 'City of Cape Town', buyerId: 'CPT', municipalityCode: 'CPT',
    category: 'Water & Sanitation', estimatedValue: 245000000, awardValue: null, currency: 'ZAR',
    publishedDate: '2026-02-15', closingDate: '2026-04-15', awardDate: null, province: 'Western Cape',
    bbbeeRequirement: 'Level 1-2', contractPeriodDays: 730,
    aiSummary: 'Major infrastructure tender from a financially healthy metro. Buyer has consistent award patterns in water sector. B-BBEE Level 1-2 required — strong alignment with supplier development goals. Closing in 6 weeks.',
    bidRecommendation: 'Consider bidding', confidenceScore: 0.78,
  },
  {
    id: '2', ocid: 'OCDS-123456-002', title: 'IT Infrastructure Modernisation and Cloud Migration Services',
    description: 'eThekwini Municipality seeks qualified IT service providers for the modernisation of legacy systems and migration of core municipal services to a cloud-based platform.',
    status: 'Active', buyerName: 'eThekwini Municipality', buyerId: 'ETH', municipalityCode: 'ETH',
    category: 'IT & Technology', estimatedValue: 185000000, awardValue: null, currency: 'ZAR',
    publishedDate: '2026-02-20', closingDate: '2026-03-30', awardDate: null, province: 'KwaZulu-Natal',
    bbbeeRequirement: 'Level 1-3', contractPeriodDays: 1095,
    aiSummary: 'High-value IT modernisation tender from eThekwini. Buyer has financial health concerns (FHS: 38/100). Previous IT tenders from this buyer have seen delays. Ensure robust milestone-based payment terms.',
    bidRecommendation: 'Bid with caution', confidenceScore: 0.62,
  },
  {
    id: '3', ocid: 'OCDS-123456-003', title: 'Construction of New Primary School — Soshanguve Block XX',
    description: 'Department of Education, Gauteng Province, invites bids for the design and construction of a new primary school facility in Soshanguve, including classrooms, admin block, sports fields, and ablution facilities.',
    status: 'Active', buyerName: 'Gauteng Department of Education', buyerId: null, municipalityCode: 'TSH',
    category: 'Education', estimatedValue: 95000000, awardValue: null, currency: 'ZAR',
    publishedDate: '2026-01-28', closingDate: '2026-03-28', awardDate: null, province: 'Gauteng',
    bbbeeRequirement: 'Level 1-4', contractPeriodDays: 540,
    aiSummary: 'Standard school construction tender from Gauteng Education. This buyer has a strong track record of timely awards and payments. Good entry point for mid-size construction firms.',
    bidRecommendation: 'Strong bid opportunity', confidenceScore: 0.85,
  },
  {
    id: '4', ocid: 'OCDS-123456-004', title: 'Supply and Installation of Solar Photovoltaic Systems — Municipal Buildings',
    description: 'Mangaung Metropolitan Municipality seeks providers for the supply, installation, and commissioning of rooftop and ground-mounted solar PV systems at 15 municipal buildings across Bloemfontein and Botshabelo.',
    status: 'Active', buyerName: 'Mangaung Metropolitan Municipality', buyerId: 'MAN', municipalityCode: 'MAN',
    category: 'Energy', estimatedValue: 78000000, awardValue: null, currency: 'ZAR',
    publishedDate: '2026-02-10', closingDate: '2026-04-10', awardDate: null, province: 'Free State',
    bbbeeRequirement: 'Level 1-2', contractPeriodDays: 365,
    aiSummary: 'Green energy tender from Mangaung, currently under Section 139 intervention. High risk — buyer has Disclaimer audit outcome and only 5 days cash coverage. Ensure advance payment terms or bank guarantees.',
    bidRecommendation: 'High risk — proceed only with guarantees', confidenceScore: 0.45,
  },
  {
    id: '5', ocid: 'OCDS-123456-005', title: 'Professional Consulting Services for Integrated Development Plan Review',
    description: 'Buffalo City Metropolitan Municipality requires professional consulting services for the review and update of its 5-year Integrated Development Plan (IDP), including community consultation facilitation.',
    status: 'Awarded', buyerName: 'Buffalo City Metropolitan Municipality', buyerId: 'BUF', municipalityCode: 'BUF',
    category: 'Professional Services', estimatedValue: 12000000, awardValue: 10500000, currency: 'ZAR',
    publishedDate: '2025-11-15', closingDate: '2025-12-20', awardDate: '2026-01-15', province: 'Eastern Cape',
    bbbeeRequirement: 'Level 1-3', contractPeriodDays: 270,
    aiSummary: 'IDP consulting tender awarded to a Level 1 B-BBEE firm. Award was 12.5% below estimate, indicating competitive bidding. Buyer has moderate financial health concerns.',
    bidRecommendation: null, confidenceScore: null,
  },
  {
    id: '6', ocid: 'OCDS-123456-006', title: 'Road Rehabilitation and Resealing Programme — Ward 1 to Ward 20',
    description: 'Rustenburg Local Municipality invites bids for the rehabilitation and resealing of 120km of roads across Wards 1-20, including stormwater drainage improvements.',
    status: 'Active', buyerName: 'Rustenburg Local Municipality', buyerId: 'RUST', municipalityCode: 'RUST',
    category: 'Infrastructure', estimatedValue: 320000000, awardValue: null, currency: 'ZAR',
    publishedDate: '2026-02-25', closingDate: '2026-04-25', awardDate: null, province: 'North West',
    bbbeeRequirement: 'Level 1-4', contractPeriodDays: 900,
    aiSummary: 'Large-scale road infrastructure programme from Rustenburg. Buyer has moderate financial health (FHS: 40). Previous road tenders from this buyer have shown 30% cost overruns on average.',
    bidRecommendation: 'Bid with detailed risk pricing', confidenceScore: 0.58,
  },
  {
    id: '7', ocid: 'OCDS-123456-007', title: 'Supply of Medical Equipment and Consumables — 3-Year Contract',
    description: 'Gauteng Department of Health seeks suppliers for the provision of medical equipment and consumables to 12 hospitals and 42 clinics across the province for a 3-year period.',
    status: 'Active', buyerName: 'Gauteng Department of Health', buyerId: null, municipalityCode: null,
    category: 'Healthcare', estimatedValue: 450000000, awardValue: null, currency: 'ZAR',
    publishedDate: '2026-02-18', closingDate: '2026-04-18', awardDate: null, province: 'Gauteng',
    bbbeeRequirement: 'Level 1-3', contractPeriodDays: 1095,
    aiSummary: 'Major healthcare supply contract from Gauteng Health. Buyer has history of irregular expenditure patterns. Strict compliance documentation required. High value but moderate risk.',
    bidRecommendation: 'Bid with robust compliance package', confidenceScore: 0.65,
  },
  {
    id: '8', ocid: 'OCDS-123456-008', title: 'Security Services for Municipal Infrastructure — 24/7 Guarding',
    description: 'Ekurhuleni Metropolitan Municipality requires 24/7 security guarding services for water treatment plants, pump stations, electricity substations, and municipal buildings.',
    status: 'Cancelled', buyerName: 'Ekurhuleni Metropolitan Municipality', buyerId: 'EKU', municipalityCode: 'EKU',
    category: 'Security', estimatedValue: 68000000, awardValue: null, currency: 'ZAR',
    publishedDate: '2025-12-01', closingDate: '2026-01-15', awardDate: null, province: 'Gauteng',
    bbbeeRequirement: 'Level 1-2', contractPeriodDays: 730,
    aiSummary: 'This tender was cancelled — likely due to specification irregularities. Ekurhuleni has a pattern of tender cancellation in the security category (3 of last 5 cancelled).',
    bidRecommendation: null, confidenceScore: null,
  },
];

// ─── SUPPLIERS ────────────────────────────────────────────────────────────────

export const MOCK_SUPPLIERS: Supplier[] = [
  { id: '1', csdId: 'CSD-001', name: 'Bokamoso Infrastructure Holdings (Pty) Ltd', registrationNumber: '2023/587423/07', entityType: 'PTY', bbbeeLevel: 1, csdStatus: 'Active', totalAwardValue: 890000000, awardCount: 34, concentrationIndex: 0.35, province: 'Gauteng' },
  { id: '2', csdId: 'CSD-002', name: 'Amanzi Water Solutions (Pty) Ltd', registrationNumber: '2021/432156/07', entityType: 'PTY', bbbeeLevel: 2, csdStatus: 'Active', totalAwardValue: 560000000, awardCount: 18, concentrationIndex: 0.42, province: 'KwaZulu-Natal' },
  { id: '3', csdId: 'CSD-003', name: 'Kganya Consulting Group (Pty) Ltd', registrationNumber: '2019/287654/07', entityType: 'PTY', bbbeeLevel: 1, csdStatus: 'Active', totalAwardValue: 320000000, awardCount: 12, concentrationIndex: 0.28, province: 'Western Cape' },
  { id: '4', csdId: 'CSD-004', name: 'SolarTech Africa (Pty) Ltd', registrationNumber: '2022/765432/07', entityType: 'PTY', bbbeeLevel: 3, csdStatus: 'Active', totalAwardValue: 195000000, awardCount: 8, concentrationIndex: 0.55, province: 'Free State' },
  { id: '5', csdId: 'CSD-005', name: 'Lethabo Construction CC', registrationNumber: '2018/123456/07', entityType: 'CC', bbbeeLevel: 2, csdStatus: 'Active', totalAwardValue: 445000000, awardCount: 22, concentrationIndex: 0.62, province: 'Gauteng' },
  { id: '6', csdId: 'CSD-006', name: 'MediPro Healthcare Solutions NPC', registrationNumber: '2020/543210/07', entityType: 'NPC', bbbeeLevel: 1, csdStatus: 'Active', totalAwardValue: 780000000, awardCount: 15, concentrationIndex: 0.72, province: 'Gauteng' },
  { id: '7', csdId: 'CSD-007', name: 'Shield Security Services (Pty) Ltd', registrationNumber: '2017/876543/07', entityType: 'PTY', bbbeeLevel: 4, csdStatus: 'Active', totalAwardValue: 210000000, awardCount: 28, concentrationIndex: 0.45, province: 'KwaZulu-Natal' },
  { id: '8', csdId: 'CSD-008', name: 'Dikgata IT Solutions (Pty) Ltd', registrationNumber: '2020/345678/07', entityType: 'PTY', bbbeeLevel: 1, csdStatus: 'Active', totalAwardValue: 125000000, awardCount: 6, concentrationIndex: 0.38, province: 'North West' },
];

// ─── RISK SIGNALS ─────────────────────────────────────────────────────────────

export const MOCK_RISK_SIGNALS: RiskSignal[] = [
  { id: '1', type: 'Award Concentration', severity: 'High', description: 'Unusual pattern detected: 72% of awards from this buyer directed to a single supplier over 24 months', entityId: 'EKU', entityType: 'Buyer', municipalityCode: 'EKU', indicator: 'Award Concentration Index', indicatorValue: 0.72, threshold: 0.50, detectedAt: '2026-02-28T10:30:00Z', status: 'Active' },
  { id: '2', type: 'Consecutive Awards', severity: 'Medium', description: 'Same supplier received consecutive awards in the same category for 4 periods without competitive bidding', entityId: '2', entityType: 'Supplier', municipalityCode: 'ETH', indicator: 'Consecutive Award Count', indicatorValue: 4, threshold: 3, detectedAt: '2026-02-25T14:15:00Z', status: 'Active' },
  { id: '3', type: 'Sub-threshold Splitting', severity: 'Critical', description: 'Multiple small awards to the same supplier within 30 days, potentially structured to avoid competitive threshold', entityId: '5', entityType: 'Supplier', municipalityCode: 'JHB', indicator: 'Sub-threshold Award Count', indicatorValue: 7, threshold: 3, detectedAt: '2026-03-01T08:45:00Z', status: 'Active' },
  { id: '4', type: 'Round Amount Concentration', severity: 'Low', description: 'Unusually high proportion of round-amount awards detected in buyer\'s procurement history', entityId: 'BUF', entityType: 'Buyer', municipalityCode: 'BUF', indicator: 'Round Amount Ratio', indicatorValue: 0.35, threshold: 0.25, detectedAt: '2026-02-20T16:00:00Z', status: 'Reviewed' },
  { id: '5', type: 'Financial Distress', severity: 'Critical', description: 'Municipality cash coverage below 10 days and debtor collection below 60% — significant financial distress signal', entityId: 'MAN', entityType: 'Municipality', municipalityCode: 'MAN', indicator: 'Cash Coverage Days', indicatorValue: 5, threshold: 30, detectedAt: '2026-03-02T09:00:00Z', status: 'Active' },
  { id: '6', type: 'Audit Regression', severity: 'High', description: 'Municipality audit outcome has regressed from Qualified to Disclaimer over two consecutive years', entityId: 'EKU', entityType: 'Municipality', municipalityCode: 'EKU', indicator: 'Audit Trajectory', indicatorValue: -2, threshold: -1, detectedAt: '2026-01-28T11:30:00Z', status: 'Active' },
];

// ─── INDICATORS ───────────────────────────────────────────────────────────────

export const MOCK_INDICATORS: Indicator[] = [
  { id: '1', code: 'FHS', name: 'Financial Health Score', category: 'Finance', value: 72, unit: 'score', period: '2023/24', source: 'Municipal Money API', sourceType: 'Administrative', municipalityCode: 'CPT', province: 'Western Cape', year: 2024 },
  { id: '2', code: 'SDPS', name: 'Service Delivery Pressure Score', category: 'Services', value: 25, unit: 'score', period: '2023/24', source: 'Stats SA GHS 2023', sourceType: 'Survey', municipalityCode: 'CPT', province: 'Western Cape', year: 2024 },
  { id: '3', code: 'SEVI', name: 'Socio-Economic Vulnerability Index', category: 'Demographics', value: 35, unit: 'score', period: '2023/24', source: 'Stats SA Census 2022', sourceType: 'Census', municipalityCode: 'CPT', province: 'Western Cape', year: 2024 },
  { id: '4', code: 'PAS', name: 'Procurement Activity Score', category: 'Finance', value: 68, unit: 'score', period: '2023/24', source: 'eTenders OCDS', sourceType: 'Administrative', municipalityCode: 'CPT', province: 'Western Cape', year: 2024 },
];

// ─── WARD PROFILES ────────────────────────────────────────────────────────────

export const MOCK_WARD_PROFILES: WardProfile[] = [
  { code: 'CPT-001', municipalityCode: 'CPT', municipalityName: 'City of Cape Town', province: 'Western Cape', incumbentParty: 'DA', serviceDeliveryScore: 85, population: 41200, povertyRate: 15.2, waterAccess: 99.1, sanitationAccess: 98.5, electricityAccess: 99.8 },
  { code: 'CPT-050', municipalityCode: 'CPT', municipalityName: 'City of Cape Town', province: 'Western Cape', incumbentParty: 'DA', serviceDeliveryScore: 42, population: 68500, povertyRate: 58.3, waterAccess: 72.5, sanitationAccess: 65.2, electricityAccess: 78.4 },
  { code: 'JHB-015', municipalityCode: 'JHB', municipalityName: 'City of Johannesburg', province: 'Gauteng', incumbentParty: 'ANC', serviceDeliveryScore: 55, population: 52300, povertyRate: 35.8, waterAccess: 88.2, sanitationAccess: 82.1, electricityAccess: 90.5 },
  { code: 'ETH-030', municipalityCode: 'ETH', municipalityName: 'eThekwini', province: 'KwaZulu-Natal', incumbentParty: 'ANC', serviceDeliveryScore: 38, population: 71200, povertyRate: 62.5, waterAccess: 65.8, sanitationAccess: 52.3, electricityAccess: 72.1 },
  { code: 'BUF-010', municipalityCode: 'BUF', municipalityName: 'Buffalo City', province: 'Eastern Cape', incumbentParty: 'ANC', serviceDeliveryScore: 32, population: 38900, povertyRate: 68.2, waterAccess: 58.2, sanitationAccess: 45.6, electricityAccess: 65.3 },
];

// ─── DASHBOARD KPIs ───────────────────────────────────────────────────────────

export const DASHBOARD_KPIS = {
  totalMunicipalities: 257,
  municipalitiesInDistress: 162,
  activeTenders: 1847,
  totalTenderValue: 478_000_000_000,
  riskSignalsActive: 234,
  criticalRiskSignals: 18,
  section139Interventions: 43,
  cleanAuditCount: 25,
  averageFinancialHealth: 42.5,
  averageServiceDelivery: 52.8,
};

// ─── PROVINCE SUMMARY ─────────────────────────────────────────────────────────

export const PROVINCE_SUMMARY = [
  { province: 'Eastern Cape', municipalities: 39, avgFHS: 28, avgSDS: 62, section139: 8, cleanAudit: 1 },
  { province: 'Free State', municipalities: 25, avgFHS: 32, avgSDS: 58, section139: 6, cleanAudit: 2 },
  { province: 'Gauteng', municipalities: 15, avgFHS: 45, avgSDS: 38, section139: 2, cleanAudit: 5 },
  { province: 'KwaZulu-Natal', municipalities: 54, avgFHS: 35, avgSDS: 55, section139: 7, cleanAudit: 3 },
  { province: 'Limpopo', municipalities: 30, avgFHS: 25, avgSDS: 65, section139: 9, cleanAudit: 1 },
  { province: 'Mpumalanga', municipalities: 21, avgFHS: 30, avgSDS: 60, section139: 5, cleanAudit: 2 },
  { province: 'Northern Cape', municipalities: 32, avgFHS: 42, avgSDS: 45, section139: 2, cleanAudit: 4 },
  { province: 'North West', municipalities: 23, avgFHS: 28, avgSDS: 58, section139: 4, cleanAudit: 3 },
  { province: 'Western Cape', municipalities: 30, avgFHS: 65, avgSDS: 22, section139: 0, cleanAudit: 12 },
];

// ─── AI ANALYST SUGGESTED PROMPTS ─────────────────────────────────────────────

export const SUGGESTED_PROMPTS: Record<string, string[]> = {
  Citizen: [
    'How is my municipality performing on service delivery?',
    'What is the water access rate in my area?',
    'How many municipalities have clean audits?',
    'What is the poverty rate in the Eastern Cape?',
  ],
  Analyst: [
    'Compare the financial health of Johannesburg vs Cape Town',
    'Which municipalities are at risk of Section 139 intervention?',
    'Show me procurement concentration patterns in eThekwini',
    'What is the trend in municipal audit outcomes since 2020?',
  ],
  Journalist: [
    'Which buyers have the highest award concentration indices?',
    'Show me the biggest tender awards in the last quarter',
    'What municipalities regressed in their audit outcomes?',
    'How many risk signals are active in Gauteng?',
  ],
  Government: [
    'Which municipalities have cash coverage below 30 days?',
    'Generate a briefing on Section 139 intervention candidates',
    'What is the national average debtor collection rate?',
    'Show me the provincial breakdown of clean audit outcomes',
  ],
};

// ─── AUDIT OUTCOMES DATA ──────────────────────────────────────────────────────

export const AUDIT_OUTCOMES_DISTRIBUTION = [
  { name: 'Clean', value: 25, color: '#10B981' },
  { name: 'Unqualified', value: 89, color: '#3B82F6' },
  { name: 'Qualified', value: 78, color: '#F59E0B' },
  { name: 'Adverse', value: 32, color: '#F97316' },
  { name: 'Disclaimer', value: 33, color: '#EF4444' },
];

// ─── FINANCIAL TRENDS ─────────────────────────────────────────────────────────

export const FINANCIAL_TRENDS = [
  { year: '2019/20', operatingBudget: 428, capitalBudget: 62, irregularExpenditure: 28 },
  { year: '2020/21', operatingBudget: 445, capitalBudget: 55, irregularExpenditure: 32 },
  { year: '2021/22', operatingBudget: 472, capitalBudget: 58, irregularExpenditure: 35 },
  { year: '2022/23', operatingBudget: 498, capitalBudget: 65, irregularExpenditure: 42 },
  { year: '2023/24', operatingBudget: 525, capitalBudget: 72, irregularExpenditure: 38 },
  { year: '2024/25', operatingBudget: 552, capitalBudget: 78, irregularExpenditure: 45 },
];

// ─── SERVICE DELIVERY BY PROVINCE ─────────────────────────────────────────────

export const SERVICE_DELIVERY_BY_PROVINCE = [
  { province: 'Eastern Cape', water: 72, sanitation: 58, electricity: 82, refuse: 52 },
  { province: 'Free State', water: 78, sanitation: 65, electricity: 85, refuse: 58 },
  { province: 'Gauteng', water: 95, sanitation: 90, electricity: 94, refuse: 82 },
  { province: 'KwaZulu-Natal', water: 80, sanitation: 68, electricity: 86, refuse: 60 },
  { province: 'Limpopo', water: 65, sanitation: 48, electricity: 75, refuse: 42 },
  { province: 'Mpumalanga', water: 75, sanitation: 60, electricity: 82, refuse: 55 },
  { province: 'Northern Cape', water: 88, sanitation: 82, electricity: 90, refuse: 75 },
  { province: 'North West', water: 76, sanitation: 62, electricity: 84, refuse: 56 },
  { province: 'Western Cape', water: 98, sanitation: 95, electricity: 97, refuse: 92 },
];
