<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import type { Transaction } from '~/composables/useTransactions'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps<{
  transactions: Transaction[],
  year: number
}>()

const chartData = computed(() => {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  
  const incomeData = new Array(12).fill(0)
  const expenseData = new Array(12).fill(0)

  // Filter transactions for the selected year
  const yearlyTx = props.transactions.filter(t => t.date.startsWith(props.year.toString()))

  yearlyTx.forEach(t => {
    // date is YYYY-MM-DD
    const monthIndex = parseInt(t.date.substring(5, 7)) - 1 // 0-based
    
    if (t.type === 'income') {
      incomeData[monthIndex] += t.amount
    } else {
      expenseData[monthIndex] += t.amount
    }
  })

  return {
    labels: months,
    datasets: [
      {
        label: 'Ingresos',
        backgroundColor: '#22c55e', // green-500
        data: incomeData,
        borderRadius: 4
      },
      {
        label: 'Gastos',
        backgroundColor: '#ef4444', // red-500
        data: expenseData,
        borderRadius: 4
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: { color: '#888' }
    },
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
      <h3 class="text-lg font-semibold leading-6">Ingresos vs Gastos ({{ year }})</h3>
    </template>
    
    <div class="relative h-72 flex items-center justify-center">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </UCard>
</template>
