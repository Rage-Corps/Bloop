<template>
  <UCard
    class="group hover:shadow-lg transition-all duration-200 cursor-pointer text-center"
    @click="$emit('click', item)"
  >
    <!-- Avatar/Image -->
    <div class="relative aspect-square bg-gray-100 rounded-full overflow-hidden mb-3 mx-auto w-32 border-2 border-gray-700 group-hover:border-primary transition-colors">
      <img
        v-if="item.imageUrl"
        :src="item.imageUrl"
        :alt="item.name"
        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
        @error="handleImageError"
      />
      <div v-else class="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
        <UIcon name="i-heroicons-user" class="w-12 h-12" />
      </div>
    </div>

    <!-- Star Info -->
    <div class="space-y-1">
      <h3
        class="font-semibold text-white text-sm group-hover:text-primary transition-colors flex items-center justify-center gap-2"
      >
        {{ item.name }}
        <UBadge
          v-if="item.mediaCount && item.mediaCount > 0"
          color="neutral"
          variant="soft"
          size="xs"
        >
          {{ item.mediaCount }}
        </UBadge>
      </h3>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { CastMember } from '@bloop/shared-types';

interface Props {
  item: CastMember;
}

defineProps<Props>();
defineEmits<{
  click: [item: CastMember];
}>();

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiAxNkM5Ljc5IDE2IDggMTQuMjEgOCAxMlMxMC43OSA4IDEyIDhTMTYgOS43OSAxNiAxMlMxNC4yMSAxNiAxMiAxNloiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
};
</script>
