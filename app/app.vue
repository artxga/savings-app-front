<script setup lang="ts">
import { ref } from 'vue'

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'es'
  }
})

const title = 'Ahorros App'
const description = 'Aplicación para gestionar tus ingresos, gastos y ahorros mensuales.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
})

const isSidebarOpen = ref(false)

const links = [
  { label: 'Panel de Control', icon: 'i-lucide-layout-dashboard', to: '/' },
  { label: 'Presupuestos', icon: 'i-lucide-wallet', to: '/budgets' },
  { label: 'Proyecciones', icon: 'i-lucide-line-chart', to: '/projections' },
]
</script>

<template>
  <UApp>
    <div class="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      
      <!-- Desktop Sidebar -->
      <aside class="hidden md:flex flex-col w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div class="p-4 border-b border-gray-200 dark:border-gray-800">
          <NuxtLink to="/" class="flex items-center gap-2">
            <UIcon name="i-lucide-piggy-bank" class="w-8 h-8 text-primary" />
            <span class="font-bold text-xl">Mis Ahorros</span>
          </NuxtLink>
        </div>
        <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
          <UButton 
            v-for="link in links" :key="link.to"
            :to="link.to"
            :icon="link.icon"
            color="gray"
            variant="ghost"
            class="w-full justify-start"
            active-class="bg-gray-100 dark:bg-gray-800 text-primary"
          >
            {{ link.label }}
          </UButton>
        </nav>
        <div class="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <span class="text-sm text-gray-500">Tema visual</span>
          <UColorModeButton />
        </div>
      </aside>

      <!-- Mobile Header & Sidebar -->
      <div class="md:hidden flex flex-col w-full absolute inset-0 pointer-events-none z-50" v-if="isSidebarOpen">
        <!-- Overlay -->
        <div class="absolute inset-0 bg-black/50 pointer-events-auto backdrop-blur-sm transition-opacity" @click="isSidebarOpen = false"></div>
        <aside class="relative w-64 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 pointer-events-auto flex flex-col shadow-xl">
          <div class="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
            <span class="font-bold text-xl">Mis Ahorros</span>
            <UButton icon="i-lucide-x" color="gray" variant="ghost" @click="isSidebarOpen = false" />
          </div>
          <nav class="flex-1 p-4 space-y-2">
            <UButton 
              v-for="link in links" :key="link.to"
              :to="link.to"
              :icon="link.icon"
              color="gray"
              variant="ghost"
              class="w-full justify-start"
              @click="isSidebarOpen = false"
            >
              {{ link.label }}
            </UButton>
          </nav>
        </aside>
      </div>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <!-- Mobile Header -->
        <header class="md:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-piggy-bank" class="w-6 h-6 text-primary" />
            <span class="font-bold text-lg">Mis Ahorros</span>
          </div>
          <div class="flex items-center gap-2">
            <UColorModeButton />
            <UButton icon="i-lucide-menu" color="gray" variant="ghost" @click="isSidebarOpen = true" />
          </div>
        </header>

        <main class="flex-1 overflow-y-auto">
          <NuxtPage />
        </main>
      </div>

    </div>
  </UApp>
</template>
