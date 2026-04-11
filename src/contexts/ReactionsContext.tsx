import React, { createContext, useContext, useReducer, useMemo, useEffect, useRef, useCallback } from "react";
import { getUserReactions } from "@/services/reactions";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserId } from "@/lib/auth";

type State = {
  reactions: Record<string, string[]>;
  loaded: boolean;
};

type Action =
  | { type: "INIT"; reactions: Record<string, string[]> }
  | { type: "SET_REACTION"; postId: string; emoji: string }
  | { type: "REMOVE_REACTION"; postId: string };

function reactionsReducer(state: State, action: Action): State {
  switch (action.type) {
    case "INIT":
      return { reactions: action.reactions, loaded: true };
    case "SET_REACTION": {
      return {
        ...state,
        reactions: {
          ...state.reactions,
          [action.postId]: [action.emoji],
        },
      };
    }
    case "REMOVE_REACTION": {
      const { [action.postId]: _, ...rest } = state.reactions;
      return { ...state, reactions: rest };
    }
    default:
      return state;
  }
}

interface ReactionsContextType {
  setReaction: (postId: string, emoji: string) => void;
  getReaction: (postId: string) => string | null;
}

const ReactionsContext = createContext<ReactionsContextType | null>(null);

export function ReactionsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reactionsReducer, {
    reactions: {},
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

  const setReaction = useCallback(
    async (postId: string, emoji: string) => {
      if (pendingRef.current.has(postId)) return;
      pendingRef.current.add(postId);

      const previousEmoji = state.reactions[postId]?.[0] ?? null;

      // Optimistic update — immediate UI feedback
      if (previousEmoji === emoji) {
        dispatch({ type: "REMOVE_REACTION", postId });
      } else {
        dispatch({ type: "SET_REACTION", postId, emoji });
      }

      try {
        const userId = await getCurrentUserId();
        const { data, error } = await supabase.rpc("upsert_post_reaction", {
          p_post_id: postId,
          p_user_id: userId,
          p_emoji: emoji,
        });

        if (error) {
          // Revert optimistic update
          console.error("Reaction failed, reverting:", error);
          if (previousEmoji) {
            dispatch({ type: "SET_REACTION", postId, emoji: previousEmoji });
          } else {
            dispatch({ type: "REMOVE_REACTION", postId });
          }
          return;
        }

        // If action was 'removed', ensure context reflects removal
        if ((data as any)?.action === "removed") {
          dispatch({ type: "REMOVE_REACTION", postId });
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
  }), [setReaction, getReaction]);

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
