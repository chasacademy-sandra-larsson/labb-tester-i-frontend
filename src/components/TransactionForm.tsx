import { useState } from 'react'
import type { Transaction, TransactionType, Category } from '../types'

interface TransactionFormProps {
  onAddTransaction: (transaction: Transaction) => void
}

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'salary', label: 'Lön' },
  { value: 'food', label: 'Mat' },
  { value: 'transport', label: 'Transport' },
  { value: 'entertainment', label: 'Nöje' },
  { value: 'housing', label: 'Boende' },
  { value: 'other', label: 'Övrigt' },
]

export function TransactionForm({ onAddTransaction }: TransactionFormProps) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<TransactionType>('expense')
  const [category, setCategory] = useState<Category>('other')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!description.trim()) {
      setError('Beskrivning krävs')
      return
    }

    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Ange ett giltigt belopp större än 0')
      return
    }

    onAddTransaction({
      id: crypto.randomUUID(),
      description: description.trim(),
      amount: parsedAmount,
      type,
      category,
      date: new Date().toISOString().split('T')[0],
    })

    setDescription('')
    setAmount('')
    setType('expense')
    setCategory('other')
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Lägg till transaktion">
      <h2>Ny transaktion</h2>

      {error && <p role="alert" className="error">{error}</p>}

      <div className="form-group">
        <label htmlFor="description">Beskrivning</label>
        <input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="T.ex. Lunch, Hyra, Lön..."
        />
      </div>

      <div className="form-group">
        <label htmlFor="amount">Belopp (kr)</label>
        <input
          id="amount"
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
        />
      </div>

      <div className="form-group">
        <label htmlFor="type">Typ</label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value as TransactionType)}
        >
          <option value="expense">Utgift</option>
          <option value="income">Inkomst</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="category">Kategori</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <button type="submit">Lägg till</button>
    </form>
  )
}
