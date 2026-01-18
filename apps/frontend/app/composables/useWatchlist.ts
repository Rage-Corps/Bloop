import type { MediaWithMetadata } from '@bloop/shared-types';

export const useWatchlist = () => {
  const config = useRuntimeConfig();
  const watchlist = useState<MediaWithMetadata[]>('watchlist', () => []);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const watchlistIds = computed(() => new Set(watchlist.value.map((m) => m.id)));

  const fetchWatchlist = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<MediaWithMetadata[]>(
        `${config.public.backendUrl}/api/watchlist`,
        {
          credentials: 'include',
        }
      );
      watchlist.value = response;
      return response;
    } catch (err: any) {
      console.warn('Failed to fetch watchlist:', err);
      if (err.status === 401) {
        error.value = 'Authentication required';
      } else {
        error.value = err.message || 'Failed to fetch watchlist';
      }
      return [];
    } finally {
      loading.value = false;
    }
  };

  const addToWatchlist = async (media: MediaWithMetadata) => {
    loading.value = true;
    error.value = null;

    try {
      await $fetch(`${config.public.backendUrl}/api/watchlist`, {
        method: 'POST',
        body: { mediaId: media.id },
        credentials: 'include',
      });
      
      // Update local state if not already present
      if (!watchlistIds.value.has(media.id)) {
        watchlist.value = [media, ...watchlist.value];
      }
    } catch (err: any) {
      console.error('Failed to add to watchlist:', err);
      error.value = err.message || 'Failed to add to watchlist';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const removeFromWatchlist = async (mediaId: string) => {
    loading.value = true;
    error.value = null;

    try {
      await $fetch(`${config.public.backendUrl}/api/watchlist/${mediaId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      // Update local state
      watchlist.value = watchlist.value.filter((m) => m.id !== mediaId);
    } catch (err: any) {
      console.error('Failed to remove from watchlist:', err);
      error.value = err.message || 'Failed to remove from watchlist';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const toggleWatchlist = async (media: MediaWithMetadata) => {
    if (watchlistIds.value.has(media.id)) {
      await removeFromWatchlist(media.id);
    } else {
      await addToWatchlist(media);
    }
  };

  const checkStatus = (mediaId: string) => {
    return watchlistIds.value.has(mediaId);
  };

  return {
    watchlist: readonly(watchlist),
    loading: readonly(loading),
    error: readonly(error),
    fetchWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
    checkStatus,
  };
};
