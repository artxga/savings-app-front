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
  
  const toast = useToast()
  const { getBudget } = useBudgets()

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

    // Calculate pacing for the month of the new transaction
    const monthPrefix = newTransaction.date.substring(0, 7) // YYYY-MM
    const pacing = getMonthlyPacing(monthPrefix)

    // Budget checks per category
    if (newTransaction.type === 'expense') {
      const budgetLimit = getBudget(newTransaction.category)
      let showedCategoryAlert = false

      if (budgetLimit > 0) {
        // Calculate total spent in this category
        const totalSpent = transactions.value
          .filter(t => t.type === 'expense' && t.category === newTransaction.category && t.date.startsWith(monthPrefix))
          .reduce((sum, t) => sum + t.amount, 0)

        const percentage = totalSpent / budgetLimit

        if (percentage > 1) {
          toast.add({
            title: '¡Presupuesto Excedido!',
            description: `Has superado tu límite de ${budgetLimit}€ para ${newTransaction.category}. Llevas gastado ${totalSpent}€.`,
            color: 'red',
            icon: 'i-lucide-alert-triangle'
          })
          showedCategoryAlert = true
        } else if (percentage >= 0.8) {
          toast.add({
            title: 'Atención al Presupuesto',
            description: `Has consumido el ${Math.round(percentage * 100)}% de tu presupuesto para ${newTransaction.category}.`,
            color: 'orange',
            icon: 'i-lucide-alert-circle'
          })
          showedCategoryAlert = true
        }
      } 
      
      // Smart Daily Pacing Alert (Global)
      if (pacing.isPacingToDeficit && pacing.totalExpenses > 0) {
         toast.add({
            title: '¡Ritmo de Gasto Peligroso!',
            description: `Tu gasto promedio diario es de ${Math.round(pacing.dailyExpenseAvg)}€. Si sigues así, gastarás ${Math.round(pacing.projectedEndOfMonthExpense)}€ al final del mes, superando tus ingresos esperados.`,
            color: 'red',
            icon: 'i-lucide-trending-down',
            timeout: 8000
          })
      } else if (!showedCategoryAlert) {
        toast.add({
          title: 'Gasto registrado',
          description: `Gasto guardado exitosamente.`,
          color: 'green'
        })
      }
    } else {
      toast.add({
        title: 'Ingreso añadido',
        description: `Ingreso guardado exitosamente.`,
        color: 'green'
      })
    }
  }

  const removeTransaction = (id: string) => {
    transactions.value = transactions.value.filter(t => t.id !== id)
  }

  const getMonthlyPacing = (monthString: string) => {
    // monthString format: YYYY-MM
    const [yearStr, monthStr] = monthString.split('-')
    const year = parseInt(yearStr)
    const monthIndex = parseInt(monthStr) - 1 // 0-based
    
    const today = new Date()
    
    // Total days in the requested month
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
    
    let elapsedDays = daysInMonth
    if (today.getFullYear() === year && today.getMonth() === monthIndex) {
      elapsedDays = Math.max(today.getDate(), 1)
    } else if (new Date(year, monthIndex) > today) {
      elapsedDays = 1
    }

    const monthlyTx = transactions.value.filter(t => t.date.startsWith(monthString))
    const totalIncome = monthlyTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = monthlyTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    
    let estimatedIncome = totalIncome
    if (estimatedIncome === 0) {
      const allIncome = transactions.value.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
      const uniqueMonths = new Set(transactions.value.map(t => t.date.substring(0, 7))).size
      estimatedIncome = uniqueMonths > 0 ? allIncome / uniqueMonths : 0
    }

    const dailyExpenseAvg = totalExpenses / elapsedDays
    const projectedEndOfMonthExpense = dailyExpenseAvg * daysInMonth

    return {
      totalIncome,
      estimatedIncome,
      totalExpenses,
      dailyExpenseAvg,
      projectedEndOfMonthExpense,
      isPacingToDeficit: projectedEndOfMonthExpense > estimatedIncome && estimatedIncome > 0
    }
  }

  return {
    transactions,
    addTransaction,
    removeTransaction,
    getMonthlyPacing
  }
}
