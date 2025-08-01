<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">Welcome to Bloop</h1>
      <p class="text-lg text-gray-600 mb-8">Your media scraping and management platform</p>
      <div class="space-x-4">
        <NuxtLink
          to="/login"
          class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
        >
          Sign In
        </NuxtLink>
        <NuxtLink
          to="/register"
          class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Sign Up
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { isLoggedIn } = useAuth()

// Redirect to dashboard if already logged in
watchEffect(() => {
  if (isLoggedIn.value) {
    navigateTo('/dashboard')
  }
})
</script>