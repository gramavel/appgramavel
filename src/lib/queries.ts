import { QueryClient } from "@tanstack/react-query";
import { getPosts } from "@/services/posts";
import { getEstablishments } from "@/services/establishments";
import { getExperiences } from "@/services/experiences";

/**
 * Centralized query keys + queryFns + prefetch helpers.
 * Keep keys stable so different pages share the same cache entry.
 */

export type PostsFilter = {
  limit?: number;
  category?: string | null;
  search?: string | null;
};

export const queryKeys = {
  posts: (filter: PostsFilter = {}) =>
    [
      "posts",
      {
        limit: filter.limit ?? 30,
        category: filter.category ?? null,
        search: (filter.search ?? "").trim().toLowerCase() || null,
      },
    ] as const,
  establishments: () => ["establishments"] as const,
  experiences: () => ["experiences"] as const,
};

// ---------- Query functions ----------

export async function fetchPosts(filter: PostsFilter = {}) {
  const { data, error } = await getPosts(filter.limit ?? 30, {
    category: filter.category ?? null,
    search: filter.search ?? null,
  });
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
    queryKey: queryKeys.posts(),
    queryFn: () => fetchPosts(),
    staleTime: 5 * 60 * 1000,
  });
}

/** Prefetch posts for a specific filter (categoria/search). Idempotente. */
export function prefetchPostsFilter(qc: QueryClient, filter: PostsFilter) {
  qc.prefetchQuery({
    queryKey: queryKeys.posts(filter),
    queryFn: () => fetchPosts(filter),
    staleTime: 5 * 60 * 1000,
  });
}
