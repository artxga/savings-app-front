import { useState } from '#app'
import { watch, onMounted } from 'vue'

export interface Subscription {
  id: string
  name: string
  amount: number
  billingCycle: 'monthly' | 'yearly'
  category: string
  color: string
}

export const useSubscriptions = () => {
  const subscriptions = useState<Subscription[]>('subscriptions', () => [])

  // Initialize from local storage on client side
  onMounted(() => {
    const saved = localStorage.getItem('savings-subscriptions')
    if (saved) {
      try {
        subscriptions.value = JSON.parse(saved)
      } catch (e) {
        console.error('Failed to parse subscriptions', e)
      }
    }
  })

  // Watch for changes and save to local storage
  watch(subscriptions, (newVal) => {
    if (process.client) {
      localStorage.setItem('savings-subscriptions', JSON.stringify(newVal))
    }
  }, { deep: true })

  const addSubscription = (sub: Omit<Subscription, 'id'>) => {
    subscriptions.value.push({
      ...sub,
      id: crypto.randomUUID()
    })
  }

  const deleteSubscription = (id: string) => {
    subscriptions.value = subscriptions.value.filter(s => s.id !== id)
  }

  return {
    subscriptions,
    addSubscription,
    deleteSubscription
  }
}
