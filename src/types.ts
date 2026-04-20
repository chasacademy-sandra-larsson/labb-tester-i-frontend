export type TransactionType = 'income' | 'expense'

export type Category =
  | 'salary'
  | 'food'
  | 'transport'
  | 'entertainment'
  | 'housing'
  | 'other'

export interface Transaction {
  id: string
  description: string
  amount: number
  type: TransactionType
  category: Category
  date: string
}
