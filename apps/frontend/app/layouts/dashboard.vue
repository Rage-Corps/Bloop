<template>
  <div class="min-h-screen bg-base-300">
    <!-- Navigation Bar -->
    <nav class="bg-base-200 backdrop-blur-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo/Brand -->
          <div class="flex items-center space-x-8">
            <NuxtLink to="/" class="flex items-center space-x-4">
              <h1 class="text-2xl font-bold text-primary">🫧 Bloop</h1>
            </NuxtLink>

            <div class="hidden md:flex items-center space-x-1">
              <UButton
                to="/"
                icon="i-heroicons-home"
                label="Home"
                variant="ghost"
                color="white"
                class="hover:bg-primary-500/10"
              />
              <UButton
                to="/watchlist"
                icon="i-heroicons-heart"
                label="Watchlist"
                variant="ghost"
                color="white"
                class="hover:bg-primary-500/10"
              />
              <UButton
                to="/stars"
                icon="i-heroicons-user-group"
                label="Stars"
                variant="ghost"
                color="white"
                class="hover:bg-primary-500/10"
              />
            </div>
          </div>

          <!-- User Menu -->
          <div class="flex items-center space-x-4">
            <ClientOnly>
              <UDropdown
                :items="userMenuItems"
                :popper="{ placement: 'bottom-end' }"
                class="relative inline-flex"
              >
                <div class="flex items-center space-x-3 cursor-pointer">
                  <UAvatar
                    :alt="user?.name || user?.email || 'User'"
                    size="sm"
                    :ui="{ icon: 'bg-primary-500' }"
                  >
                    {{ getUserInitials() }}
                  </UAvatar>
                  <div class="hidden sm:block text-sm text-left">
                    <p class="font-medium text-white truncate max-w-[120px]">
                      {{ user?.name || 'User' }}
                    </p>
                    <p class="text-gray-500 truncate max-w-[120px]">
                      {{ user?.email }}
                    </p>
                  </div>
                </div>

                <template #item="{ item }">
                  <span class="truncate">{{ item.label }}</span>
                  <UIcon
                    :name="item.icon"
                    class="flex-shrink-0 h-4 w-4 text-gray-400 ms-auto"
                  />
                </template>
              </UDropdown>
              <template #fallback>
                <div class="hidden sm:flex items-center space-x-3">
                  <div class="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
                  <div class="text-sm">
                    <div class="w-16 h-4 bg-gray-700 rounded animate-pulse mb-1"></div>
                    <div class="w-24 h-3 bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </div>
              </template>
            </ClientOnly>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const { user, logout } = useAuth();

const getUserInitials = () => {
  const name = user.value?.name || user.value?.email || 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const handleLogout = async () => {
  try {
    await logout();
  } catch (error) {
    console.error('Logout error:', error);
  }
};

const userMenuItems = computed(() => [
  [
    {
      label: user.value?.email || 'Profile',
      icon: 'i-heroicons-user-circle',
      disabled: true,
    },
  ],
  [
    {
      label: 'Settings',
      icon: 'i-heroicons-cog-6-tooth',
      click: () => {
        navigateTo('/settings');
      },
    },
  ],
  [
    {
      label: 'Sign out',
      icon: 'i-heroicons-arrow-right-on-rectangle',
      click: handleLogout,
    },
  ],
]);
</script>
