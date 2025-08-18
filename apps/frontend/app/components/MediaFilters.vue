<template>
  <div class="flex space-x-3 items-center">
    <UInput
      :model-value="searchQuery"
      placeholder="Search media..."
      icon="i-heroicons-magnifying-glass"
      size="md"
      type="search"
      inputmode="search"
      @input="handleSearchInput"
    />

    <USelect
      :model-value="selectedCategories"
      :items="availableCategories"
      placeholder="Categories"
      multiple
      searchable
      size="md"
      class="min-w-[200px]"
      @update:model-value="$emit('update:selectedCategories', $event)"
      @change="$emit('filter')"
    />

    <USelect
      :model-value="selectedSources"
      :items="availableSources"
      placeholder="Sources"
      multiple
      searchable
      size="md"
      class="min-w-[200px]"
      @update:model-value="$emit('update:selectedSources', $event)"
      @change="$emit('filter')"
    />

    <UButton
      color="primary"
      variant="soft"
      icon="i-heroicons-arrow-path"
      :loading="loading"
      @click="$emit('refresh')"
    >
      Refresh
    </UButton>
  </div>
</template>

<script setup>
defineProps({
  searchQuery: String,
  selectedCategories: Array,
  selectedSources: Array,
  availableCategories: Array,
  availableSources: Array,
  loading: Boolean,
});

const emit = defineEmits([
  'update:searchQuery',
  'update:selectedCategories',
  'update:selectedSources',
  'search',
  'filter',
  'refresh',
]);

const handleSearchInput = (event) => {
  const value = event.target?.value || event;
  emit('update:searchQuery', value);
  emit('search');
};
</script>
