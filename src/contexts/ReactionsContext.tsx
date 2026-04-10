import React, { createContext, useContext, useReducer, useMemo, useEffect } from "react";
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
      const current = state.reactions[action.postId]?.[0];
      if (current === action.emoji) {
        const { [action.postId]: _, ...rest } = state.reactions;
        return { ...state, reactions: rest };
      }
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

  const value = useMemo(() => ({
    setReaction: async (postId: string, emoji: string) => {
      const current = state.reactions[postId]?.[0];
      // Optimistic update
      dispatch({ type: "SET_REACTION", postId, emoji });

      const userId = await getCurrentUserId();
      const { data, error } = await supabase.rpc("upsert_post_reaction", {
        p_post_id: postId,
        p_user_id: userId,
        p_emoji: emoji,
      });

      if (error) {
        // Revert optimistic update
        if (current) {
          dispatch({ type: "SET_REACTION", postId, emoji: current });
        } else {
          dispatch({ type: "REMOVE_REACTION", postId });
        }
        console.error("Reaction error:", error);
        return;
      }

      // If action was 'removed', ensure context reflects removal
      if (data?.action === "removed") {
        dispatch({ type: "REMOVE_REACTION", postId });
      }
    },
    getReaction: (postId: string): string | null =>
      state.reactions[postId]?.[0] ?? null,
  }), [state]);

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
