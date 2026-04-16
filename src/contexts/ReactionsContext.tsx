import React, { createContext, useContext, useReducer, useMemo, useEffect, useRef, useCallback } from "react";
import { getUserReactions } from "@/services/reactions";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserId } from "@/lib/auth";

type State = {
  reactions: Record<string, string[]>;
  // Track count deltas per post per emoji for real-time UI updates
  countDeltas: Record<string, Record<string, number>>;
  loaded: boolean;
};

type Action =
  | { type: "INIT"; reactions: Record<string, string[]> }
  | { type: "SET_REACTION"; postId: string; emoji: string; previousEmoji: string | null }
  | { type: "REMOVE_REACTION"; postId: string; emoji: string };

function reactionsReducer(state: State, action: Action): State {
  switch (action.type) {
    case "INIT":
      return { reactions: action.reactions, countDeltas: {}, loaded: true };
    case "SET_REACTION": {
      const deltas = { ...state.countDeltas };
      const postDeltas = { ...(deltas[action.postId] || {}) };

      // Increment the new emoji
      postDeltas[action.emoji] = (postDeltas[action.emoji] || 0) + 1;

      // Decrement the previous emoji if changing
      if (action.previousEmoji && action.previousEmoji !== action.emoji) {
        postDeltas[action.previousEmoji] = (postDeltas[action.previousEmoji] || 0) - 1;
      }

      deltas[action.postId] = postDeltas;

      return {
        ...state,
        reactions: {
          ...state.reactions,
          [action.postId]: [action.emoji],
        },
        countDeltas: deltas,
      };
    }
    case "REMOVE_REACTION": {
      const { [action.postId]: _, ...rest } = state.reactions;
      const deltas = { ...state.countDeltas };
      const postDeltas = { ...(deltas[action.postId] || {}) };
      postDeltas[action.emoji] = (postDeltas[action.emoji] || 0) - 1;
      deltas[action.postId] = postDeltas;

      return { ...state, reactions: rest, countDeltas: deltas };
    }
    default:
      return state;
  }
}

interface ReactionsContextType {
  setReaction: (postId: string, emoji: string) => void;
  getReaction: (postId: string) => string | null;
  getCountDelta: (postId: string, emoji: string) => number;
}

const ReactionsContext = createContext<ReactionsContextType | null>(null);

export function ReactionsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reactionsReducer, {
    reactions: {},
    countDeltas: {},
    loaded: false,
  });

  const pendingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      const { data } = await getUserReactions();
      const reactions: Record<string, string[]> = {};
      data?.forEach((r) => {
        reactions[r.post_id] = [r.emoji];
      });
      dispatch({ type: "INIT", reactions });
    }
    load();
  }, []);

  const getReaction = useCallback(
    (postId: string): string | null => state.reactions[postId]?.[0] ?? null,
    [state.reactions]
  );

  const getCountDelta = useCallback(
    (postId: string, emoji: string): number => state.countDeltas[postId]?.[emoji] ?? 0,
    [state.countDeltas]
  );

  const setReaction = useCallback(
    async (postId: string, emoji: string) => {
      if (pendingRef.current.has(postId)) return;
      pendingRef.current.add(postId);

      const previousEmoji = state.reactions[postId]?.[0] ?? null;

      // Optimistic update with count deltas
      if (previousEmoji === emoji) {
        dispatch({ type: "REMOVE_REACTION", postId, emoji });
      } else {
        dispatch({ type: "SET_REACTION", postId, emoji, previousEmoji });
      }

      try {
        const userId = await getCurrentUserId();
        const { data, error } = await supabase.rpc("upsert_post_reaction", {
          p_post_id: postId,
          p_user_id: userId,
          p_emoji: emoji,
        });

        if (error) {
          console.error("Reaction failed, reverting:", error);
          // Revert: undo the delta
          if (previousEmoji === emoji) {
            dispatch({ type: "SET_REACTION", postId, emoji, previousEmoji: null });
          } else if (previousEmoji) {
            dispatch({ type: "SET_REACTION", postId, emoji: previousEmoji, previousEmoji: emoji });
          } else {
            dispatch({ type: "REMOVE_REACTION", postId, emoji });
          }
        }
      } finally {
        pendingRef.current.delete(postId);
      }
    },
    [state.reactions]
  );

  const value = useMemo(() => ({
    setReaction,
    getReaction,
    getCountDelta,
  }), [setReaction, getReaction, getCountDelta]);

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
