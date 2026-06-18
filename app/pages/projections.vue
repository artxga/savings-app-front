<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { useTransactions } from '~/composables/useTransactions'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const { transactions } = useTransactions()

const historicalTotalIncome = computed(() => transactions.value.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0))
const historicalTotalExpenses = computed(() => transactions.value.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0))
const historicalNetSavings = computed(() => historicalTotalIncome.value - historicalTotalExpenses.value)

// Calculate monthly averages (simplified: total / number of unique months with data)
const uniqueMonths = computed(() => {
  const months = new Set(transactions.value.map(t => t.date.substring(0, 7)))
  return Math.max(months.size, 1)
})

const avgMonthlyIncome = computed(() => Math.round(historicalTotalIncome.value / uniqueMonths.value))
const avgMonthlyExpense = computed(() => Math.round(historicalTotalExpenses.value / uniqueMonths.value))

// State for projection inputs
const currentCapital = ref(0)
const projectedIncome = ref(0)
const projectedExpense = ref(0)
const monthsToProject = ref(12)

const hasUserModified = ref(false)

watch([historicalNetSavings, avgMonthlyIncome, avgMonthlyExpense], ([net, inc, exp]) => {
  if (!hasUserModified.value) {
    currentCapital.value = net > 0 ? net : 0
    projectedIncome.value = inc
    projectedExpense.value = exp
  }
}, { immediate: true })

const onUserEdit = () => {
  hasUserModified.value = true
}

const resetToData = () => {
  hasUserModified.value = false
  currentCapital.value = historicalNetSavings.value > 0 ? historicalNetSavings.value : 0
  projectedIncome.value = avgMonthlyIncome.value
  projectedExpense.value = avgMonthlyExpense.value
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value)
}

const isDeficit = computed(() => (Number(projectedExpense.value) || 0) > (Number(projectedIncome.value) || 0))

const chartData = computed(() => {
  const labels = []
  const data = []
  
  let capital = Number(currentCapital.value) || 0
  const monthlyInc = Number(projectedIncome.value) || 0
  const monthlyExp = Number(projectedExpense.value) || 0
  const monthlyNet = monthlyInc - monthlyExp

  const today = new Date()
  
  labels.push('Mes Actual')
  data.push(capital)

  for (let i = 1; i <= monthsToProject.value; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1)
    const labelStr = new Intl.DateTimeFormat('es-ES', { month: 'short', year: '2-digit' }).format(d)
    labels.push(labelStr.charAt(0).toUpperCase() + labelStr.slice(1))
    
    capital += monthlyNet
    data.push(capital)
  }

  return {
    labels,
    datasets: [
      {
        label: 'Capital Estimado',
        backgroundColor: monthlyNet >= 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
        borderColor: monthlyNet >= 0 ? '#22c55e' : '#ef4444',
        data,
        fill: true,
        tension: 0.4
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: function(context: any) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(context.parsed.y);
          }
          return label;
        }
      }
    }
  },
  scales: {
    y: {
      ticks: {
        callback: function(value: any) {
          return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', notation: 'compact' }).format(value)
        }
      }
    }
  }
}
</script>

<template>
  <UContainer class="py-8 space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Proyecciones</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">Simula el crecimiento futuro de tus ahorros basado en tus hábitos.</p>
      </div>
      <UButton 
        v-if="hasUserModified"
        icon="i-lucide-rotate-ccw" 
        color="gray" 
        variant="ghost" 
        @click="resetToData"
      >
        Restaurar datos reales
      </UButton>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Simuation Controls -->
      <UCard class="lg:col-span-1 h-fit">
        <template #header>
          <h3 class="text-lg font-semibold">Parámetros de Simulación</h3>
        </template>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Capital Actual</label>
            <UInput v-model="currentCapital" type="number" step="10" @input="onUserEdit">
              <template #leading><span class="text-gray-500 sm:text-sm">€</span></template>
            </UInput>
            <p class="text-xs text-gray-500 mt-1">Punto de partida.</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Ingreso Mensual Estimado</label>
            <UInput v-model="projectedIncome" type="number" step="10" @input="onUserEdit">
              <template #leading><span class="text-gray-500 sm:text-sm">€</span></template>
            </UInput>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Gasto Mensual Estimado</label>
            <UInput v-model="projectedExpense" type="number" step="10" @input="onUserEdit">
              <template #leading><span class="text-gray-500 sm:text-sm">€</span></template>
            </UInput>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Meses a proyectar</label>
            <div class="flex items-center gap-4">
              <input type="range" v-model="monthsToProject" min="1" max="24" class="w-full" />
              <span class="font-bold w-12 text-right">{{ monthsToProject }}</span>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Chart and Alert Area -->
      <div class="lg:col-span-2 space-y-6">
        
        <div v-if="isDeficit" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <UIcon name="i-lucide-alert-triangle" class="w-6 h-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div>
            <h4 class="font-bold text-red-800 dark:text-red-300">¡Alerta de Déficit!</h4>
            <p class="text-sm text-red-700 dark:text-red-400 mt-1">
              Tus gastos mensuales estimados ({{ formatCurrency(projectedExpense) }}) superan tus ingresos ({{ formatCurrency(projectedIncome) }}). 
              A este ritmo, tu capital disminuirá en {{ formatCurrency(projectedExpense - projectedIncome) }} cada mes.
            </p>
          </div>
        </div>

        <div v-else class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
          <UIcon name="i-lucide-trending-up" class="w-6 h-6 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
          <div>
            <h4 class="font-bold text-green-800 dark:text-green-300">Ahorro Positivo</h4>
            <p class="text-sm text-green-700 dark:text-green-400 mt-1">
              Estás ahorrando {{ formatCurrency(projectedIncome - projectedExpense) }} cada mes. ¡Sigue así!
            </p>
          </div>
        </div>

        <UCard class="flex-1 min-h-[400px] flex flex-col">
          <div class="h-[400px] relative">
            <Line :data="chartData" :options="chartOptions" />
          </div>
        </UCard>

      </div>
    </div>
  </UContainer>
</template>
