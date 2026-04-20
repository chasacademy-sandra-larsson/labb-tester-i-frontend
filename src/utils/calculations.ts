import type { Transaction, Category } from '../types'

export function calculateTotal(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => {
    return t.type === 'income' ? sum + t.amount : sum - t.amount
  }, 0)
}

export function calculateTotalByType(
  transactions: Transaction[],
  type: 'income' | 'expense'
): number {
  return transactions
    .filter((t) => t.type === type)
    .reduce((sum, t) => sum + t.amount, 0)
}

export function calculateByCategory(
  transactions: Transaction[]
): Record<Category, number> {
  const result: Record<Category, number> = {
    salary: 0,
    food: 0,
    transport: 0,
    entertainment: 0,
    housing: 0,
    other: 0,
  }

  for (const t of transactions) {
    if (t.type === 'expense') {
      result[t.category] += t.amount
    }
  }

  return result
}
