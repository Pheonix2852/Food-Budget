export type MealKind = 'BREAKFAST' | 'LUNCH' | 'DINNER'

// Runtime guard (optional)
export const isMealKind = (v: string): v is MealKind =>
  v === 'BREAKFAST' || v === 'LUNCH' || v === 'DINNER'