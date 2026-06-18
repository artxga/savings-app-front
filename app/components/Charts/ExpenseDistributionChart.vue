<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import type { Transaction } from '~/composables/useTransactions'

ChartJS.register(Title, Tooltip, Legend, ArcElement)

const props = defineProps<{
  transactions: Transaction[]
}>()

// Use a fixed palette for categories to keep it looking consistent
const categoryColors: Record<string, string> = {
  'Alimentación': '#ef4444', // red
  'Transporte': '#f97316', // orange
  'Vivienda': '#3b82f6', // blue
  'Servicios': '#06b6d4', // cyan
  'Entretenimiento': '#8b5cf6', // purple
  'Salud': '#ec4899', // pink
  'Otros Gastos': '#64748b' // slate
}

const chartData = computed(() => {
  const expenses = props.transactions.filter(t => t.type === 'expense')
  
  const grouped: Record<string, number> = {}
  expenses.forEach(t => {
    grouped[t.category] = (grouped[t.category] || 0) + t.amount
  })

  // Sort by amount descending
  const sortedCategories = Object.keys(grouped).sort((a, b) => grouped[b] - grouped[a])
  
  const data = sortedCategories.map(cat => grouped[cat])
  const backgroundColor = sortedCategories.map(cat => categoryColors[cat] || '#cbd5e1') // default gray if unknown

  return {
    labels: sortedCategories,
    datasets: [
      {
        data,
        backgroundColor,
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right' as const,
      labels: {
        color: '#888'
      }
    },
    tooltip: {
      callbacks: {
        label: function(context: any) {
          let label = context.label || '';
          if (label) label += ': ';
          if (context.parsed !== null) {
            label += new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(context.parsed);
          }
          return label;
        }
      }
    }
  },
  cutout: '60%'
}
</script>

<template>
  <UCard class="h-full flex flex-col">
    <template #header>
      <h3 class="text-lg font-semibold leading-6">Distribución de Gastos</h3>
    </template>
    
    <div class="relative h-64 flex items-center justify-center">
      <div v-if="chartData.labels.length === 0" class="text-gray-500 dark:text-gray-400 text-center">
        No hay gastos registrados en este periodo.
      </div>
      <Doughnut v-else :data="chartData" :options="chartOptions" />
    </div>
  </UCard>
</template>
