import type { Transaction } from '../types'
import { formatCurrency } from '../utils/formatCurrency'

interface TransactionListProps {
  transactions: Transaction[]
  onDeleteTransaction: (id: string) => void
}

const CATEGORY_LABELS: Record<string, string> = {
  salary: 'Lön',
  food: 'Mat',
  transport: 'Transport',
  entertainment: 'Nöje',
  housing: 'Boende',
  other: 'Övrigt',
}

export function TransactionList({
  transactions,
  onDeleteTransaction,
}: TransactionListProps) {
  if (transactions.length === 0) {
    return <p className="empty-message">Inga transaktioner att visa</p>
  }

  return (
    <div>
      <h2>Transaktioner</h2>
      <ul className="transaction-list" role="list">
        {transactions.map((t) => (
          <li
            key={t.id}
            className={`transaction-item ${t.type}`}
          >
            <div className="transaction-info">
              <span className="transaction-description">{t.description}</span>
              <span className="transaction-category">
                {CATEGORY_LABELS[t.category]}
              </span>
              <span className="transaction-date">{t.date}</span>
            </div>
            <div className="transaction-actions">
              <span className={`transaction-amount ${t.type}`}>
                {t.type === 'income' ? '+' : '-'}
                {formatCurrency(t.amount)}
              </span>
              <button
                onClick={() => onDeleteTransaction(t.id)}
                aria-label={`Ta bort ${t.description}`}
              >
                Ta bort
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
