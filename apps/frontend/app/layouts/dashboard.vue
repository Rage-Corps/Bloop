<template>
  <div class="min-h-screen bg-base-300">
    <!-- Navigation Bar -->
    <nav class="bg-base-200 backdrop-blur-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo/Brand -->
          <div class="flex items-center space-x-4">
            <h1 class="text-2xl font-bold text-primary">🫧 Bloop</h1>
          </div>

          <!-- User Menu -->
          <div class="flex items-center space-x-4">
            <ClientOnly>
              <div class="hidden sm:flex items-center space-x-3">
                <UAvatar
                  :alt="user?.name || user?.email || 'User'"
                  size="sm"
                  :ui="{ icon: 'bg-primary-500' }"
                >
                  {{ getUserInitials() }}
                </UAvatar>
                <div class="text-sm">
                  <p class="font-medium text-white">
                    {{ user?.name || 'User' }}
                  </p>
                  <p class="text-gray-500">{{ user?.email }}</p>
                </div>
              </div>
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

const userMenuItems = [
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
        // Navigate to settings when implemented
        console.log('Settings clicked');
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
];
</script>
