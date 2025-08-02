<template>
  <div
    class="fixed inset-y-0 right-0 w-[70vw] bg-gray-900 border-l border-gray-700 shadow-2xl transform transition-transform duration-300 ease-in-out z-50"
    :class="{ 'translate-x-0': isOpen, 'translate-x-full': !isOpen }"
  >
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b border-gray-700">
      <h2 class="text-lg font-semibold text-white">Media Details</h2>
      <UButton
        icon="i-heroicons-x-mark"
        color="info"
        variant="ghost"
        size="sm"
        @click="$emit('close')"
      />
    </div>

    <!-- Content -->
    <div class="p-4 overflow-y-auto h-full pb-20">
      <div v-if="media" class="space-y-6">
        <!-- Media Info -->
        <div class="space-y-4">
          <div>
            <h3 class="text-xl font-bold text-white mb-2">{{ media.name }}</h3>

            <div class="flex items-center text-sm text-gray-400">
              <UIcon name="i-heroicons-tag" class="mr-1" />
              {{ media.categories?.length || 0 }} tags
            </div>
          </div>

          <!-- Categories -->
          <div v-if="media.categories?.length">
            <h4 class="text-sm font-semibold text-gray-300 mb-2">Categories</h4>
            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="category in media.categories"
                :key="category"
                color="primary"
                variant="soft"
                size="sm"
              >
                {{ category }}
              </UBadge>
            </div>
          </div>

          <!-- Additional Info -->
          <div class="space-y-3">
            <div v-if="media.description" class="space-y-2">
              <h4 class="text-sm font-semibold text-gray-300">Description</h4>
              <p class="text-sm text-gray-400">{{ media.description }}</p>
            </div>

            <div v-if="media.createdAt" class="space-y-2">
              <h4 class="text-sm font-semibold text-gray-300">Created</h4>
              <p class="text-sm text-gray-400">
                {{ formatDate(media.createdAt) }}
              </p>
            </div>

            <div v-if="media.dimensions" class="space-y-2">
              <h4 class="text-sm font-semibold text-gray-300">Dimensions</h4>
              <p class="text-sm text-gray-400">
                {{ media.dimensions.width }} x {{ media.dimensions.height }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface MediaItem {
  id: string | number;
  name: string;
  thumbnailUrl: string;
  categories?: string[];
  description?: string;
  fileSize?: number;
  createdAt?: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

interface Props {
  media: MediaItem | null;
  isOpen: boolean;
}

defineProps<Props>();
defineEmits<{
  close: [];
}>();

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
</script>
