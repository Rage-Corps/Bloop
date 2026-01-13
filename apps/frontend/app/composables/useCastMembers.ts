export const useCastMembers = () => {
  const config = useRuntimeConfig();
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchCastMembers = async (): Promise<string[]> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<string[]>(
        `${config.public.backendUrl}/api/cast`
      );
      return response;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch cast members';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading: readonly(loading),
    error: readonly(error),
    fetchCastMembers,
  };
};
