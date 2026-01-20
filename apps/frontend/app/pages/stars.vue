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
  </div>
</template>

<script setup lang="ts">
import type { CastMember } from '@bloop/shared-types';
import { useDebounceFn } from '@vueuse/core';

definePageMeta({
  layout: 'dashboard'
});

const { fetchCastMembers, discoverImages, loading, error } = useCastMembers();
const stars = ref<CastMember[]>([]);
const total = ref<number | null>(null);
const searchQuery = ref('');

const loadStars = async () => {
  try {
    const response = await fetchCastMembers({
      name: searchQuery.value || undefined
    });
    stars.value = response.data;
    total.value = response.total;
  } catch (err) {
    console.error('Failed to load stars:', err);
  }
};

const onSearch = useDebounceFn(() => {
  loadStars();
}, 300);

const onStarClick = (star: CastMember) => {
  navigateTo({
    path: '/dashboard',
    query: {
      q: star.name
    }
  });
};

onMounted(() => {
  loadStars();
});
</script>
