<script setup lang="ts">
import { computed } from 'vue'
import type { Transaction } from '~/composables/useTransactions'

const props = defineProps<{
  transactions: Transaction[]
}>()

const emit = defineEmits<{
  delete: [id: string]
}>()

// Sort transactions by date descending
const sortedTransactions = computed(() => {
  return [...props.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value)
}

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' }).format(new Date(dateString))
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold leading-6">Movimientos del Mes</h3>
        <UBadge color="gray" variant="subtle">{{ transactions.length }} transacciones</UBadge>
      </div>
    </template>

    <div v-if="transactions.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
      <UIcon name="i-lucide-inbox" class="w-12 h-12 mx-auto mb-3 opacity-50" />
      <p>No hay transacciones este mes.</p>
    </div>

    <div v-else class="space-y-4">
      <div 
        v-for="tx in sortedTransactions" 
        :key="tx.id"
        class="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <div class="flex items-center gap-4">
          <div 
            class="p-2 rounded-full flex-shrink-0"
            :class="tx.type === 'income' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'"
          >
            <UIcon :name="tx.type === 'income' ? 'i-lucide-arrow-down-left' : 'i-lucide-arrow-up-right'" class="w-5 h-5" />
          </div>
          <div>
            <p class="font-medium text-gray-900 dark:text-white">{{ tx.description }}</p>
            <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>{{ formatDate(tx.date) }}</span>
              <span>•</span>
              <span>{{ tx.category }}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <span 
            class="font-semibold whitespace-nowrap"
            :class="tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'"
          >
            {{ tx.type === 'income' ? '+' : '-' }}{{ formatCurrency(tx.amount) }}
          </span>
          <UButton 
            color="red" 
            variant="ghost" 
            icon="i-lucide-trash-2" 
            size="sm" 
            @click="emit('delete', tx.id)" 
            aria-label="Eliminar"
          />
        </div>
      </div>
    </div>
  </UCard>
</template>
