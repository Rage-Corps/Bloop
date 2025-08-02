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
        <div
          class="flex items-center justify-between p-4 border-b border-gray-700"
        >
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
                <h3 class="text-xl font-bold text-white mb-2">
                  {{ media.name }}
                </h3>
                <div class="flex items-center gap-4 text-sm text-gray-400">
                  <div class="flex items-center">
                    <UIcon name="i-heroicons-tag" class="mr-1" />
                    {{ media.categories?.length || 0 }} tags
                  </div>
                  <div class="flex items-center">
                    <UIcon name="i-heroicons-link" class="mr-1" />
                    {{ media.sources?.length || 0 }} sources
                  </div>
                </div>
              </div>

              <!-- Categories -->
              <div v-if="media.categories?.length">
                <h4 class="text-sm font-semibold text-gray-300 mb-2">
                  Categories
                </h4>
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

              <!-- Sources -->
              <div v-if="media.sources?.length">
                <h4 class="text-sm font-semibold text-gray-300 mb-2">
                  Sources
                </h4>
                <div class="space-y-2">
                  <div
                    v-for="source in media.sources"
                    :key="source.id"
                    class="flex items-center justify-between p-2 bg-gray-800 rounded-lg"
                  >
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-white truncate">
                        {{ source.sourceName }}
                      </p>
                      <p class="text-xs text-gray-400 truncate">
                        {{ source.url }}
                      </p>
                    </div>
                    <UButton
                      :to="source.url"
                      target="_blank"
                      color="primary"
                      variant="soft"
                      size="xs"
                      icon="i-heroicons-arrow-top-right-on-square"
                    >
                      Visit
                    </UButton>
                  </div>
                </div>
              </div>

              <!-- Additional Info -->
              <div class="space-y-3">
                <div v-if="media.description" class="space-y-2">
                  <h4 class="text-sm font-semibold text-gray-300">
                    Description
                  </h4>
                  <p class="text-sm text-gray-400">{{ media.description }}</p>
                </div>

                <div v-if="media.createdAt" class="space-y-2">
                  <h4 class="text-sm font-semibold text-gray-300">Created</h4>
                  <p class="text-sm text-gray-400">
                    {{ formatDate(media.createdAt) }}
                  </p>
                </div>

                <div v-if="media.dimensions" class="space-y-2">
                  <h4 class="text-sm font-semibold text-gray-300">
                    Dimensions
                  </h4>
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
  </UDrawer>
</template>

<script setup lang="ts">
import type { MediaWithMetadata } from '@bloop/shared-types';

interface Props {
  media: MediaWithMetadata | null;
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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
</script>
