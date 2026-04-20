import type { Transaction, TransactionType, Category } from '../types'

export interface FilterOptions {
  type?: TransactionType
  category?: Category
  searchTerm?: string
}

export function filterTransactions(
  transactions: Transaction[],
  filters: FilterOptions
): Transaction[] {
  return transactions.filter((t) => {
    if (filters.type && t.type !== filters.type) return false
    if (filters.category && t.category !== filters.category) return false
    if (
      filters.searchTerm &&
      !t.description.toLowerCase().includes(filters.searchTerm.toLowerCase())
    ) {
      return false
    }
    return true
  })
}
