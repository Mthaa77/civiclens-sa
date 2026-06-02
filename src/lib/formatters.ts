// CivicLens SA — Formatters for ZAR currency, dates, population, etc.

/**
 * Format a number as South African Rand (ZAR)
 */
export function formatZAR(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format a number as compact ZAR (e.g., R1.2B, R450M, R3.5K)
 */
export function formatCompactZAR(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  if (value >= 1_000_000_000) return `R${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `R${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `R${(value / 1_000).toFixed(1)}K`;
  return `R${value.toFixed(0)}`;
}

/**
 * Format a population number with thousand separators
 */
export function formatPopulation(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-ZA').format(value);
}

/**
 * Format a percentage value
 */
export function formatPercent(value: number | null | undefined, decimals: number = 1): string {
  if (value === null || value === undefined) return '—';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a number with thousand separators
 */
export function formatNumber(value: number | null | undefined, decimals: number = 0): string {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-ZA', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a date string to South African format (DD MMM YYYY)
 */
export function formatSADate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-ZA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Format a date as relative time (e.g., "3 days ago", "in 2 weeks")
 */
export function formatRelativeDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays > 7 && diffDays <= 30) return `In ${Math.ceil(diffDays / 7)} weeks`;
  if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
  if (diffDays < -7 && diffDays >= -30) return `${Math.ceil(Math.abs(diffDays) / 7)} weeks ago`;
  return formatSADate(dateStr);
}

/**
 * Get score band label and color based on numeric score (0-100)
 */
export function getScoreBand(score: number | null | undefined): {
  label: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical';
  color: string;
  bgColor: string;
  textColor: string;
} {
  if (score === null || score === undefined) {
    return { label: 'Fair', color: 'text-muted-foreground', bgColor: 'bg-muted', textColor: 'text-muted-foreground' };
  }
  if (score >= 80) return { label: 'Excellent', color: 'text-emerald-600', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700' };
  if (score >= 65) return { label: 'Good', color: 'text-green-600', bgColor: 'bg-green-50', textColor: 'text-green-700' };
  if (score >= 45) return { label: 'Fair', color: 'text-amber-600', bgColor: 'bg-amber-50', textColor: 'text-amber-700' };
  if (score >= 25) return { label: 'Poor', color: 'text-orange-600', bgColor: 'bg-orange-50', textColor: 'text-orange-700' };
  return { label: 'Critical', color: 'text-red-600', bgColor: 'bg-red-50', textColor: 'text-red-700' };
}

/**
 * Get severity badge styling
 */
export function getSeverityStyle(severity: 'Low' | 'Medium' | 'High' | 'Critical'): {
  color: string;
  bgColor: string;
  borderColor: string;
} {
  switch (severity) {
    case 'Low':
      return { color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' };
    case 'Medium':
      return { color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' };
    case 'High':
      return { color: 'text-orange-700', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' };
    case 'Critical':
      return { color: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
  }
}

/**
 * Get municipality category label
 */
export function getMuniCategoryLabel(category: string): string {
  switch (category) {
    case 'A': return 'Metropolitan';
    case 'B': return 'Local';
    case 'C': return 'District';
    default: return category;
  }
}

/**
 * Get tender status color
 */
export function getTenderStatusStyle(status: string): {
  color: string;
  bgColor: string;
} {
  switch (status) {
    case 'Active':
      return { color: 'text-emerald-700', bgColor: 'bg-emerald-50' };
    case 'Awarded':
      return { color: 'text-blue-700', bgColor: 'bg-blue-50' };
    case 'Cancelled':
      return { color: 'text-red-700', bgColor: 'bg-red-50' };
    case 'Closed':
      return { color: 'text-gray-700', bgColor: 'bg-gray-50' };
    default:
      return { color: 'text-gray-700', bgColor: 'bg-gray-50' };
  }
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
