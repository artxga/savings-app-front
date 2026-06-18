<script setup lang="ts">
import { ref } from 'vue'
import confetti from 'canvas-confetti'
import { useGoals } from '~/composables/useGoals'
import { useToast } from '#imports'

const { goals, addGoal, addFunds, deleteGoal } = useGoals()
const toast = useToast()

// Create Goal Modal
const isCreateModalOpen = ref(false)
const newGoal = ref({
  title: '',
  targetAmount: 0,
  icon: 'i-lucide-target',
  color: 'blue'
})

const colorOptions = [
  { label: 'Azul', value: 'blue' },
  { label: 'Verde', value: 'green' },
  { label: 'Rojo', value: 'red' },
  { label: 'Morado', value: 'purple' },
  { label: 'Naranja', value: 'orange' }
]

const iconOptions = [
  { label: 'Objetivo', value: 'i-lucide-target' },
  { label: 'Viaje', value: 'i-lucide-plane' },
  { label: 'Casa', value: 'i-lucide-home' },
  { label: 'Coche', value: 'i-lucide-car' },
  { label: 'Emergencia', value: 'i-lucide-heart-pulse' },
  { label: 'Regalo', value: 'i-lucide-gift' }
]

const handleCreateGoal = () => {
  addGoal({
    title: newGoal.value.title,
    targetAmount: newGoal.value.targetAmount,
    icon: newGoal.value.icon,
    color: newGoal.value.color
  })
  isCreateModalOpen.value = false
  newGoal.value = { title: '', targetAmount: 0, icon: 'i-lucide-target', color: 'blue' }
  toast.add({ title: 'Meta creada', color: 'green' })
}

// Add Funds Modal
const isAddFundsModalOpen = ref(false)
const selectedGoalId = ref('')
const fundAmount = ref(0)

const openAddFunds = (id: string) => {
  selectedGoalId.value = id
  fundAmount.value = 0
  isAddFundsModalOpen.value = true
}

const handleAddFunds = () => {
  const goal = goals.value.find(g => g.id === selectedGoalId.value)
  if (!goal) return
  
  const previousAmount = goal.currentAmount
  addFunds(goal.id, fundAmount.value)
  
  // Check if we just reached the target!
  if (previousAmount < goal.targetAmount && goal.currentAmount >= goal.targetAmount) {
    triggerConfetti()
    toast.add({ 
      title: '¡Meta Alcanzada!', 
      description: `¡Felicidades! Has completado tu meta de ${goal.title}`, 
      color: 'green',
      icon: 'i-lucide-party-popper',
      timeout: 10000
    })
  } else {
    toast.add({ title: 'Fondos añadidos exitosamente', color: 'green' })
  }
  
  isAddFundsModalOpen.value = false
}

const triggerConfetti = () => {
  const duration = 3 * 1000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff'],
      zIndex: 9999
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff'],
      zIndex: 9999
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value)
}

const getProgress = (current: number, target: number) => {
  if (target === 0) return 0
  return Math.min(Math.round((current / target) * 100), 100)
}
</script>

<template>
  <UContainer class="py-8 space-y-8">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Mis Metas de Ahorro</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">Crea huchas virtuales y alcanza tus objetivos financieros.</p>
      </div>
      <UButton icon="i-lucide-plus" size="lg" color="primary" @click="isCreateModalOpen = true">
        Nueva Meta
      </UButton>
    </div>

    <!-- Empty State -->
    <div v-if="goals.length === 0" class="text-center py-20 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 border-dashed">
      <UIcon name="i-lucide-target" class="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Aún no tienes metas de ahorro</h3>
      <p class="text-gray-500 dark:text-gray-400 mb-6">Empieza creando una hucha virtual para tu próximo gran objetivo.</p>
      <UButton icon="i-lucide-plus" @click="isCreateModalOpen = true">Crear mi primera meta</UButton>
    </div>

    <!-- Goals Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UCard v-for="goal in goals" :key="goal.id" class="flex flex-col justify-between overflow-hidden relative">
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div :class="`p-2.5 rounded-xl bg-${goal.color}-100 dark:bg-${goal.color}-900/50`">
                <UIcon :name="goal.icon" :class="`w-6 h-6 text-${goal.color}-600 dark:text-${goal.color}-400`" />
              </div>
              <h3 class="text-lg font-bold truncate">{{ goal.title }}</h3>
            </div>
            <UDropdown :items="[[{ label: 'Eliminar Meta', icon: 'i-lucide-trash-2', click: () => deleteGoal(goal.id) }]]">
              <UButton color="gray" variant="ghost" icon="i-lucide-more-vertical" />
            </UDropdown>
          </div>
        </template>
        
        <div class="space-y-4">
          <div class="flex justify-between items-end">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Ahorrado</p>
              <p class="text-2xl font-bold">{{ formatCurrency(goal.currentAmount) }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-500 dark:text-gray-400">Objetivo</p>
              <p class="text-sm font-medium">{{ formatCurrency(goal.targetAmount) }}</p>
            </div>
          </div>
          
          <div>
            <div class="flex justify-between text-xs mb-1 font-medium text-gray-600 dark:text-gray-300">
              <span>Progreso</span>
              <span>{{ getProgress(goal.currentAmount, goal.targetAmount) }}%</span>
            </div>
            <UProgress :value="getProgress(goal.currentAmount, goal.targetAmount)" :color="goal.color" />
          </div>
        </div>

        <template #footer>
          <UButton 
            v-if="goal.currentAmount < goal.targetAmount"
            block 
            icon="i-lucide-plus-circle" 
            :color="goal.color" 
            variant="soft" 
            @click="openAddFunds(goal.id)"
          >
            Añadir Fondos
          </UButton>
          <UButton 
            v-else
            block 
            icon="i-lucide-check-circle-2" 
            color="green" 
            variant="solid" 
            class="pointer-events-none"
          >
            Meta Completada
          </UButton>
        </template>
      </UCard>
    </div>

    <!-- Create Goal Modal -->
    <UModal v-model:open="isCreateModalOpen">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold">Crear nueva meta</h3>
              <UButton color="gray" variant="ghost" icon="i-lucide-x" class="-my-1" @click="isCreateModalOpen = false" />
            </div>
          </template>
          
          <form @submit.prevent="handleCreateGoal" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1">Nombre de la meta</label>
              <UInput v-model="newGoal.title" placeholder="Ej. Viaje a Japón, Nuevo iPhone..." required />
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-1">Monto Objetivo</label>
              <UInput v-model="newGoal.targetAmount" type="number" min="1" required>
                <template #leading><span class="text-gray-500 text-sm">S/</span></template>
              </UInput>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Icono</label>
                <USelect v-model="newGoal.icon" :items="iconOptions" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Color</label>
                <USelect v-model="newGoal.color" :items="colorOptions" />
              </div>
            </div>

            <div class="pt-4 flex justify-end gap-3">
              <UButton color="gray" variant="soft" @click="isCreateModalOpen = false">Cancelar</UButton>
              <UButton type="submit" color="primary">Crear Meta</UButton>
            </div>
          </form>
        </UCard>
      </template>
    </UModal>

    <!-- Add Funds Modal -->
    <UModal v-model:open="isAddFundsModalOpen">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold">Añadir Fondos a la Meta</h3>
              <UButton color="gray" variant="ghost" icon="i-lucide-x" class="-my-1" @click="isAddFundsModalOpen = false" />
            </div>
          </template>
          
          <form @submit.prevent="handleAddFunds" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1">Monto a depositar</label>
              <UInput v-model="fundAmount" type="number" min="0.01" step="0.01" required autofocus>
                <template #leading><span class="text-gray-500 text-sm">S/</span></template>
              </UInput>
            </div>

            <div class="pt-4 flex justify-end gap-3">
              <UButton color="gray" variant="soft" @click="isAddFundsModalOpen = false">Cancelar</UButton>
              <UButton type="submit" color="primary">Depositar</UButton>
            </div>
          </form>
        </UCard>
      </template>
    </UModal>
  </UContainer>
</template>
