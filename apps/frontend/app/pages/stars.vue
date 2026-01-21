<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-white flex items-center gap-3">
          Stars
          <UBadge v-if="total !== null" color="gray" variant="soft" size="sm">
            {{ total }}
          </UBadge>
        </h1>
        <p class="text-gray-400 text-sm mt-1">Browse media by cast member</p>
      </div>
      <div class="flex items-center gap-2">
        <UInput
          v-model="searchQuery"
          icon="i-heroicons-magnifying-glass"
          placeholder="Search stars..."
          class="w-full md:w-64"
          @update:model-value="onSearch"
        />
        <USelect
          v-model="itemsPerPage"
          :items="itemsPerPageOptions"
          class="w-32"
          @update:model-value="onItemsPerPageChange"
        />
        <UButton
          icon="i-heroicons-arrow-path"
          variant="ghost"
          @click="loadStars"
          :loading="loading"
        />
      </div>
    </div>

    <UAlert
      v-if="error"
      color="red"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      :title="error"
    />

    <!-- Stars Grid -->
    <div v-if="loading && !stars.length" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
      <div v-for="i in 16" :key="i" class="flex flex-col items-center gap-2">
        <USkeleton class="w-32 h-32 rounded-full" />
        <USkeleton class="h-4 w-20" />
      </div>
    </div>

    <div v-else-if="stars.length" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
      <CastMemberCard
        v-for="star in stars"
        :key="star.id"
        :item="star"
        @click="onStarClick"
      />
    </div>

    <div v-else class="flex flex-col items-center justify-center py-20 text-gray-500">
      <UIcon name="i-heroicons-user-group" class="w-16 h-16 mb-4 opacity-20" />
      <p>No stars found</p>
    </div>

    <!-- Pagination -->
    <div v-if="total && total > itemsPerPage" class="flex justify-center mt-8 pb-8">
      <UPagination
        :total="total"
        :items-per-page="itemsPerPage"
        :sibling-count="2"
        :to="navigateToPage"
        color="primary"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CastMember } from '@bloop/shared-types';
import { useDebounceFn } from '@vueuse/core';

definePageMeta({
  layout: 'dashboard'
});

const router = useRouter();
const route = useRoute();
const { fetchCastMembers, discoverImages, loading, error } = useCastMembers();
const { getUserConfig, patchUserConfig } = useUserConfig();

// Reactive data
const stars = ref<CastMember[]>([]);
const total = ref<number | null>(null);
const searchQuery = ref('');
const itemsPerPage = ref(20);

// Items per page options (same as dashboard)
const itemsPerPageOptions = [
  { label: '10 per page', value: 10 },
  { label: '20 per page', value: 20 },
  { label: '30 per page', value: 30 },
  { label: '40 per page', value: 40 },
  { label: '50 per page', value: 50 },
  { label: '100 per page', value: 100 },
];

// Get current page from route query
const currentPage = computed(() => parseInt(route.query.page as string) || 1);
const offset = computed(() => (currentPage.value - 1) * itemsPerPage.value);

// Load user preferences for items per page
const loadUserPreferences = async () => {
  try {
    const userConfig = await getUserConfig();
    if (userConfig?.preferences?.itemsPerPage) {
      itemsPerPage.value = userConfig.preferences.itemsPerPage;
    }
  } catch (err) {
    console.warn('Failed to load user preferences:', err);
  }
};

const loadStars = async () => {
  try {
    const limit = Number(itemsPerPage.value);
    const response = await fetchCastMembers({
      name: searchQuery.value || undefined,
      limit,
      offset: offset.value,
    });
    stars.value = response.data;
    total.value = response.total;
  } catch (err) {
    console.error('Failed to load stars:', err);
  }
};

const onSearch = useDebounceFn(() => {
  // Reset to page 1 when searching
  router.push({
    query: {
      ...route.query,
      page: 1,
      q: searchQuery.value || undefined,
    },
  });
}, 300);

const onItemsPerPageChange = async (value: number) => {
  // Update the ref explicitly (v-model should handle this, but ensure it)
  itemsPerPage.value = Number(value);

  // Reset to page 1 when changing items per page
  await router.push({
    query: {
      ...route.query,
      page: 1,
    },
  });

  // Save preference
  patchUserConfig({ itemsPerPage: Number(value) });

  // Explicitly reload with new limit
  loadStars();
};

const navigateToPage = (page: number) => {
  return {
    query: {
      ...route.query,
      page,
    },
  };
};

const onStarClick = (star: CastMember) => {
  navigateTo({
    path: '/dashboard',
    query: {
      q: star.name
    }
  });
};

// Lifecycle
onMounted(async () => {
  // Load user preferences first
  await loadUserPreferences();

  // Restore search query from URL
  if (route.query.q) {
    searchQuery.value = route.query.q as string;
  }

  loadStars();
});

// Watch for route changes and itemsPerPage changes
watch(
  () => route.query.q,
  (newQ) => {
    if (newQ !== searchQuery.value) {
      searchQuery.value = (newQ as string) || '';
    }
  }
);

watch(
  [() => route.query.page, () => route.query.q, itemsPerPage],
  () => {
    loadStars();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
);
</script>
