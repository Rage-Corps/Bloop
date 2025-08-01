<template>
  <div>
    <!-- Media Grid Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-bold text-white">Your Media Library 📚</h2>
        <p class="text-gray-400 mt-1">
          {{ mediaData?.total || 0 }} items total (showing {{ mediaData?.data?.length || 0 }})
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
        <UCard
          v-for="item in mediaData.data"
          :key="item.id"
          class="group hover:shadow-lg transition-all duration-200 cursor-pointer"
          @click="openMediaDetail(item)"
        >
          <!-- Thumbnail -->
          <div class="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden mb-3">
            <img
              :src="item.thumbnailUrl"
              :alt="item.name"
              class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
              @error="handleImageError"
            />
          </div>

          <!-- Media Info -->
          <div class="space-y-2">
            <h3
              class="font-semibold text-white text-sm line-clamp-2 group-hover:text-primary transition-colors"
            >
              {{ item.name }}
            </h3>

            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-500 text-xs">
                {{ item.categories?.length || 0 }} tags
              </span>
            </div>

            <!-- Categories -->
            <div v-if="item.categories?.length" class="flex flex-wrap gap-1">
              <UBadge
                v-for="category in item.categories.slice(0, 2)"
                :key="category"
                color="primary"
                variant="soft"
                size="xs"
              >
                {{ category }}
              </UBadge>
              <UBadge
                v-if="item.categories.length > 2"
                color="info"
                variant="soft"
                size="xs"
              >
                +{{ item.categories.length - 2 }}
              </UBadge>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Pagination -->
      <div class="flex justify-center mt-8">
        <UPagination
          :model-value="currentPage"
          :page-count="Math.ceil((mediaData.total || 0) / itemsPerPage)"
          :max="5"
          show-last
          show-first
          @update:model-value="navigateToPage"
        />
      </div>
    </div>

    <!-- Media Detail Modal -->
    <UModal v-model="showMediaDetail">
      <div v-if="selectedMedia" class="p-6">
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-xl font-semibold text-white">
            {{ selectedMedia.name }}
          </h3>
          <UButton
            color="info"
            variant="ghost"
            icon="i-heroicons-x-mark"
            @click="showMediaDetail = false"
          />
        </div>

        <div class="space-y-4">
          <img
            :src="selectedMedia.thumbnailUrl"
            :alt="selectedMedia.name"
            class="w-full max-h-64 object-cover rounded-lg"
          />

          <p class="text-gray-300">{{ selectedMedia.description }}</p>

          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="category in selectedMedia.categories"
              :key="category"
              color="primary"
              variant="soft"
            >
              {{ category }}
            </UBadge>
          </div>

          <div class="flex justify-end space-x-2 pt-4">
            <UButton
              :to="selectedMedia.pageUrl"
              external
              color="primary"
              icon="i-heroicons-arrow-top-right-on-square"
            >
              View Original
            </UButton>
          </div>
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { debounce } from 'lodash';

// Use the dashboard layout
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
});

const route = useRoute();
const router = useRouter();
const { fetchMedia, loading, error } = useMedia();

// Get current page from route params (default to 1)
const currentPage = computed(() => {
  const page = parseInt(route.params.page as string) || 1;
  return Math.max(1, page);
});

// Redirect to /dashboard if page is 1
watch(() => route.params.page, (newPage) => {
  const pageNum = parseInt(newPage as string);
  if (pageNum === 1) {
    router.replace('/dashboard');
  }
}, { immediate: true });

// Reactive data
const mediaData = ref<any>(null);
const itemsPerPage = 20;
const searchQuery = ref('');
const showMediaDetail = ref(false);
const selectedMedia = ref<any>(null);

// Computed
const offset = computed(() => (currentPage.value - 1) * itemsPerPage);

// Methods
const loadMedia = async () => {
  try {
    const response = await fetchMedia({
      limit: itemsPerPage,
      offset: offset.value,
      source: searchQuery.value || undefined,
    });
    mediaData.value = response;
  } catch (err) {
    console.error('Failed to load media:', err);
  }
};

const refreshMedia = () => {
  navigateToPage(1);
};

const navigateToPage = (page: number) => {
  if (page === 1) {
    router.push('/dashboard');
  } else {
    router.push(`/dashboard/${page}`);
  }
};

const debouncedSearch = debounce(() => {
  navigateToPage(1);
}, 500);

const openMediaDetail = (item: any) => {
  selectedMedia.value = item;
  showMediaDetail.value = true;
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiAxNkM5Ljc5IDE2IDggMTQuMjEgOCAxMlMxMC43OSA4IDEyIDhTMTYgOS43OSAxNiAxMlMxNC4yMSAxNiAxMiAxNloiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
};

// Watchers
watch(() => route.params.page, loadMedia, { immediate: true });
watch(searchQuery, () => {
  if (!searchQuery.value) {
    loadMedia();
  }
});

// Watch for invalid page numbers and redirect
watch(mediaData, (newData) => {
  if (newData && newData.total > 0) {
    const totalPages = Math.ceil(newData.total / itemsPerPage);
    const currentPageNum = currentPage.value;
    
    if (currentPageNum > totalPages && totalPages > 0) {
      // Redirect to the last valid page
      if (totalPages === 1) {
        router.replace('/dashboard');
      } else {
        router.replace(`/dashboard/${totalPages}`);
      }
    }
  }
});

// Lifecycle
onMounted(() => {
  loadMedia();
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>