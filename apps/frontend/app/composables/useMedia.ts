import type {
  MediaWithMetadata,
  MediaListResponse,
  MediaQuery,
} from '@bloop/shared-types';

export const useMedia = () => {
  const config = useRuntimeConfig();
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchMedia = async (
    query: MediaQuery = {}
  ): Promise<MediaListResponse> => {
    loading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams();

      if (query.limit) params.append('limit', query.limit.toString());
      if (query.offset) params.append('offset', query.offset.toString());
      if (query.name) params.append('name', query.name);

      // Handle array parameters for categories and sources
      if (query.categories && query.categories.length > 0) {
        params.append('categories', query.categories.join(','));
      }

      if (query.sources && query.sources.length > 0) {
        params.append('sources', query.sources.join(','));
      }

      if (query.excludedCategories && query.excludedCategories.length > 0) {
        params.append('excludedCategories', query.excludedCategories.join(','));
      }

      const queryString = `${config.public.backendUrl}/api/media?${params.toString()}`;
      console.log('QUERY:', queryString);
      const response = await $fetch<MediaListResponse>(queryString);

      return response;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch media';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchMediaById = async (id: string): Promise<MediaWithMetadata> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<MediaWithMetadata>(
        `${config.public.backendUrl}/api/media/${id}`
      );
      return response;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch media item';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading: readonly(loading),
    error: readonly(error),
    fetchMedia,
    fetchMediaById,
  };
};
