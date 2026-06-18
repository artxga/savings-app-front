<script setup lang="ts">
import { ref, computed } from 'vue'
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, type TransactionType } from '~/composables/useTransactions'

const emit = defineEmits<{
  submit: [transaction: { type: TransactionType, amount: number, date: string, description: string, category: string }]
}>()

const type = ref<TransactionType>('expense')
const amount = ref<number | undefined>(undefined)
const date = ref(new Date().toISOString().split('T')[0])
const description = ref('')
const category = ref('')

const typeOptions = [
  { label: 'Gasto', value: 'expense' },
  { label: 'Ingreso', value: 'income' }
]

const categoryOptions = computed(() => {
  return type.value === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
})

const onSubmit = () => {
  if (!amount.value || !description.value || !category.value) return

  emit('submit', {
    type: type.value,
    amount: Number(amount.value),
    date: date.value,
    description: description.value,
    category: category.value
  })

  // Reset form
  amount.value = undefined
  description.value = ''
  category.value = ''
}
</script>

<template>
  <UCard>
    <template #header>
      <h3 class="text-lg font-semibold leading-6">Añadir Transacción</h3>
    </template>

    <form @submit.prevent="onSubmit" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Tipo</label>
          <USelect v-model="type" :options="typeOptions" option-attribute="label" value-attribute="value" />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Fecha</label>
          <UInput v-model="date" type="date" required />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Monto</label>
          <UInput v-model="amount" type="number" step="0.01" min="0" placeholder="0.00" required>
            <template #leading>
              <span class="text-gray-500 dark:text-gray-400 sm:text-sm">€</span>
            </template>
          </UInput>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Categoría</label>
          <USelect v-model="category" :options="categoryOptions" required placeholder="Selecciona..." />
        </div>

        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Descripción</label>
          <UInput v-model="description" placeholder="Ej. Compra supermercado" required />
        </div>
      </div>

      <div class="flex justify-end pt-2">
        <UButton type="submit" color="primary" icon="i-lucide-plus">
          Añadir
        </UButton>
      </div>
    </form>
  </UCard>
</template>
