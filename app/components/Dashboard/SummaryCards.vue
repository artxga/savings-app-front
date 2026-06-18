<script setup lang="ts">
import { computed } from 'vue'
import type { Transaction } from '~/composables/useTransactions'

const props = defineProps<{
  transactions: Transaction[]
}>()

const totalIncome = computed(() => {
  return props.transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
})

const totalExpenses = computed(() => {
  return props.transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
})

const netSavings = computed(() => {
  return totalIncome.value - totalExpenses.value
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value)
}
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <UCard class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 ring-green-500/50">
      <div class="flex items-center gap-4">
        <div class="p-3 bg-green-500/20 rounded-full">
          <UIcon name="i-lucide-trending-up" class="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <p class="text-sm font-medium text-green-800 dark:text-green-300">Ingresos Totales</p>
          <p class="text-2xl font-bold text-green-900 dark:text-green-100">{{ formatCurrency(totalIncome) }}</p>
        </div>
      </div>
    </UCard>

    <UCard class="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 ring-red-500/50">
      <div class="flex items-center gap-4">
        <div class="p-3 bg-red-500/20 rounded-full">
          <UIcon name="i-lucide-trending-down" class="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <p class="text-sm font-medium text-red-800 dark:text-red-300">Gastos Totales</p>
          <p class="text-2xl font-bold text-red-900 dark:text-red-100">{{ formatCurrency(totalExpenses) }}</p>
        </div>
      </div>
    </UCard>

    <UCard class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 ring-blue-500/50">
      <div class="flex items-center gap-4">
        <div class="p-3 bg-blue-500/20 rounded-full">
          <UIcon name="i-lucide-piggy-bank" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p class="text-sm font-medium text-blue-800 dark:text-blue-300">Ahorro Neto</p>
          <p class="text-2xl font-bold text-blue-900 dark:text-blue-100">{{ formatCurrency(netSavings) }}</p>
        </div>
      </div>
    </UCard>
  </div>
</template>
