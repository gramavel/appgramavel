import { QueryClient } from "@tanstack/react-query";
import { getPosts } from "@/services/posts";
import { getEstablishments } from "@/services/establishments";
import { getExperiences } from "@/services/experiences";

/**
 * Centralized query keys + queryFns + prefetch helpers.
 * Keep keys stable so different pages share the same cache entry.
 */

export const queryKeys = {
  posts: (limit = 30) => ["posts", { limit }] as const,
  establishments: () => ["establishments"] as const,
  experiences: () => ["experiences"] as const,
};

// ---------- Query functions ----------

export async function fetchPosts(limit = 30) {
  const { data, error } = await getPosts(limit);
  if (error) throw error;
  return data ?? [];
}

export async function fetchEstablishments() {
  const { data, error } = await getEstablishments();
  if (error) throw error;
  return data ?? [];
}

export async function fetchExperiences() {
  const { data, error } = await getExperiences();
  if (error) throw error;
  return data ?? [];
}

// ---------- Defaults ----------

/**
 * Tuned for a tourist guide app:
 * - Posts/establishments change infrequently → 5 min stale, 30 min gc.
 * - Skip refetch on every focus to avoid waterfalls when switching tabs.
 */
export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}

// ---------- Prefetch helpers ----------

export function prefetchExploreData(qc: QueryClient) {
  // Fire and forget; React Query dedupes if already in flight or fresh.
  qc.prefetchQuery({
    queryKey: queryKeys.establishments(),
    queryFn: fetchEstablishments,
    staleTime: 5 * 60 * 1000,
  });
  qc.prefetchQuery({
    queryKey: queryKeys.experiences(),
    queryFn: fetchExperiences,
    staleTime: 10 * 60 * 1000,
  });
}

export function prefetchFeedData(qc: QueryClient) {
  qc.prefetchQuery({
    queryKey: queryKeys.posts(30),
    queryFn: () => fetchPosts(30),
    staleTime: 5 * 60 * 1000,
  });
}
