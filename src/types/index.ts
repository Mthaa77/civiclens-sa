// CivicLens SA — TypeScript Type Definitions

// ─── NAVIGATION ───────────────────────────────────────────────────────────────

export type ModuleId =
  | 'dashboard'
  | 'tenderlens'
  | 'munilens'
  | 'geolens'
  | 'ai-analyst'
  | 'reportlens'
  | 'risklens'
  | 'electionlens'
  | 'policylens'
  | 'peoplelens'
  | 'servicelens'
  | 'agasalert'
  | 'earlyalert'
  | 'grantlens'
  | 'budgetlens'
  | 'carbonlens'
  | 'datahub';

export interface ModuleDef {
  id: ModuleId;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  phase: 'MVP' | 'Phase 2' | 'Phase 3';
  color: string;
}

// ─── MUNICIPALITY ─────────────────────────────────────────────────────────────

export interface Municipality {
  id: string;
  code: string;
  name: string;
  category: 'A' | 'B' | 'C';
  province: string;
  district: string | null;
  population2022: number | null;
  geographicAreaKm2: number | null;
  wardCount: number | null;
  financialHealthScore: number | null;
  serviceDeliveryScore: number | null;
  socioEconomicIndex: number | null;
  procurementScore: number | null;
  auditOutcome: string | null;
  auditYear: string | null;
  operatingBudget: number | null;
  capitalBudget: number | null;
  cashCoverageDays: number | null;
  debtorCollectionRate: number | null;
  waterAccess: number | null;
  sanitationAccess: number | null;
  electricityAccess: number | null;
  refuseRemoval: number | null;
  povertyRate: number | null;
  youthUnemployment: number | null;
  sassaDependency: number | null;
  section139Status: string | null;
  earlyAlertScore: number | null;
  climateRiskScore: number | null;
}

export interface MunicipalityScorecard {
  financialHealth: ScoreDetail;
  serviceDelivery: ScoreDetail;
  socioEconomic: ScoreDetail;
  procurement: ScoreDetail;
}

export interface ScoreDetail {
  score: number;
  label: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical';
  color: string;
  components: ScoreComponent[];
}

export interface ScoreComponent {
  name: string;
  value: number;
  weight: number;
  trend: 'up' | 'down' | 'stable';
}

// ─── TENDER ───────────────────────────────────────────────────────────────────

export interface Tender {
  id: string;
  ocid: string;
  title: string;
  description: string;
  status: 'Active' | 'Awarded' | 'Cancelled' | 'Closed';
  buyerName: string;
  buyerId: string | null;
  municipalityCode: string | null;
  category: string;
  estimatedValue: number | null;
  awardValue: number | null;
  currency: string;
  publishedDate: string | null;
  closingDate: string | null;
  awardDate: string | null;
  province: string | null;
  bbbeeRequirement: string | null;
  contractPeriodDays: number | null;
  aiSummary: string | null;
  bidRecommendation: string | null;
  confidenceScore: number | null;
}

export interface TenderFilters {
  search: string;
  province: string;
  category: string;
  status: string;
  valueRange: [number, number];
  closingWindow: string;
  bbbeeLevel: string;
}

// ─── SUPPLIER ─────────────────────────────────────────────────────────────────

export interface Supplier {
  id: string;
  csdId: string | null;
  name: string;
  registrationNumber: string | null;
  entityType: string | null;
  bbbeeLevel: number | null;
  csdStatus: string | null;
  totalAwardValue: number | null;
  awardCount: number | null;
  concentrationIndex: number | null;
  province: string | null;
}

// ─── INDICATOR ────────────────────────────────────────────────────────────────

export interface Indicator {
  id: string;
  code: string;
  name: string;
  category: string;
  value: number;
  unit: string | null;
  period: string;
  source: string;
  sourceType: 'Census' | 'Survey' | 'Administrative' | 'Model';
  municipalityCode: string | null;
  province: string | null;
  year: number | null;
}

// ─── RISK ─────────────────────────────────────────────────────────────────────

export interface RiskSignal {
  id: string;
  type: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  entityId: string;
  entityType: 'Buyer' | 'Supplier' | 'Municipality';
  municipalityCode: string | null;
  indicator: string;
  indicatorValue: number | null;
  threshold: number | null;
  detectedAt: string;
  status: 'Active' | 'Reviewed' | 'Dismissed';
}

// ─── AI ANALYST ───────────────────────────────────────────────────────────────

export type AIPersona = 'Citizen' | 'Analyst' | 'Journalist' | 'Government';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  persona: AIPersona | null;
  sources: string[] | null;
  timestamp: string;
  isLoading?: boolean;
  isSimulated?: boolean;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  persona: AIPersona;
}

// ─── ELECTION ─────────────────────────────────────────────────────────────────

export interface WardProfile {
  code: string;
  municipalityCode: string;
  municipalityName: string;
  province: string;
  incumbentParty: string;
  serviceDeliveryScore: number;
  population: number;
  povertyRate: number;
  waterAccess: number;
  sanitationAccess: number;
  electricityAccess: number;
}

// ─── COMMON ───────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface DataCaveat {
  source: string;
  period: string;
  type: 'Census' | 'Survey' | 'Administrative' | 'Model';
  note?: string;
}

export type ScoreBand = 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical';

export const SA_PROVINCES = [
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'Northern Cape',
  'North West',
  'Western Cape',
] as const;

export type SAProvince = (typeof SA_PROVINCES)[number];

export const TENDER_CATEGORIES = [
  'Infrastructure',
  'IT & Technology',
  'Professional Services',
  'Healthcare',
  'Education',
  'Water & Sanitation',
  'Energy',
  'Transport',
  'Housing',
  'Agriculture',
  'Security',
  'Office Supplies',
] as const;
