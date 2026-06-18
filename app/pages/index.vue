<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTransactions } from '~/composables/useTransactions'
import SummaryCards from '~/components/Dashboard/SummaryCards.vue'
import TransactionForm from '~/components/Dashboard/TransactionForm.vue'
import TransactionList from '~/components/Dashboard/TransactionList.vue'
import MonthlyChart from '~/components/Dashboard/MonthlyChart.vue'

// Get current month in YYYY-MM format
const today = new Date()
const currentMonthString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`

const selectedMonth = ref(currentMonthString)

// Generate list of months for the selector (last 12 months)
const monthOptions = computed(() => {
  const options = []
  const d = new Date()
  for (let i = 0; i < 12; i++) {
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = new Intl.DateTimeFormat('es-PE', { month: 'long', year: 'numeric' }).format(d)
    // capitalize first letter
    const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1)
    
    options.push({ value, label: capitalizedLabel })
    d.setMonth(d.getMonth() - 1)
  }
  return options
})

const { transactions, addTransaction, removeTransaction, getMonthlyPacing } = useTransactions()

// Filter transactions by selected month
const monthlyTransactions = computed(() => {
  return transactions.value.filter(t => t.date.startsWith(selectedMonth.value))
})

const currentPacing = computed(() => getMonthlyPacing(selectedMonth.value))

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value)
}

const isModalOpen = ref(false)

const handleAddTransaction = (tx: any) => {
  addTransaction(tx)
  isModalOpen.value = false
}
</script>

<template>
  <UContainer class="py-8 space-y-8">
    
    <!-- Header & Month Selector -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Panel de Control</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">Gestiona tus ingresos y gastos mensuales.</p>
      </div>
      
      <div class="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
        <USelect 
          v-model="selectedMonth" 
          :items="monthOptions" 
          icon="i-lucide-calendar" 
          size="lg"
          class="w-full sm:w-64"
        />
        <UModal v-model:open="isModalOpen">
          <UButton 
            icon="i-lucide-plus" 
            size="lg" 
            color="primary" 
            class="w-full sm:w-auto justify-center"
          >
            Añadir Transacción
          </UButton>
          <template #content>
            <TransactionForm @submit="handleAddTransaction" class="border-0 shadow-none" />
          </template>
        </UModal>
      </div>
    </div>

    <!-- Summary Cards -->
    <SummaryCards :transactions="monthlyTransactions" />

    <!-- Pacing Alert Banner -->
    <div v-if="currentPacing.isPacingToDeficit && currentPacing.totalExpenses > 0" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <div class="p-2 bg-red-100 dark:bg-red-900/50 rounded-full shrink-0">
        <UIcon name="i-lucide-trending-down" class="w-5 h-5 text-red-600 dark:text-red-400" />
      </div>
      <div>
        <h4 class="font-bold text-red-800 dark:text-red-300">Ritmo de Gasto Peligroso</h4>
        <p class="text-sm text-red-700 dark:text-red-400 mt-1">
          Estás gastando a un ritmo de <strong>{{ formatCurrency(currentPacing.dailyExpenseAvg) }} por día</strong> este mes. 
          De seguir así, proyectamos que gastarás <strong>{{ formatCurrency(currentPacing.projectedEndOfMonthExpense) }}</strong>, superando tus ingresos. ¡Ten cuidado!
        </p>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Left Column: Chart -->
      <div class="lg:col-span-1">
        <MonthlyChart :transactions="monthlyTransactions" />
      </div>

      <!-- Right Column: Transactions List -->
      <div class="lg:col-span-2">
        <TransactionList :transactions="monthlyTransactions" @delete="removeTransaction" />
      </div>
      
    </div>

  </UContainer>
</template>
