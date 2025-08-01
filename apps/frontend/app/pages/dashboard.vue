<template>
  <div>
    <!-- Welcome Section -->
    <div class="mb-8">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">
                Welcome back, {{ user?.name?.split(' ')[0] || 'there' }}! 🎉
              </h2>
              <p class="text-gray-600 mt-1">
                Ready to dive into your digital treasure trove?
              </p>
            </div>
          </div>
        </template>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UCard>
            <div class="text-center p-4">
              <div class="text-3xl mb-2">📊</div>
              <h3 class="font-semibold text-gray-900">Analytics</h3>
              <p class="text-sm text-gray-600 mt-1">View your stats</p>
            </div>
          </UCard>

          <UCard>
            <div class="text-center p-4">
              <div class="text-3xl mb-2">🔍</div>
              <h3 class="font-semibold text-gray-900">Search</h3>
              <p class="text-sm text-gray-600 mt-1">Find your content</p>
            </div>
          </UCard>

          <UCard>
            <div class="text-center p-4">
              <div class="text-3xl mb-2">⚙️</div>
              <h3 class="font-semibold text-gray-900">Settings</h3>
              <p class="text-sm text-gray-600 mt-1">Configure Bloop</p>
            </div>
          </UCard>
        </div>
      </UCard>
    </div>

    <!-- Quick Actions -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <UButton
          color="primary"
          variant="soft"
          size="lg"
          icon="i-heroicons-plus"
          class="justify-start"
        >
          Add Content
        </UButton>
        
        <UButton
          color="gray"
          variant="soft"
          size="lg"
          icon="i-heroicons-magnifying-glass"
          class="justify-start"
        >
          Search Library
        </UButton>
        
        <UButton
          color="green"
          variant="soft"
          size="lg"
          icon="i-heroicons-arrow-down-tray"
          class="justify-start"
        >
          Import Data
        </UButton>
        
        <UButton
          color="blue"
          variant="soft" 
          size="lg"
          icon="i-heroicons-chart-bar"
          class="justify-start"
        >
          View Reports
        </UButton>
      </div>
    </div>

    <!-- Recent Activity -->
    <div>
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <UCard>
        <div class="text-center py-12">
          <div class="text-6xl mb-4">🌊</div>
          <h4 class="text-xl font-semibold text-gray-900 mb-2">
            Your Bloop adventure starts here!
          </h4>
          <p class="text-gray-600 mb-6">
            No activity yet, but that's about to change. Start exploring!
          </p>
          <UButton color="primary" size="lg">
            Get Started
          </UButton>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
// Use the dashboard layout
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
});

const { user } = useAuth();
</script>