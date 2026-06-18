<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js'
import type { Transaction } from '~/composables/useTransactions'

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale)

const props = defineProps<{
  transactions: Transaction[]
}>()

const chartData = computed(() => {
  const income = props.transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
    
  const expenses = props.transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  // Use Green for Income, Red for Expenses as requested
  return {
    labels: ['Ingresos', 'Gastos'],
    datasets: [
      {
        backgroundColor: ['#22c55e', '#ef4444'], // tailwind green-500 and red-500
        hoverBackgroundColor: ['#16a34a', '#dc2626'],
        data: [income, expenses],
        borderWidth: 0,
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        color: '#888' // Optional: make it adapt nicely to dark mode by using a neutral gray
      }
    },
    tooltip: {
      callbacks: {
        label: function(context: any) {
          let label = context.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed !== null) {
            label += new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(context.parsed);
          }
          return label;
        }
      }
    }
  },
  cutout: '70%'
}
</script>

<template>
  <UCard class="h-full flex flex-col">
    <template #header>
      <h3 class="text-lg font-semibold leading-6">Balance del Mes</h3>
    </template>
    
    <div class="relative h-64 flex items-center justify-center">
      <div v-if="transactions.length === 0" class="text-gray-500 dark:text-gray-400 text-center">
        Sin datos para graficar
      </div>
      <Doughnut v-else :data="chartData" :options="chartOptions" />
    </div>
  </UCard>
</template>
