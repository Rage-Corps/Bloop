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
                  <div class="flex items-start justify-between gap-4 mb-2">
                    <h3 class="text-xl font-bold text-white">
                      {{ media.name }}
                    </h3>
                    <UButton
                      v-if="media"
                      :icon="isWatchlisted ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'"
                      :color="isWatchlisted ? 'primary' : 'white'"
                      variant="ghost"
                      size="sm"
                      label="Watchlist"
                      @click="toggleWatchlist(media)"
                    />
                  </div>
                  <div class="flex items-center gap-4 text-sm text-gray-400">

                  <div v-if="media.duration" class="flex items-center text-primary-400 font-medium">
                    <UIcon name="i-heroicons-clock" class="mr-1" />
                    {{ media.duration }}
                  </div>
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

              <!-- Cast -->
              <div v-if="media.cast?.length">
                <h4 class="text-sm font-semibold text-gray-300 mb-2">
                  Cast
                </h4>
                  <div class="flex flex-wrap gap-2">
                    <UBadge
                      v-for="actor in media.cast"
                      :key="actor"
                      color="info"
                      variant="soft"
                      size="sm"
                      class="cursor-pointer hover:bg-info-500/20 transition-colors"
                      @click="$emit('filter-cast', actor)"
                    >
                      {{ actor }}
                    </UBadge>
                  </div>
              </div>

              <!-- Additional Info -->
              <div class="space-y-3">
                <div v-if="media.description" class="space-y-2">
                  <h4 class="text-sm font-semibold text-gray-300">
                    Description
                  </h4>
                  <p class="text-sm text-gray-400 leading-relaxed whitespace-pre-line">{{ media.description }}</p>
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
  preferredSource?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  'filter-cast': [actorName: string];
}>();

const { checkStatus, toggleWatchlist } = useWatchlist();
const isWatchlisted = computed(() => props.media ? checkStatus(props.media.id) : false);

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

// Function to set default source based on preferred source
const setDefaultSource = () => {
  if (!props.media?.sources?.length) {
    selectedSourceId.value = undefined;
    return;
  }

  // Try to find preferred source first
  if (props.preferredSource) {
    const preferredSourceObj = props.media.sources.find(
      (source) => source.sourceName === props.preferredSource
    );
    if (preferredSourceObj) {
      selectedSourceId.value = preferredSourceObj.id;
      console.log('Set default source to preferred:', props.preferredSource);
      return;
    }
  }

  // Fallback to first source if preferred not found
  selectedSourceId.value = props.media.sources[0]?.id;
  console.log('Set default source to first available:', props.media.sources[0]?.sourceName);
};

// Reset selected source when media changes
watch(
  () => props.media,
  (newMedia) => {
    console.log('Media prop changed:', newMedia);
    console.log('New media sources:', newMedia?.sources);
    setDefaultSource();
  }
);

// Set default source when drawer opens or preferred source changes
watch(
  [() => props.isOpen, () => props.preferredSource],
  ([isOpen]) => {
    console.log('Drawer isOpen changed:', isOpen);
    if (isOpen) {
      console.log('Drawer opened with media:', props.media);
      console.log('Preferred source:', props.preferredSource);
      setDefaultSource();
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
