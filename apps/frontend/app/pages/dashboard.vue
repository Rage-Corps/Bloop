<template>
  <div>
    <!-- Main Content Area -->
    <div>
      <!-- Media Grid Header -->
      <div class="mb-6">
        <!-- Search and Filters -->
        <MediaFilters
          v-model:search-query="searchQuery"
          v-model:selected-categories="selectedCategories"
          v-model:selected-sources="selectedSources"
          v-model:excluded-categories="excludedCategories"
          v-model:preferred-source="preferredSource"
          v-model:items-per-page="itemsPerPage"
          :available-categories="availableCategories"
          :available-sources="availableSources"
          :loading="loading"
          @search="debouncedSearch"
          @filter="filterMedia"
          @refresh="refreshMedia"
        />
        <div class="mt-2">
          <p class="text-gray-400 text-xs">
            {{ mediaData?.total || 0 }} items total (showing
            {{ mediaData?.data?.length || 0 }})
          </p>
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
            :items-per-page="itemsPerPage"
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
      :preferred-source="preferredSource"
      @close="closeMediaDetail"
      @filter-cast="handleCastFilter"
    />
  </div>
</template>

<script setup lang="ts">
import { debounce } from 'lodash-es';
import type { MediaListResponse, MediaWithMetadata } from '@bloop/shared-types';

// Use the dashboard layout
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
});

const router = useRouter();
const route = useRoute();
const { fetchMedia, loading, error } = useMedia();
const { fetchCategories } = useCategories();
const { fetchSources } = useSources();
const { getUserConfig } = useUserConfig();

// Get current page and search query from query parameters
const currentPage = computed(() => parseInt(route.query.page as string) || 1);
const initialSearchQuery = route.query.q as string || '';

// Reactive data
const mediaData = ref<MediaListResponse | null>(null);
const itemsPerPage = ref(20);
const searchQuery = ref(initialSearchQuery);
const showMediaDetail = ref(false);
const selectedMedia = ref<MediaWithMetadata | null>(null);

// Filter data
const selectedCategories = ref<string[]>([]);
const selectedSources = ref<string[]>([]);
const excludedCategories = ref<string[]>([]);
const preferredSource = ref<string | undefined>(undefined);
const availableCategories = ref<{ label: string; value: string }[]>([]);
const availableSources = ref<{ label: string; value: string }[]>([]);

// Computed
const offset = computed(() => (currentPage.value - 1) * itemsPerPage.value);

// Load filter options
const loadCategories = async () => {
  try {
    const data = await fetchCategories();
    availableCategories.value = data.map((category) => ({
      label: category,
      value: category,
    }));
  } catch (err) {
    console.error('Failed to load categories:', err);
  }
};

const loadSources = async () => {
  try {
    const data = await fetchSources();
    availableSources.value = data.map((source) => ({
      label: source,
      value: source,
    }));
  } catch (err) {
    console.error('Failed to load sources:', err);
  }
};

const loadUserPreferences = async () => {
  try {
    const userConfig = await getUserConfig();
    if (userConfig?.preferences) {
      const {
        excludedCategories: userExcludedCategories,
        preferredSource: userPreferredSource,
        itemsPerPage: userItemsPerPage,
      } = userConfig.preferences;

      if (userExcludedCategories?.length) {
        excludedCategories.value = userExcludedCategories;
      }

      if (userPreferredSource) {
        preferredSource.value = userPreferredSource;
      }

      if (userItemsPerPage) {
        itemsPerPage.value = userItemsPerPage;
      }

      console.log('Loaded user preferences:', userConfig.preferences);
    }
  } catch (err) {
    console.warn('Failed to load user preferences:', err);
    // Don't block the app if preferences can't be loaded
  }
};

// Methods
const loadMedia = async () => {
  try {
    const query: any = {
      limit: itemsPerPage.value,
      offset: offset.value,
      name: searchQuery.value || undefined,
      categories:
        selectedCategories.value.length > 0
          ? selectedCategories.value
          : undefined,
      sources:
        selectedSources.value.length > 0 ? selectedSources.value : undefined,
      excludedCategories:
        excludedCategories.value.length > 0
          ? excludedCategories.value
          : undefined,
    };
    const response = await fetchMedia(query);
    mediaData.value = response;
  } catch (err) {
    console.error('Failed to load media:', err);
  }
};

const filterMedia = () => {
  router.push({
    query: {
      ...route.query,
      page: 1,
      q: searchQuery.value || undefined,
    },
  });
};

const refreshMedia = () => {
  selectedCategories.value = [];
  selectedSources.value = [];
  excludedCategories.value = [];
  preferredSource.value = undefined;
  searchQuery.value = '';
  router.push({ query: { page: 1 } });
};

const navigateToPage = (page: number) => {
  return {
    query: {
      ...route.query,
      page,
    },
  };
};

const debouncedSearch = debounce(() => {
  router.push({
    query: {
      ...route.query,
      page: 1,
      q: searchQuery.value || undefined,
    },
  });
}, 500);

const openMediaDetail = (item: MediaWithMetadata) => {
  selectedMedia.value = item;
  showMediaDetail.value = true;
};

const closeMediaDetail = () => {
  showMediaDetail.value = false;
  selectedMedia.value = null;
};

const handleCastFilter = (actorName: string) => {
  searchQuery.value = actorName;
  showMediaDetail.value = false;
  filterMedia();
};

// Lifecycle
onMounted(async () => {
  // Load user preferences first, then load data with those preferences applied
  await loadUserPreferences();

  loadMedia();
  loadCategories();
  loadSources();
});

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
    loadMedia();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
);
</script>
