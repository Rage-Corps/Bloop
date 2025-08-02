<template>
  <UDrawer
    :open="isOpen"
    direction="right"
    should-scale-background
    @update:open="handleOpenChange"
  >
    <template #content>
      <div class="w-[70vw] h-full bg-gray-900">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 class="text-lg font-semibold text-white">Media Details</h2>
          <UButton
            icon="i-heroicons-x-mark"
            color="gray"
            variant="ghost"
            size="sm"
            @click="$emit('close')"
          />
        </div>

        <!-- Content -->
        <div class="p-4 overflow-y-auto h-full pb-20">
          <div v-if="media" class="space-y-6">
            <!-- Media Image -->
            <div class="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
              <img
                :src="media.thumbnailUrl"
                :alt="media.name"
                class="w-full h-full object-contain"
                @error="handleImageError"
              />
            </div>

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

                <div v-if="media.fileSize" class="space-y-2">
                  <h4 class="text-sm font-semibold text-gray-300">File Size</h4>
                  <p class="text-sm text-gray-400">{{ formatFileSize(media.fileSize) }}</p>
                </div>

                <div v-if="media.createdAt" class="space-y-2">
                  <h4 class="text-sm font-semibold text-gray-300">Created</h4>
                  <p class="text-sm text-gray-400">{{ formatDate(media.createdAt) }}</p>
                </div>

                <div v-if="media.dimensions" class="space-y-2">
                  <h4 class="text-sm font-semibold text-gray-300">Dimensions</h4>
                  <p class="text-sm text-gray-400">{{ media.dimensions.width }} x {{ media.dimensions.height }}</p>
                </div>
              </div>

              <!-- Actions -->
              <div class="pt-4 border-t border-gray-700 space-y-3">
                <UButton
                  color="primary"
                  variant="solid"
                  size="sm"
                  block
                  icon="i-heroicons-eye"
                >
                  View Full Size
                </UButton>
                <UButton
                  color="gray"
                  variant="soft"
                  size="sm"
                  block
                  icon="i-heroicons-arrow-down-tray"
                >
                  Download
                </UButton>
                <UButton
                  color="red"
                  variant="soft"
                  size="sm"
                  block
                  icon="i-heroicons-trash"
                >
                  Delete
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UDrawer>
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

const emit = defineEmits<{
  close: [];
}>();

const handleOpenChange = (open: boolean) => {
  if (!open) {
    emit('close');
  }
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiAxNkM5Ljc5IDE2IDggMTQuMjEgOCAxMlMxMC43OSA4IDEyIDhTMTYgOS43OSAxNiAxMlMxNC4yMSAxNiAxMiAxNloiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
};

const formatFileSize = (bytes: number) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
</script>