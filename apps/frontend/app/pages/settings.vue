<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-white">Settings</h1>
      <p class="text-gray-400 text-sm mt-1">Manage application data and background tasks</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Scraping Section -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-cloud-arrow-down" class="w-5 h-5 text-primary" />
            <h2 class="font-bold text-white">Full Content Scrape</h2>
          </div>
        </template>
        <p class="text-sm text-gray-400 mb-4">
          Triggers a full scrape of the configured base URL. This will discover new content and update existing entries.
          Warning: This may take a long time depending on the amount of content.
        </p>
        <div class="flex items-center gap-4">
          <UButton
            icon="i-heroicons-play"
            label="Start Full Scrape"
            color="primary"
            :loading="scrapingLoading"
            @click="onStartFullScrape"
          />
        </div>
      </UCard>

      <!-- Image Discovery Section -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-sparkles" class="w-5 h-5 text-primary" />
            <h2 class="font-bold text-white">Star Image Discovery</h2>
          </div>
        </template>
        <p class="text-sm text-gray-400 mb-4">
          Searches for and updates images for all cast members in the database.
          This will overwrite existing images with fresh discoveries from supported sources.
        </p>
        <div class="flex items-center gap-4">
          <UButton
            icon="i-heroicons-play"
            label="Start Image Discovery"
            color="primary"
            :loading="discoveryLoading"
            @click="onStartImageDiscovery"
          />
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard'
});

const { triggerFullScrape } = useMedia();
const { discoverImages } = useCastMembers();
const toast = useToast();

const scrapingLoading = ref(false);
const discoveryLoading = ref(false);

const onStartFullScrape = async () => {
  scrapingLoading.value = true;
  try {
    await triggerFullScrape();
    toast.add({
      title: 'Scrape Started',
      description: 'The full scrape workflow has been triggered successfully.',
      color: 'primary'
    });
  } catch (err: any) {
    toast.add({
      title: 'Failed to Start Scrape',
      description: err.message || 'An error occurred while starting the scrape.',
      color: 'red'
    });
  } finally {
    scrapingLoading.value = false;
  }
};

const onStartImageDiscovery = async () => {
  discoveryLoading.value = true;
  try {
    await discoverImages();
    toast.add({
      title: 'Discovery Started',
      description: 'The star image discovery workflow has been triggered successfully.',
      color: 'primary'
    });
  } catch (err: any) {
    toast.add({
      title: 'Failed to Start Discovery',
      description: err.message || 'An error occurred while starting the image discovery.',
      color: 'red'
    });
  } finally {
    discoveryLoading.value = false;
  }
};
</script>
