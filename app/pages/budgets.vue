<script setup lang="ts">
import { computed, ref } from 'vue'
import { EXPENSE_CATEGORIES, useTransactions } from '~/composables/useTransactions'
import { useBudgets } from '~/composables/useBudgets'

const { budgets, setBudget } = useBudgets()
const { transactions } = useTransactions()

// Get current month in YYYY-MM format to filter expenses
const today = new Date()
const currentMonthString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`

const selectedMonth = ref(currentMonthString)

// Generate list of months for the selector (last 12 months)
const monthOptions = computed(() => {
  const options = []
  const d = new Date()
  for (let i = 0; i < 12; i++) {
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(d)
    const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1)
    
    options.push({ value, label: capitalizedLabel })
    d.setMonth(d.getMonth() - 1)
  }
  return options
})

// Calculate total spent per category in the selected month
const spentPerCategory = computed(() => {
  const monthlyExpenses = transactions.value.filter(
    t => t.type === 'expense' && t.date.startsWith(selectedMonth.value)
  )

  const spent: Record<string, number> = {}
  for (const t of monthlyExpenses) {
    if (!spent[t.category]) spent[t.category] = 0
    spent[t.category] += t.amount
  }
  return spent
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value)
}

// Local state for editing budgets
const isEditing = ref<Record<string, boolean>>({})
const editValue = ref<Record<string, number>>({})

const startEdit = (category: string) => {
  isEditing.value[category] = true
  editValue.value[category] = budgets.value[category] || 0
}

const saveEdit = (category: string) => {
  setBudget(category, editValue.value[category] || 0)
  isEditing.value[category] = false
}

const cancelEdit = (category: string) => {
  isEditing.value[category] = false
}
</script>

<template>
  <UContainer class="py-8 space-y-8">
    
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Presupuestos</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">Establece límites para tus categorías de gastos.</p>
      </div>
      
      <div class="w-full sm:w-64">
        <USelect 
          v-model="selectedMonth" 
          :items="monthOptions" 
          icon="i-lucide-calendar" 
          size="lg"
        />
      </div>
    </div>

    <!-- Budgets List -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <UCard v-for="category in EXPENSE_CATEGORIES" :key="category">
        
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">{{ category }}</h3>
          
          <div v-if="!isEditing[category]" class="flex items-center gap-2">
            <span class="font-medium text-gray-900 dark:text-white">
              {{ budgets[category] ? formatCurrency(budgets[category]) : 'Sin límite' }}
            </span>
            <UButton icon="i-lucide-pencil" size="xs" color="gray" variant="ghost" @click="startEdit(category)" />
          </div>
          
          <div v-else class="flex items-center gap-2">
            <UInput v-model="editValue[category]" type="number" min="0" step="10" class="w-24" />
            <UButton icon="i-lucide-check" size="xs" color="green" variant="ghost" @click="saveEdit(category)" />
            <UButton icon="i-lucide-x" size="xs" color="red" variant="ghost" @click="cancelEdit(category)" />
          </div>
        </div>

        <div v-if="budgets[category] > 0">
          <div class="flex justify-between text-sm mb-1">
            <span class="text-gray-500 dark:text-gray-400">Consumido: {{ formatCurrency(spentPerCategory[category] || 0) }}</span>
            <span class="font-medium" :class="(spentPerCategory[category] || 0) > budgets[category] ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'">
              {{ Math.round(((spentPerCategory[category] || 0) / budgets[category]) * 100) }}%
            </span>
          </div>
          <!-- Simple Progress Bar using Tailwind -->
          <div class="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2.5 mb-2 overflow-hidden">
            <div 
              class="h-2.5 rounded-full transition-all duration-500" 
              :class="[
                ((spentPerCategory[category] || 0) / budgets[category]) >= 1 ? 'bg-red-500' : 
                ((spentPerCategory[category] || 0) / budgets[category]) >= 0.8 ? 'bg-orange-500' : 'bg-primary-500'
              ]"
              :style="{ width: Math.min(((spentPerCategory[category] || 0) / budgets[category]) * 100, 100) + '%' }"
            ></div>
          </div>
          <p v-if="(spentPerCategory[category] || 0) > budgets[category]" class="text-xs text-red-500 mt-1">
            Has excedido tu límite por {{ formatCurrency((spentPerCategory[category] || 0) - budgets[category]) }}
          </p>
          <p v-else class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Disponible: {{ formatCurrency(budgets[category] - (spentPerCategory[category] || 0)) }}
          </p>
        </div>
        <div v-else class="text-sm text-gray-500 dark:text-gray-400 italic">
          No has establecido un presupuesto. Haz clic en el lápiz para configurar uno.
        </div>

      </UCard>
    </div>

  </UContainer>
</template>
