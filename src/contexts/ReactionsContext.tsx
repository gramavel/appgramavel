import React, { createContext, useContext, useReducer, useMemo, useEffect, useRef, useCallback } from "react";
import { getUserReactions } from "@/services/reactions";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserId } from "@/lib/auth";

type State = {
  userReactions: Record<string, string>; // postId -> emoji
  postReactionCounts: Record<string, Array<{ emoji: string, count: number }>>;
  loaded: boolean;
};

type Action =
  | { type: "INIT"; userReactions: Record<string, string> }
  | { type: "SET_COUNTS"; postId: string; counts: Array<{ emoji: string, count: number }> }
  | { type: "OPTIMISTIC_REACT"; postId: string; emoji: string; previousEmoji: string | null }
  | { type: "REVERT_REACT"; postId: string; previousEmoji: string | null; previousCounts: Array<{ emoji: string, count: number }> };

function reactionsReducer(state: State, action: Action): State {
  switch (action.type) {
    case "INIT":
      return { ...state, userReactions: action.userReactions, loaded: true };
    case "SET_COUNTS":
      return {
        ...state,
        postReactionCounts: { ...state.postReactionCounts, [action.postId]: action.counts }
      };
    case "OPTIMISTIC_REACT": {
      const { postId, emoji, previousEmoji } = action;
      const isRemoving = previousEmoji === emoji;
      
      const newCounts = [...(state.postReactionCounts[postId] || [])];
      
      // Decrement old
      if (previousEmoji) {
        const oldIdx = newCounts.findIndex(r => r.emoji === previousEmoji);
        if (oldIdx > -1) {
          newCounts[oldIdx] = { ...newCounts[oldIdx], count: Math.max(0, newCounts[oldIdx].count - 1) };
        }
      }
      
      // Increment new
      if (!isRemoving) {
        const newIdx = newCounts.findIndex(r => r.emoji === emoji);
        if (newIdx > -1) {
          newCounts[newIdx] = { ...newCounts[newIdx], count: newCounts[newIdx].count + 1 };
        } else {
          newCounts.push({ emoji, count: 1 });
        }
      }
      
      const filteredCounts = newCounts.filter(r => r.count > 0);
      const newUserReactions = { ...state.userReactions };
      if (isRemoving) {
        delete newUserReactions[postId];
      } else {
        newUserReactions[postId] = emoji;
      }

      return {
        ...state,
        userReactions: newUserReactions,
        postReactionCounts: { ...state.postReactionCounts, [postId]: filteredCounts }
      };
    }
    case "REVERT_REACT": {
      const newUserReactions = { ...state.userReactions };
      if (action.previousEmoji) {
        newUserReactions[action.postId] = action.previousEmoji;
      } else {
        delete newUserReactions[action.postId];
      }
      return {
        ...state,
        userReactions: newUserReactions,
        postReactionCounts: { ...state.postReactionCounts, [action.postId]: action.previousCounts }
      };
    }
    default:
      return state;
  }
}

interface ReactionsContextType {
  setReaction: (postId: string, emoji: string) => Promise<void>;
  getReaction: (postId: string) => string | null;
  getCounts: (postId: string) => Array<{ emoji: string, count: number }>;
  setInitialCounts: (postId: string, counts: Array<{ emoji: string, count: number }>) => void;
}

const ReactionsContext = createContext<ReactionsContextType | null>(null);

export function ReactionsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reactionsReducer, {
    userReactions: {},
    postReactionCounts: {},
    loaded: false,
  });

  const pendingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      const { data } = await getUserReactions();
      const reactions: Record<string, string> = {};
      data?.forEach((r) => {
        reactions[r.post_id] = r.emoji;
      });
      dispatch({ type: "INIT", userReactions: reactions });
    }
    load();
  }, []);

  const getReaction = useCallback((postId: string) => state.userReactions[postId] ?? null, [state.userReactions]);
  const getCounts = useCallback((postId: string) => state.postReactionCounts[postId] ?? [], [state.postReactionCounts]);
  
  const setInitialCounts = useCallback((postId: string, counts: Array<{ emoji: string, count: number }>) => {
    if (!state.postReactionCounts[postId]) {
      dispatch({ type: "SET_COUNTS", postId, counts });
    }
  }, [state.postReactionCounts]);

  const setReaction = useCallback(
    async (postId: string, emoji: string) => {
      if (pendingRef.current.has(postId)) return;
      pendingRef.current.add(postId);

      const previousEmoji = state.userReactions[postId] ?? null;
      const previousCounts = state.postReactionCounts[postId] ?? [];

      // Optimistic update
      dispatch({ type: "OPTIMISTIC_REACT", postId, emoji, previousEmoji });

      try {
        const userId = await getCurrentUserId();
        const { data, error } = await supabase.rpc("upsert_post_reaction", {
          p_post_id: postId,
          p_user_id: userId,
          p_emoji: emoji,
        });

        if (error) throw error;

        if ((data as any)?.action === "removed") {
          // Double check if we need to sync further
        }
      } catch (err) {
        console.error("Reaction failed, reverting:", err);
        dispatch({ type: "REVERT_REACT", postId, previousEmoji, previousCounts });
      } finally {
        pendingRef.current.delete(postId);
      }
    },
    [state.userReactions, state.postReactionCounts]
  );

  const value = useMemo(() => ({
    setReaction,
    getReaction,
    getCounts,
    setInitialCounts
  }), [setReaction, getReaction, getCounts, setInitialCounts]);

  return (
    <ReactionsContext.Provider value={value}>
      {children}
    </ReactionsContext.Provider>
  );
}

export function useReactions() {
  const ctx = useContext(ReactionsContext);
  if (!ctx) throw new Error("useReactions must be used within ReactionsProvider");
  return ctx;
}
