import type { Transaction } from '../types'
import { calculateTotal, calculateTotalByType } from '../utils/calculations'
import { formatCurrency } from '../utils/formatCurrency'

interface BalanceProps {
  transactions: Transaction[]
}

export function Balance({ transactions }: BalanceProps) {
  const total = calculateTotal(transactions)
  const totalIncome = calculateTotalByType(transactions, 'income')
  const totalExpenses = calculateTotalByType(transactions, 'expense')

  return (
    <div className="balance">
      <h2>Översikt</h2>
      <div className="balance-total">
        <span>Balans</span>
        <span className={total >= 0 ? 'positive' : 'negative'}>
          {formatCurrency(total)}
        </span>
      </div>
      <div className="balance-details">
        <div className="balance-income">
          <span>Inkomster</span>
          <span className="positive">{formatCurrency(totalIncome)}</span>
        </div>
        <div className="balance-expense">
          <span>Utgifter</span>
          <span className="negative">{formatCurrency(totalExpenses)}</span>
        </div>
      </div>
    </div>
  )
}
