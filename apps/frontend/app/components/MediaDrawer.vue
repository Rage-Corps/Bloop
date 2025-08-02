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
            <!-- Video Player -->
            <div v-if="media.sources?.length" class="space-y-4">
              <div class="space-y-2">
                <h4 class="text-sm font-semibold text-gray-300">
                  Video Player
                </h4>
                <USelect
                  v-model="selectedSourceId"
                  :items="sourceOptions"
                  placeholder="Select a source to play"
                  class="w-full"
                />
              </div>
              <div
                v-if="selectedSource"
                class="bg-black rounded-lg overflow-hidden"
              >
                <iframe
                  :src="selectedSource.url"
                  class="w-full h-96"
                  frameborder="0"
                  allowfullscreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            </div>

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

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
}>();
const selectedSourceId = ref<string | undefined>(undefined);

const sourceOptions = computed(() => {
  console.log('Computing sourceOptions, media:', props.media);
  console.log('Sources array:', props.media?.sources);
  console.log('Sources length:', props.media?.sources?.length);

  if (!props.media?.sources?.length) {
    console.log('No sources found, returning empty array');
    return [];
  }

  const options = props.media.sources.map((source) => ({
    label: source.sourceName || 'Unnamed Source',
    value: source.id,
  }));

  console.log('Generated source options:', options);
  return options;
});

const selectedSource = computed(() => {
  if (!selectedSourceId.value || !props.media?.sources?.length) return null;

  return props.media.sources.find(
    (source) => source.id === selectedSourceId.value
  );
});

// Reset selected source when media changes
watch(
  () => props.media,
  (newMedia) => {
    console.log('Media prop changed:', newMedia);
    console.log('New media sources:', newMedia?.sources);
    selectedSourceId.value = null;
  }
);

// Debug when drawer opens
watch(
  () => props.isOpen,
  (isOpen) => {
    console.log('Drawer isOpen changed:', isOpen);
    if (isOpen) {
      console.log('Drawer opened with media:', props.media);
    }
  }
);

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
