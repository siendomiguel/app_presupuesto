export type Plan = 'free' | 'pro' | 'premium'

export type Feature =
  | 'dashboard'
  | 'transactions'
  | 'budgets'
  | 'reports'
  | 'items'
  | 'cards'
  | 'settings'
  | 'help'
  | 'csv_export'
  | 'grocery_list'
  | 'ai_insights'

const FREE_FEATURES: Feature[] = [
  'dashboard',
  'transactions',
  'budgets',
  'reports',
  'items',
  'cards',
  'settings',
  'help',
  'csv_export',
  'ai_insights',
]

const PRO_FEATURES: Feature[] = [
  ...FREE_FEATURES,
]

const PREMIUM_FEATURES: Feature[] = [
  ...PRO_FEATURES,
  'grocery_list',
]

const PLAN_FEATURES: Record<Plan, Feature[]> = {
  free: FREE_FEATURES,
  pro: PRO_FEATURES,
  premium: PREMIUM_FEATURES,
}

export function canAccess(plan: Plan, feature: Feature): boolean {
  return PLAN_FEATURES[plan].includes(feature)
}

export function getPlanLabel(plan: Plan): string {
  const labels: Record<Plan, string> = {
    free: 'Gratis',
    pro: 'Pro',
    premium: 'Premium',
  }
  return labels[plan]
}
