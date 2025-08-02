<template>
  <div>
    <!-- Main Content Area -->
    <div>
      <!-- Media Grid Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-2xl font-bold text-white">Your Media Library 📚</h2>
          <p class="text-gray-400 mt-1">
            {{ mediaData?.total || 0 }} items total (showing
            {{ mediaData?.data?.length || 0 }})
          </p>
        </div>

        <!-- Search and Filters -->
        <div class="flex space-x-3">
          <UInput
            v-model="searchQuery"
            placeholder="Search media..."
            icon="i-heroicons-magnifying-glass"
            size="md"
            @input="debouncedSearch"
          />
          <UButton
            color="primary"
            variant="soft"
            icon="i-heroicons-arrow-path"
            :loading="loading"
            @click="refreshMedia"
          >
            Refresh
          </UButton>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading && !mediaData" class="text-center py-12">
        <UIcon
          name="i-heroicons-arrow-path"
          class="animate-spin text-4xl text-primary mb-4"
        />
        <p class="text-gray-400">Loading your media...</p>
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
        v-else-if="mediaData && mediaData.data.length === 0"
        class="text-center py-16"
      >
        <div class="text-6xl mb-4">🌊</div>
        <h3 class="text-xl font-semibold text-white mb-2">No media found</h3>
        <p class="text-gray-400 mb-6">
          {{
            searchQuery
              ? 'Try adjusting your search terms'
              : 'Start by adding some media to your collection'
          }}
        </p>
      </div>

      <!-- Media Grid -->
      <div v-else-if="mediaData" class="space-y-6">
        <div
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        >
          <MediaCard
            v-for="item in mediaData.data"
            :key="item.id"
            :item="item"
            @click="openMediaDetail"
          />
        </div>

        <!-- Pagination -->
        <div class="flex justify-center mt-8 pb-8">
          <UPagination
            :total="mediaData.total"
            :items-per-page="20"
            :sibling-count="2"
            :to="navigateToPage"
            color="primary"
          />
        </div>
      </div>
    </div>

    <MediaDrawer
      :media="selectedMedia"
      :is-open="showMediaDetail"
      @close="closeMediaDetail"
    />
  </div>
</template>

<script setup lang="ts">
import { debounce } from 'lodash';
import type { Media, MediaWithMetadata, MediaListResponse } from '@bloop/shared-types';

// Use the dashboard layout
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
});

const router = useRouter();
const route = useRoute();
const { fetchMedia, loading, error } = useMedia();

// Get current page from query parameters, default to 1
const currentPage = computed(() => parseInt(route.query.page as string) || 1);

// Reactive data
const mediaData = ref<MediaListResponse | null>(null);
const itemsPerPage = 20;
const searchQuery = ref('');
const showMediaDetail = ref(false);
const selectedMedia = ref<MediaWithMetadata | null>(null);

// Computed
const offset = computed(() => (currentPage.value - 1) * itemsPerPage);

// Methods
const loadMedia = async () => {
  console.log('OFFSET', offset.value);
  try {
    const response = await fetchMedia({
      limit: itemsPerPage,
      offset: offset.value,
      source: searchQuery.value || undefined,
    });
    mediaData.value = response;
    console.log('RES', response);
  } catch (err) {
    console.error('Failed to load media:', err);
  }
};

const refreshMedia = () => {
  router.push({ query: { page: 1 } });
  loadMedia();
};

const navigateToPage = (page: number) => {
  return {
    query: {
      page,
    },
  };
};

const debouncedSearch = debounce(() => {
  router.push({ query: { page: 1 } });
  loadMedia();
}, 500);

const openMediaDetail = (item: Media) => {
  selectedMedia.value = item as MediaWithMetadata;
  showMediaDetail.value = true;
};

const closeMediaDetail = () => {
  showMediaDetail.value = false;
  selectedMedia.value = null;
};

// Lifecycle
onMounted(() => {
  loadMedia();
});

watch(searchQuery, () => {
  if (!searchQuery.value) {
    loadMedia();
  }
});

watch(
  () => route.query.page,
  () => {
    loadMedia();
  }
);
</script>
