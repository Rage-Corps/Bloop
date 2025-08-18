<template>
  <div class="space-y-4">
    <!-- Main Filters -->
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

      <!-- Preferences Toggle -->
      <UButton
        color="gray"
        variant="ghost"
        icon="i-heroicons-cog-6-tooth"
        size="md"
        @click="showPreferences = !showPreferences"
      >
        Preferences
      </UButton>
    </div>

    <!-- User Preferences Section -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 max-h-0 transform -translate-y-2"
      enter-to-class="opacity-100 max-h-96 transform translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 max-h-96 transform translate-y-0"
      leave-to-class="opacity-0 max-h-0 transform -translate-y-2"
    >
      <div
        v-if="showPreferences"
        class="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-4 overflow-hidden"
      >
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Exclude Categories
          </label>
          <USelect
            :model-value="excludedCategories"
            :items="availableCategories"
            placeholder="Select categories to exclude..."
            multiple
            searchable
            size="md"
            class="w-full"
            @update:model-value="handleExcludedCategoriesChange"
          />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
defineProps({
  searchQuery: String,
  selectedCategories: Array,
  selectedSources: Array,
  availableCategories: Array,
  availableSources: Array,
  excludedCategories: Array,
  loading: Boolean,
});

const emit = defineEmits([
  'update:searchQuery',
  'update:selectedCategories',
  'update:selectedSources',
  'update:excludedCategories',
  'search',
  'filter',
  'refresh',
]);

// Local state for preferences accordion
const showPreferences = ref(false);

const handleSearchInput = (event) => {
  const value = event.target?.value || event;
  emit('update:searchQuery', value);
  emit('search');
};

const handleExcludedCategoriesChange = (value) => {
  emit('update:excludedCategories', value);
  emit('filter');
};
</script>
