<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import type { Transaction } from '~/composables/useTransactions'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const props = defineProps<{
  transactions: Transaction[],
  year: number
}>()

const chartData = computed(() => {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const data = new Array(12).fill(0)

  // Calculate cumulative capital before this year
  const pastTx = props.transactions.filter(t => t.date < `${props.year}-01-01`)
  let cumulativeCapital = pastTx.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0)

  // Calculate net for each month in the selected year
  const yearlyTx = props.transactions.filter(t => t.date.startsWith(props.year.toString()))
  const monthlyNet = new Array(12).fill(0)
  
  yearlyTx.forEach(t => {
    const monthIndex = parseInt(t.date.substring(5, 7)) - 1
    monthlyNet[monthIndex] += (t.type === 'income' ? t.amount : -t.amount)
  })

  // Compute cumulative progression
  for (let i = 0; i < 12; i++) {
    cumulativeCapital += monthlyNet[i]
    data[i] = cumulativeCapital
  }

  return {
    labels: months,
    datasets: [
      {
        label: 'Ahorro Acumulado',
        backgroundColor: 'rgba(59, 130, 246, 0.2)', // blue-500
        borderColor: '#3b82f6',
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
          if (label) label += ': ';
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(context.parsed.y);
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
          return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', notation: 'compact' }).format(value)
        }
      }
    }
  }
}
</script>

<template>
  <UCard class="h-full flex flex-col">
    <template #header>
      <h3 class="text-lg font-semibold leading-6">Evolución del Ahorro</h3>
    </template>
    
    <div class="relative h-72 flex items-center justify-center">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </UCard>
</template>
