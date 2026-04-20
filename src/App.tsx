import { useState } from 'react'
import type { Transaction } from './types'
import type { FilterOptions } from './utils/filterTransactions'
import { filterTransactions } from './utils/filterTransactions'
import { TransactionForm } from './components/TransactionForm'
import { TransactionList } from './components/TransactionList'
import { TransactionFilter } from './components/TransactionFilter'
import { Balance } from './components/Balance'
import './App.css'

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    description: 'Lön',
    amount: 25000,
    type: 'income',
    category: 'salary',
    date: '2025-04-01',
  },
  {
    id: '2',
    description: 'Hyra',
    amount: 8000,
    type: 'expense',
    category: 'housing',
    date: '2025-04-01',
  },
  {
    id: '3',
    description: 'Mataffären',
    amount: 450,
    type: 'expense',
    category: 'food',
    date: '2025-04-03',
  },
  {
    id: '4',
    description: 'Netflix',
    amount: 149,
    type: 'expense',
    category: 'entertainment',
    date: '2025-04-05',
  },
]

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS)
  const [filters, setFilters] = useState<FilterOptions>({})

  function handleAddTransaction(transaction: Transaction) {
    setTransactions((prev) => [transaction, ...prev])
  }

  function handleDeleteTransaction(id: string) {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }

  const filteredTransactions = filterTransactions(transactions, filters)

  return (
    <div className="app">
      <h1>Budgetplaneraren</h1>
      <div className="layout">
        <aside className="sidebar">
          <Balance transactions={transactions} />
          <TransactionForm onAddTransaction={handleAddTransaction} />
        </aside>
        <main className="main">
          <TransactionFilter filters={filters} onFilterChange={setFilters} />
          <TransactionList
            transactions={filteredTransactions}
            onDeleteTransaction={handleDeleteTransaction}
          />
        </main>
      </div>
    </div>
  )
}
