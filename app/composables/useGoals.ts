import { useState } from '#app'
import { watch, onMounted } from 'vue'

export interface Goal {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  icon: string
  color: string
}

export const useGoals = () => {
  const goals = useState<Goal[]>('goals', () => [])

  // Initialize from local storage on client side
  onMounted(() => {
    const saved = localStorage.getItem('savings-goals')
    if (saved) {
      try {
        goals.value = JSON.parse(saved)
      } catch (e) {
        console.error('Failed to parse goals', e)
      }
    }
  })

  // Watch for changes and save to local storage
  watch(goals, (newVal) => {
    if (process.client) {
      localStorage.setItem('savings-goals', JSON.stringify(newVal))
    }
  }, { deep: true })

  const addGoal = (goal: Omit<Goal, 'id' | 'currentAmount'>) => {
    goals.value.push({
      ...goal,
      id: crypto.randomUUID(),
      currentAmount: 0
    })
  }

  const addFunds = (id: string, amount: number) => {
    const goal = goals.value.find(g => g.id === id)
    if (goal) {
      goal.currentAmount += amount
    }
  }

  const deleteGoal = (id: string) => {
    goals.value = goals.value.filter(g => g.id !== id)
  }

  return {
    goals,
    addGoal,
    addFunds,
    deleteGoal
  }
}
