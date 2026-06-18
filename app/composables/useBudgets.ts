export type Budgets = Record<string, number>

export const useBudgets = () => {
  // Store budgets as a Record of category name to budget amount (e.g. { 'Alimentación': 300 })
  const budgets = useState<Budgets>('budgets', () => ({}))

  onMounted(() => {
    if (import.meta.client) {
      const stored = localStorage.getItem('savings-app-budgets')
      if (stored) {
        try {
          budgets.value = JSON.parse(stored)
        } catch (e) {
          console.error('Failed to parse budgets from local storage', e)
        }
      }
    }
  })

  watch(budgets, (newVal) => {
    if (import.meta.client) {
      localStorage.setItem('savings-app-budgets', JSON.stringify(newVal))
    }
  }, { deep: true })

  const setBudget = (category: string, amount: number) => {
    if (amount <= 0) {
      const newBudgets = { ...budgets.value }
      delete newBudgets[category]
      budgets.value = newBudgets
    } else {
      budgets.value = { ...budgets.value, [category]: amount }
    }
  }

  const getBudget = (category: string) => {
    return budgets.value[category] || 0
  }

  return {
    budgets,
    setBudget,
    getBudget
  }
}
