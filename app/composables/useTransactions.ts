export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  date: string // ISO string (YYYY-MM-DD)
  description: string
  category: string
}

export const INCOME_CATEGORIES = ['Salario', 'Inversiones', 'Ventas', 'Otros Ingresos']
export const EXPENSE_CATEGORIES = ['Alimentación', 'Transporte', 'Vivienda', 'Servicios', 'Entretenimiento', 'Salud', 'Otros Gastos']

export const useTransactions = () => {
  // Use Nuxt's useState to share the state globally during the session
  const transactions = useState<Transaction[]>('transactions', () => [])

  // Initialize from LocalStorage only on client side
  onMounted(() => {
    if (import.meta.client) {
      const stored = localStorage.getItem('savings-app-transactions')
      if (stored) {
        try {
          transactions.value = JSON.parse(stored)
        } catch (e) {
          console.error('Failed to parse transactions from local storage', e)
        }
      }
    }
  })

  // Watch for changes and save to LocalStorage
  watch(transactions, (newVal) => {
    if (import.meta.client) {
      localStorage.setItem('savings-app-transactions', JSON.stringify(newVal))
    }
  }, { deep: true })

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID()
    }
    transactions.value.push(newTransaction)
  }

  const removeTransaction = (id: string) => {
    transactions.value = transactions.value.filter(t => t.id !== id)
  }

  return {
    transactions,
    addTransaction,
    removeTransaction
  }
}
