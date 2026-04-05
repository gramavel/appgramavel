import { supabase } from "@/integrations/supabase/client";

export async function getFeedKPIs(days = 7) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceIso = since.toISOString();

  const { data: events } = await supabase
    .from("feed_events")
    .select("event_type, post_id")
    .gte("created_at", sinceIso);

  const impressions = events?.filter(e => e.event_type === "impression").length ?? 0;
  const clicks = events?.filter(e => e.event_type === "click").length ?? 0;
  const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(1) : "0";

  const { count: totalReactions } = await supabase
    .from("user_reactions")
    .select("*", { count: "exact", head: true })
    .gte("created_at", sinceIso);

  return { impressions, clicks, ctr, totalReactions: totalReactions ?? 0 };
}

export async function getPostsPerformance(days = 7) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceIso = since.toISOString();

  const { data: events } = await supabase
    .from("feed_events")
    .select("event_type, post_id, establishment_id")
    .gte("created_at", sinceIso);

  const map: Record<string, { impressions: number; clicks: number; estId: string | null }> = {};
  events?.forEach(e => {
    if (!e.post_id) return;
    if (!map[e.post_id]) map[e.post_id] = { impressions: 0, clicks: 0, estId: e.establishment_id };
    if (e.event_type === "impression") map[e.post_id].impressions++;
    if (e.event_type === "click") map[e.post_id].clicks++;
  });

  return Object.entries(map).map(([postId, d]) => ({
    postId,
    establishmentId: d.estId,
    impressions: d.impressions,
    clicks: d.clicks,
    ctr: d.impressions > 0 ? ((d.clicks / d.impressions) * 100).toFixed(1) : "0",
  }));
}

export async function getTopSearches(limit = 20) {
  return supabase
    .from("search_queries")
    .select("query, results")
    .order("results", { ascending: false })
    .limit(limit);
}

export async function getUserStats() {
  const { count: totalUsers } = await supabase
    .from("user_profiles")
    .select("*", { count: "exact", head: true });

  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("city");

  const cityMap: Record<string, number> = {};
  profiles?.forEach(p => {
    const c = p.city || "Desconhecido";
    cityMap[c] = (cityMap[c] || 0) + 1;
  });

  const topCities = Object.entries(cityMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([city, count]) => ({ city, count }));

  return { totalUsers: totalUsers ?? 0, topCities };
}

export async function getImpressionsByDay(days = 7) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data: events } = await supabase
    .from("feed_events")
    .select("created_at, event_type")
    .eq("event_type", "impression")
    .gte("created_at", since.toISOString());

  const dayMap: Record<string, number> = {};
  events?.forEach(e => {
    if (!e.created_at) return;
    const day = e.created_at.slice(0, 10);
    dayMap[day] = (dayMap[day] || 0) + 1;
  });

  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, impressions: dayMap[key] || 0 });
  }
  return result;
}

export async function getRouteInsights() {
  const { data } = await supabase
    .from("user_routes")
    .select("title, status")
    .eq("status", "completed");

  const map: Record<string, number> = {};
  data?.forEach(r => {
    map[r.title] = (map[r.title] || 0) + 1;
  });

  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([title, count]) => ({ title, count }));
}
