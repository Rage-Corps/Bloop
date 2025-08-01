interface MediaItem {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  pageUrl: string;
  categories: string[];
}

interface MediaResponse {
  data: MediaItem[];
  total: number;
  filtered: number;
}

interface MediaQuery {
  limit?: number;
  offset?: number;
  source?: string;
}

export const useMedia = () => {
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchMedia = async (query: MediaQuery = {}): Promise<MediaResponse> => {
    loading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams();

      if (query.limit) params.append('limit', query.limit.toString());
      if (query.offset) params.append('offset', query.offset.toString());
      if (query.source) params.append('source', query.source);

      const response = await $fetch<MediaResponse>(
        `http://localhost:3001/api/media?${params.toString()}`
      );

      return response;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch media';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchMediaById = async (id: string): Promise<MediaItem> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<MediaItem>(
        `http://localhost:3001/media/${id}`
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
