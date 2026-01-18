<template>
  <div>
    <!-- Main Content Area -->
    <div>
      <!-- Page Header -->
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h2 class="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <UIcon name="i-heroicons-heart-solid" class="text-primary" />
            My Watchlist
          </h2>
          <p class="text-gray-400 text-sm">
            Your personal collection of saved media items
          </p>
        </div>
        
        <div class="flex items-center gap-4">
          <UButton
            icon="i-heroicons-arrow-path"
            variant="ghost"
            color="white"
            :loading="loading"
            @click="fetchWatchlist"
          />
          <UButton
            to="/"
            icon="i-heroicons-home"
            label="Back to Home"
            variant="outline"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading && watchlist.length === 0" class="text-center py-12">
        <UIcon
          name="i-heroicons-arrow-path"
          class="animate-spin text-4xl text-primary mb-4"
        />
        <p class="text-gray-400">Loading your watchlist...</p>
      </div>

      <!-- Error State -->
      <UAlert
        v-else-if="error"
        color="error"
        variant="soft"
        :title="error"
        class="mb-6"
      />

      <!-- Empty State -->
      <div
        v-else-if="watchlist.length === 0"
        class="text-center py-24 bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-800"
      >
        <div class="text-6xl mb-6">💖</div>
        <h3 class="text-2xl font-semibold text-white mb-3">Your watchlist is empty</h3>
        <p class="text-gray-400 mb-8 max-w-md mx-auto">
          Found something interesting? Click the heart icon on any media card to save it here for later.
        </p>
        <UButton
          to="/"
          size="lg"
          icon="i-heroicons-magnifying-glass"
          label="Explore Media"
        />
      </div>

      <!-- Media Grid -->
      <div v-else class="space-y-6">
        <div class="flex items-center justify-between">
          <p class="text-gray-400 text-xs">
            {{ watchlist.length }} items saved
          </p>
        </div>

        <div
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        >
          <MediaCard
            v-for="item in watchlist"
            :key="item.id"
            :item="item"
            @click="openMediaDetail"
          />
        </div>
      </div>
    </div>

    <MediaDrawer
      :media="selectedMedia"
      :is-open="showMediaDetail"
      :preferred-source="preferredSource"
      @close="closeMediaDetail"
      @filter-cast="handleCastFilter"
    />
  </div>
</template>

<script setup lang="ts">
import type { MediaWithMetadata } from '@bloop/shared-types';

// Use the dashboard layout
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
});

const router = useRouter();
const { watchlist, loading, error, fetchWatchlist } = useWatchlist();
const { getUserConfig } = useUserConfig();

const showMediaDetail = ref(false);
const selectedMedia = ref<MediaWithMetadata | null>(null);
const preferredSource = ref<string | undefined>(undefined);

const loadUserPreferences = async () => {
  try {
    const userConfig = await getUserConfig();
    if (userConfig?.preferences?.preferredSource) {
      preferredSource.value = userConfig.preferences.preferredSource;
    }
  } catch (err) {
    console.warn('Failed to load user preferences:', err);
  }
};

const openMediaDetail = (item: MediaWithMetadata) => {
  selectedMedia.value = item;
  showMediaDetail.value = true;
};

const closeMediaDetail = () => {
  showMediaDetail.value = false;
  selectedMedia.value = null;
};

const handleCastFilter = (actorName: string) => {
  router.push({
    path: '/',
    query: { q: actorName }
  });
};

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchWatchlist(),
    loadUserPreferences()
  ]);
});
</script>
