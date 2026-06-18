<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTransactions } from '~/composables/useTransactions'
import ExpenseDistributionChart from '~/components/Charts/ExpenseDistributionChart.vue'
import YearlyComparisonChart from '~/components/Charts/YearlyComparisonChart.vue'
import SavingsEvolutionChart from '~/components/Charts/SavingsEvolutionChart.vue'

const { transactions } = useTransactions()

const today = new Date()
const viewMode = ref<'yearly' | 'monthly'>('monthly')
const selectedYear = ref(today.getFullYear())
const selectedMonth = ref(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`)

const viewOptions = [
  { label: 'Vista Mensual', value: 'monthly' },
  { label: 'Vista Anual', value: 'yearly' }
]

const yearOptions = computed(() => {
  const years = new Set(transactions.value.map(t => parseInt(t.date.substring(0, 4))))
  years.add(today.getFullYear())
  
  return Array.from(years).sort((a, b) => b - a).map(y => ({
    label: y.toString(),
    value: y
  }))
})

const monthOptions = computed(() => {
  const options = []
  const d = new Date(today.getFullYear(), today.getMonth(), 1)
  
  for (let i = 0; i < 12; i++) {
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(d)
    const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1)
    
    options.push({ value, label: capitalizedLabel })
    d.setMonth(d.getMonth() - 1)
  }
  return options
})

const activeTransactions = computed(() => {
  if (viewMode.value === 'yearly') {
    return transactions.value.filter(t => t.date.startsWith(selectedYear.value.toString()))
  } else {
    return transactions.value.filter(t => t.date.startsWith(selectedMonth.value))
  }
})

const periodIncome = computed(() => {
  return activeTransactions.value.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
})

const periodExpense = computed(() => {
  return activeTransactions.value.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
})

const periodNet = computed(() => periodIncome.value - periodExpense.value)

const topExpenseCategory = computed(() => {
  const expenses = activeTransactions.value.filter(t => t.type === 'expense')
  if (expenses.length === 0) return 'Ninguno'
  
  const grouped: Record<string, number> = {}
  expenses.forEach(t => {
    grouped[t.category] = (grouped[t.category] || 0) + t.amount
  })
  
  const sorted = Object.keys(grouped).sort((a, b) => grouped[b] - grouped[a])
  return sorted[0]
})

const contextYear = computed(() => {
  return viewMode.value === 'yearly' ? selectedYear.value : parseInt(selectedMonth.value.split('-')[0])
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value)
}
</script>

<template>
  <UContainer class="py-8 space-y-8">
    
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Analíticas</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">Explora a fondo tu comportamiento financiero.</p>
      </div>
      
      <div class="flex items-center gap-3 w-full sm:w-auto">
        <USelect 
          v-model="viewMode" 
          :items="viewOptions" 
          size="lg"
          class="w-full sm:w-40"
        />
        
        <USelect 
          v-if="viewMode === 'yearly'"
          v-model="selectedYear" 
          :items="yearOptions" 
          icon="i-lucide-calendar-days" 
          size="lg"
          class="w-full sm:w-32"
        />
        <USelect 
          v-else
          v-model="selectedMonth" 
          :items="monthOptions" 
          icon="i-lucide-calendar-days" 
          size="lg"
          class="w-full sm:w-48"
        />
      </div>
    </div>

    <!-- Summary KPIs -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <UCard class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
        <p class="text-sm font-medium text-green-800 dark:text-green-300">Ingresos ({{ viewMode === 'yearly' ? 'Año' : 'Mes' }})</p>
        <p class="text-2xl font-bold text-green-900 dark:text-green-100">{{ formatCurrency(periodIncome) }}</p>
      </UCard>
      
      <UCard class="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
        <p class="text-sm font-medium text-red-800 dark:text-red-300">Gastos ({{ viewMode === 'yearly' ? 'Año' : 'Mes' }})</p>
        <p class="text-2xl font-bold text-red-900 dark:text-red-100">{{ formatCurrency(periodExpense) }}</p>
      </UCard>
      
      <UCard class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
        <p class="text-sm font-medium text-blue-800 dark:text-blue-300">Ahorro Neto</p>
        <p class="text-2xl font-bold text-blue-900 dark:text-blue-100">{{ formatCurrency(periodNet) }}</p>
      </UCard>

      <UCard class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
        <p class="text-sm font-medium text-purple-800 dark:text-purple-300">Mayor Gasto En</p>
        <p class="text-xl font-bold text-purple-900 dark:text-purple-100 truncate" :title="topExpenseCategory">{{ topExpenseCategory }}</p>
      </UCard>
    </div>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Expense Distribution -->
      <div class="lg:col-span-1">
        <ExpenseDistributionChart :transactions="activeTransactions" />
      </div>

      <!-- Yearly Comparison (Always context year) -->
      <div class="lg:col-span-2">
        <YearlyComparisonChart :transactions="transactions" :year="contextYear" />
      </div>

      <!-- Savings Evolution (Always context year) -->
      <div class="lg:col-span-3">
        <SavingsEvolutionChart :transactions="transactions" :year="contextYear" />
      </div>
      
    </div>

  </UContainer>
</template>
