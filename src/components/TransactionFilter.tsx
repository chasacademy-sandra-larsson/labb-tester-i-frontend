import type { TransactionType, Category } from '../types'
import type { FilterOptions } from '../utils/filterTransactions'

interface TransactionFilterProps {
  filters: FilterOptions
  onFilterChange: (filters: FilterOptions) => void
}

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'salary', label: 'Lön' },
  { value: 'food', label: 'Mat' },
  { value: 'transport', label: 'Transport' },
  { value: 'entertainment', label: 'Nöje' },
  { value: 'housing', label: 'Boende' },
  { value: 'other', label: 'Övrigt' },
]

export function TransactionFilter({
  filters,
  onFilterChange,
}: TransactionFilterProps) {
  return (
    <div className="filters" role="search" aria-label="Filtrera transaktioner">
      <div className="form-group">
        <label htmlFor="search">Sök</label>
        <input
          id="search"
          type="text"
          placeholder="Sök beskrivning..."
          value={filters.searchTerm ?? ''}
          onChange={(e) =>
            onFilterChange({ ...filters, searchTerm: e.target.value || undefined })
          }
        />
      </div>

      <div className="form-group">
        <label htmlFor="filter-type">Typ</label>
        <select
          id="filter-type"
          value={filters.type ?? ''}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              type: (e.target.value as TransactionType) || undefined,
            })
          }
        >
          <option value="">Alla</option>
          <option value="income">Inkomster</option>
          <option value="expense">Utgifter</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="filter-category">Kategori</label>
        <select
          id="filter-category"
          value={filters.category ?? ''}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              category: (e.target.value as Category) || undefined,
            })
          }
        >
          <option value="">Alla</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
