export const useSources = () => {
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchSources = async (): Promise<string[]> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<string[]>(
        `${process.env.NUXT_PUBLIC_BACKEND_URL}/api/sources`
      );

      return response;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch sources';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading: readonly(loading),
    error: readonly(error),
    fetchSources,
  };
};
