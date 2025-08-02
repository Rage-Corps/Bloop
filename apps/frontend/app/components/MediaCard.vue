<template>
  <UCard
    class="group hover:shadow-lg transition-all duration-200 cursor-pointer"
    @click="$emit('click', item)"
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
        <span class="text-gray-500 text-xs">
          {{ item.sources?.length || 0 }} sources
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
</template>

<script setup lang="ts">
import type { Media } from '@bloop/shared-types';

interface Props {
  item: Media;
}

defineProps<Props>();
defineEmits<{
  click: [item: Media];
}>();

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiAxNkM5Ljc5IDE2IDggMTQuMjEgOCAxMlMxMC43OSA4IDEyIDhTMTYgOS43OSAxNiAxMlMxNC4yMSAxNiAxMiAxNloiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>