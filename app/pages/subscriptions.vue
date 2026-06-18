<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSubscriptions } from '~/composables/useSubscriptions'
import { useToast } from '#imports'

const { subscriptions, addSubscription, deleteSubscription } = useSubscriptions()
const toast = useToast()

const isModalOpen = ref(false)
const newSub = ref({
  name: '',
  amount: 0,
  billingCycle: 'monthly' as 'monthly' | 'yearly',
  category: 'Entretenimiento',
  color: 'red'
})

const cycleOptions = [
  { label: 'Mensual', value: 'monthly' },
  { label: 'Anual', value: 'yearly' }
]

const colorOptions = [
  { label: 'Rojo (Netflix, etc)', value: 'red' },
  { label: 'Verde (Spotify, etc)', value: 'green' },
  { label: 'Azul', value: 'blue' },
  { label: 'Morado', value: 'purple' },
  { label: 'Naranja', value: 'orange' },
  { label: 'Gris', value: 'gray' }
]

const categoryOptions = ['Servicios', 'Entretenimiento', 'Salud', 'Educación', 'Software', 'Otros Gastos']

const handleAdd = () => {
  addSubscription({
    name: newSub.value.name,
    amount: newSub.value.amount,
    billingCycle: newSub.value.billingCycle,
    category: newSub.value.category,
    color: newSub.value.color
  })
  isModalOpen.value = false
  newSub.value = { name: '', amount: 0, billingCycle: 'monthly', category: 'Entretenimiento', color: 'red' }
  toast.add({ title: 'Suscripción añadida', color: 'green' })
}

const handleDelete = (id: string, name: string) => {
  deleteSubscription(id)
  toast.add({ title: 'Suscripción cancelada', description: `Has eliminado ${name}`, color: 'gray' })
}

const monthlyCost = computed(() => {
  return subscriptions.value.reduce((sum, sub) => {
    return sum + (sub.billingCycle === 'monthly' ? sub.amount : sub.amount / 12)
  }, 0)
})

const yearlyCost = computed(() => {
  return subscriptions.value.reduce((sum, sub) => {
    return sum + (sub.billingCycle === 'yearly' ? sub.amount : sub.amount * 12)
  }, 0)
})

const mostExpensive = computed(() => {
  if (subscriptions.value.length === 0) return { name: 'Ninguna', cost: 0 }
  const sorted = [...subscriptions.value].sort((a, b) => {
    const costA = a.billingCycle === 'yearly' ? a.amount : a.amount * 12
    const costB = b.billingCycle === 'yearly' ? b.amount : b.amount * 12
    return costB - costA
  })
  return { name: sorted[0].name, cost: sorted[0].billingCycle === 'yearly' ? sorted[0].amount : sorted[0].amount * 12 }
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value)
}
</script>

<template>
  <UContainer class="py-8 space-y-8">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Suscripciones</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">Identifica gastos hormiga y controla tus servicios fijos.</p>
      </div>
      <UButton icon="i-lucide-plus" size="lg" color="primary" @click="isModalOpen = true">
        Nueva Suscripción
      </UButton>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <UCard class="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
        <p class="text-sm font-medium text-red-800 dark:text-red-300">Costo Fijo Mensual</p>
        <p class="text-3xl font-bold text-red-900 dark:text-red-100">{{ formatCurrency(monthlyCost) }}</p>
        <p class="text-xs text-red-600 dark:text-red-400 mt-1">Lo que debes pagar mes a mes.</p>
      </UCard>
      
      <UCard class="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
        <p class="text-sm font-medium text-orange-800 dark:text-orange-300">Fuga Anual Total</p>
        <p class="text-3xl font-bold text-orange-900 dark:text-orange-100">{{ formatCurrency(yearlyCost) }}</p>
        <p class="text-xs text-orange-600 dark:text-orange-400 mt-1">El impacto total en tu año.</p>
      </UCard>
      
      <UCard class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
        <p class="text-sm font-medium text-blue-800 dark:text-blue-300">Más Costosa (Anual)</p>
        <p class="text-3xl font-bold text-blue-900 dark:text-blue-100 truncate">{{ mostExpensive.name }}</p>
        <p class="text-xs text-blue-600 dark:text-blue-400 mt-1" v-if="mostExpensive.cost > 0">{{ formatCurrency(mostExpensive.cost) }} / año</p>
      </UCard>
    </div>

    <!-- List -->
    <div v-if="subscriptions.length === 0" class="text-center py-20 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 border-dashed">
      <UIcon name="i-lucide-repeat" class="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Aún no hay suscripciones</h3>
      <p class="text-gray-500 dark:text-gray-400 mb-6">Añade Netflix, tu gimnasio u otros servicios fijos.</p>
      <UButton icon="i-lucide-plus" @click="isModalOpen = true">Añadir suscripción</UButton>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <UCard v-for="sub in subscriptions" :key="sub.id" class="relative group hover:border-red-300 dark:hover:border-red-800 transition-colors">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div :class="`w-10 h-10 rounded-full flex items-center justify-center bg-${sub.color}-100 dark:bg-${sub.color}-900 text-${sub.color}-600 dark:text-${sub.color}-400`">
              <span class="font-bold text-lg">{{ sub.name.charAt(0).toUpperCase() }}</span>
            </div>
            <div>
              <h3 class="font-bold truncate max-w-[120px]" :title="sub.name">{{ sub.name }}</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ sub.category }}</p>
            </div>
          </div>
          <!-- Cancel Button -->
          <button 
            @click="handleDelete(sub.id, sub.name)"
            class="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/50 text-red-500"
            title="Eliminar / Cancelar"
          >
            <UIcon name="i-lucide-trash-2" class="w-4 h-4" />
          </button>
        </div>
        <div class="mt-4 flex items-end justify-between">
          <p class="text-xl font-bold">{{ formatCurrency(sub.amount) }}</p>
          <span class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full font-medium text-gray-600 dark:text-gray-300">
            {{ sub.billingCycle === 'monthly' ? '/ mes' : '/ año' }}
          </span>
        </div>
      </UCard>
    </div>

    <!-- Modal -->
    <UModal v-model:open="isModalOpen">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold">Añadir Suscripción</h3>
              <UButton color="gray" variant="ghost" icon="i-lucide-x" class="-my-1" @click="isModalOpen = false" />
            </div>
          </template>
          
          <form @submit.prevent="handleAdd" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1">Nombre (ej. Netflix)</label>
              <UInput v-model="newSub.name" required autofocus />
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Monto</label>
                <UInput v-model="newSub.amount" type="number" min="0.01" step="0.01" required>
                  <template #leading><span class="text-gray-500 text-sm">€</span></template>
                </UInput>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Ciclo de cobro</label>
                <USelect v-model="newSub.billingCycle" :items="cycleOptions" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Categoría</label>
                <USelect v-model="newSub.category" :items="categoryOptions" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Color (Etiqueta)</label>
                <USelect v-model="newSub.color" :items="colorOptions" />
              </div>
            </div>

            <div class="pt-4 flex justify-end gap-3">
              <UButton color="gray" variant="soft" @click="isModalOpen = false">Cancelar</UButton>
              <UButton type="submit" color="primary">Guardar</UButton>
            </div>
          </form>
        </UCard>
      </template>
    </UModal>
  </UContainer>
</template>
