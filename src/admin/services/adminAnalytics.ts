import { supabase } from "@/integrations/supabase/client";

// ---------- helpers ----------
function periodRange(days: number | "all") {
  const now = new Date();
  if (days === "all") {
    return { sinceIso: "1970-01-01T00:00:00Z", prevSinceIso: null, prevUntilIso: null };
  }
  const since = new Date();
  since.setDate(now.getDate() - days);
  const prevSince = new Date();
  prevSince.setDate(now.getDate() - days * 2);
  return {
    sinceIso: since.toISOString(),
    prevSinceIso: prevSince.toISOString(),
    prevUntilIso: since.toISOString(),
  };
}

function pctDelta(curr: number, prev: number): number | null {
  if (prev === 0) return curr > 0 ? 100 : null;
  return Math.round(((curr - prev) / prev) * 1000) / 10;
}

// ---------- KPIs with deltas ----------
export async function getFeedKPIs(days: number | "all" = 7) {
  const { sinceIso, prevSinceIso, prevUntilIso } = periodRange(days);

  const { data: events } = await supabase
    .from("feed_events")
    .select("event_type, user_id, post_id, created_at")
    .gte("created_at", sinceIso);

  const impressions = events?.filter(e => e.event_type === "impression").length ?? 0;
  const clicks = events?.filter(e => e.event_type === "click").length ?? 0;
  const uniqueClickUsers = new Set(
    (events ?? []).filter(e => e.event_type === "click" && e.user_id).map(e => e.user_id)
  ).size;
  const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(1) : "0";
  const activePosts = new Set(
    (events ?? []).filter(e => e.event_type === "impression" && e.post_id).map(e => e.post_id)
  ).size;

  const { count: totalReactions } = await supabase
    .from("user_reactions")
    .select("*", { count: "exact", head: true })
    .gte("created_at", sinceIso);

  const { count: savedCount } = await supabase
    .from("user_saved_posts")
    .select("*", { count: "exact", head: true })
    .gte("created_at", sinceIso);

  // previous period for deltas
  let prevImpressions = 0, prevClicks = 0, prevReactions = 0, prevSaved = 0, prevActive = 0, prevUnique = 0;
  let prevCtr = 0;
  if (prevSinceIso && prevUntilIso) {
    const { data: prevEvents } = await supabase
      .from("feed_events")
      .select("event_type, user_id, post_id")
      .gte("created_at", prevSinceIso)
      .lt("created_at", prevUntilIso);

    prevImpressions = prevEvents?.filter(e => e.event_type === "impression").length ?? 0;
    prevClicks = prevEvents?.filter(e => e.event_type === "click").length ?? 0;
    prevUnique = new Set(
      (prevEvents ?? []).filter(e => e.event_type === "click" && e.user_id).map(e => e.user_id)
    ).size;
    prevActive = new Set(
      (prevEvents ?? []).filter(e => e.event_type === "impression" && e.post_id).map(e => e.post_id)
    ).size;
    prevCtr = prevImpressions > 0 ? (prevClicks / prevImpressions) * 100 : 0;

    const { count: pr } = await supabase
      .from("user_reactions")
      .select("*", { count: "exact", head: true })
      .gte("created_at", prevSinceIso)
      .lt("created_at", prevUntilIso);
    prevReactions = pr ?? 0;

    const { count: ps } = await supabase
      .from("user_saved_posts")
      .select("*", { count: "exact", head: true })
      .gte("created_at", prevSinceIso)
      .lt("created_at", prevUntilIso);
    prevSaved = ps ?? 0;
  }

  return {
    impressions,
    clicks,
    uniqueClickUsers,
    ctr,
    totalReactions: totalReactions ?? 0,
    savedCount: savedCount ?? 0,
    activePosts,
    deltas: {
      impressions: pctDelta(impressions, prevImpressions),
      clicks: pctDelta(clicks, prevClicks),
      uniqueClickUsers: pctDelta(uniqueClickUsers, prevUnique),
      ctr: pctDelta(parseFloat(ctr), prevCtr),
      totalReactions: pctDelta(totalReactions ?? 0, prevReactions),
      savedCount: pctDelta(savedCount ?? 0, prevSaved),
      activePosts: pctDelta(activePosts, prevActive),
    },
  };
}

// ---------- Posts performance enriched ----------
export async function getPostsPerformance(days: number | "all" = 7) {
  const { sinceIso } = periodRange(days);

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

  const postIds = Object.keys(map);
  if (postIds.length === 0) return [];

  // fetch post details + establishment
  const { data: posts } = await supabase
    .from("posts")
    .select("id, image, caption, establishment:establishments(id, name, slug, category, logo_url)")
    .in("id", postIds);

  // reactions count per post
  const { data: reactionRows } = await supabase
    .from("reactions")
    .select("post_id, count")
    .in("post_id", postIds);

  const reactionsByPost: Record<string, number> = {};
  reactionRows?.forEach(r => {
    reactionsByPost[r.post_id] = (reactionsByPost[r.post_id] || 0) + (r.count ?? 0);
  });

  return postIds.map(id => {
    const d = map[id];
    const post = posts?.find(p => p.id === id);
    return {
      postId: id,
      establishmentId: d.estId,
      establishmentName: (post?.establishment as any)?.name ?? "—",
      establishmentSlug: (post?.establishment as any)?.slug ?? null,
      establishmentCategory: (post?.establishment as any)?.category ?? "—",
      image: post?.image ?? (post?.establishment as any)?.logo_url ?? null,
      caption: post?.caption ?? "",
      impressions: d.impressions,
      clicks: d.clicks,
      reactions: reactionsByPost[id] ?? 0,
      ctr: d.impressions > 0 ? ((d.clicks / d.impressions) * 100).toFixed(1) : "0",
    };
  }).sort((a, b) => b.impressions - a.impressions);
}

// ---------- Top searches ----------
export async function getTopSearches(limit = 20) {
  return supabase
    .from("search_queries")
    .select("query, results")
    .order("results", { ascending: false })
    .limit(limit);
}

// ---------- User stats ----------
export async function getUserStats() {
  const { count: totalUsers } = await supabase
    .from("user_profiles")
    .select("*", { count: "exact", head: true });

  const { data: profiles } = await supabase.from("user_profiles").select("city");

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

// ---------- Impressions vs Clicks by day ----------
export async function getImpressionsAndClicksByDay(days = 7) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data: events } = await supabase
    .from("feed_events")
    .select("created_at, event_type")
    .in("event_type", ["impression", "click"])
    .gte("created_at", since.toISOString());

  const dayMap: Record<string, { impressions: number; clicks: number }> = {};
  events?.forEach(e => {
    if (!e.created_at) return;
    const day = e.created_at.slice(0, 10);
    if (!dayMap[day]) dayMap[day] = { impressions: 0, clicks: 0 };
    if (e.event_type === "impression") dayMap[day].impressions++;
    if (e.event_type === "click") dayMap[day].clicks++;
  });

  const result: { date: string; impressions: number; clicks: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, impressions: dayMap[key]?.impressions ?? 0, clicks: dayMap[key]?.clicks ?? 0 });
  }
  return result;
}

// kept for backward compatibility
export async function getImpressionsByDay(days = 7) {
  const data = await getImpressionsAndClicksByDay(days);
  return data.map(d => ({ date: d.date, impressions: d.impressions }));
}

// ---------- Engagement by weekday ----------
export async function getEngagementByWeekday(days: number | "all" = 30) {
  const { sinceIso } = periodRange(days);

  const { data: events } = await supabase
    .from("feed_events")
    .select("created_at, event_type")
    .gte("created_at", sinceIso);

  const labels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const counts = labels.map((label, idx) => ({
    weekday: label,
    impressions: 0,
    clicks: 0,
    _idx: idx,
  }));

  events?.forEach(e => {
    if (!e.created_at) return;
    const dow = new Date(e.created_at).getDay();
    if (e.event_type === "impression") counts[dow].impressions++;
    if (e.event_type === "click") counts[dow].clicks++;
  });

  // Reorder: Mon-Sun
  const order = [1, 2, 3, 4, 5, 6, 0];
  return order.map(i => ({
    weekday: counts[i].weekday,
    impressions: counts[i].impressions,
    clicks: counts[i].clicks,
  }));
}

// ---------- Reactions breakdown ----------
export async function getReactionsBreakdown(days: number | "all" = 7) {
  const { sinceIso } = periodRange(days);

  const { data } = await supabase
    .from("user_reactions")
    .select("emoji")
    .gte("created_at", sinceIso);

  const map: Record<string, number> = {};
  data?.forEach(r => {
    map[r.emoji] = (map[r.emoji] || 0) + 1;
  });

  const total = Object.values(map).reduce((s, n) => s + n, 0);
  return Object.entries(map)
    .map(([emoji, count]) => ({ emoji, count, pct: total > 0 ? (count / total) * 100 : 0 }))
    .sort((a, b) => b.count - a.count);
}

// ---------- Top establishments ----------
export async function getTopEstablishmentsInFeed(days: number | "all" = 7, limit = 5) {
  const { sinceIso } = periodRange(days);

  const { data: events } = await supabase
    .from("feed_events")
    .select("event_type, establishment_id")
    .gte("created_at", sinceIso);

  const map: Record<string, { impressions: number; clicks: number }> = {};
  events?.forEach(e => {
    if (!e.establishment_id) return;
    if (!map[e.establishment_id]) map[e.establishment_id] = { impressions: 0, clicks: 0 };
    if (e.event_type === "impression") map[e.establishment_id].impressions++;
    if (e.event_type === "click") map[e.establishment_id].clicks++;
  });

  const ids = Object.keys(map);
  if (ids.length === 0) return [];

  const { data: ests } = await supabase
    .from("establishments")
    .select("id, name, category, logo_url, slug")
    .in("id", ids);

  return ids
    .map(id => {
      const e = ests?.find(x => x.id === id);
      const d = map[id];
      return {
        establishmentId: id,
        name: e?.name ?? "—",
        category: e?.category ?? "—",
        slug: e?.slug ?? null,
        logo_url: e?.logo_url ?? null,
        impressions: d.impressions,
        clicks: d.clicks,
        ctr: d.impressions > 0 ? ((d.clicks / d.impressions) * 100).toFixed(1) : "0",
      };
    })
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, limit);
}

// ---------- CTR by category ----------
export async function getCategoriesPerformance(days: number | "all" = 7) {
  const { sinceIso } = periodRange(days);

  const { data: events } = await supabase
    .from("feed_events")
    .select("event_type, establishment_id")
    .gte("created_at", sinceIso);

  const ids = Array.from(new Set((events ?? []).map(e => e.establishment_id).filter(Boolean) as string[]));
  if (ids.length === 0) return [];

  const { data: ests } = await supabase
    .from("establishments")
    .select("id, category")
    .in("id", ids);

  const catByEst: Record<string, string> = {};
  ests?.forEach(e => { catByEst[e.id] = e.category || "Outros"; });

  const map: Record<string, { impressions: number; clicks: number }> = {};
  events?.forEach(e => {
    if (!e.establishment_id) return;
    const cat = catByEst[e.establishment_id] || "Outros";
    if (!map[cat]) map[cat] = { impressions: 0, clicks: 0 };
    if (e.event_type === "impression") map[cat].impressions++;
    if (e.event_type === "click") map[cat].clicks++;
  });

  return Object.entries(map)
    .map(([category, d]) => ({
      category,
      impressions: d.impressions,
      clicks: d.clicks,
      ctr: d.impressions > 0 ? Number(((d.clicks / d.impressions) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.ctr - a.ctr);
}

// ---------- Insights ----------
export async function getFeedInsights(days: number | "all" = 7) {
  const insights: { type: "positive" | "warning" | "info"; message: string }[] = [];

  const weekday = await getEngagementByWeekday(days);
  if (weekday.length > 0) {
    const top = [...weekday].sort((a, b) => b.impressions + b.clicks - (a.impressions + a.clicks))[0];
    if (top.impressions + top.clicks > 0) {
      insights.push({
        type: "info",
        message: `${top.weekday} é o dia da semana com maior engajamento no feed.`,
      });
    }
  }

  const reactions = await getReactionsBreakdown(days);
  if (reactions.length > 0 && reactions[0].count > 0) {
    insights.push({
      type: "positive",
      message: `${reactions[0].emoji} é a reação mais usada (${reactions[0].count} no período, ${reactions[0].pct.toFixed(0)}% do total).`,
    });
  }

  // estabelecimentos sem impressões
  const { sinceIso } = periodRange(days);
  const { data: events } = await supabase
    .from("feed_events")
    .select("establishment_id")
    .eq("event_type", "impression")
    .gte("created_at", sinceIso);
  const seen = new Set((events ?? []).map(e => e.establishment_id).filter(Boolean));
  const { count: totalEst } = await supabase
    .from("establishments")
    .select("*", { count: "exact", head: true });
  if (totalEst && totalEst > seen.size) {
    insights.push({
      type: "warning",
      message: `${totalEst - seen.size} estabelecimento(s) não tiveram nenhuma impressão no período.`,
    });
  }

  return insights.slice(0, 3);
}

// ---------- Routes (kept) ----------
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
