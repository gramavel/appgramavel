import React, { createContext, useContext, useReducer, useMemo, useEffect } from "react";
import { getUserReactions, upsertReaction, removeReaction } from "@/services/reactions";

type State = {
  reactions: Record<string, string[]>;
  loaded: boolean;
};

type Action =
  | { type: "INIT"; reactions: Record<string, string[]> }
  | { type: "SET_REACTION"; postId: string; emoji: string };

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
      dispatch({ type: "SET_REACTION", postId, emoji });

      if (current === emoji) {
        const result = await removeReaction(postId);
        if (result.error) {
          dispatch({ type: "SET_REACTION", postId, emoji }); // revert
          console.error("Failed to remove reaction", result.error);
        }
      } else {
        const result = await upsertReaction(postId, emoji);
        if (result.error) {
          // revert
          if (current) {
            dispatch({ type: "SET_REACTION", postId, emoji: current });
          }
          console.error("Failed to sync reaction", result.error);
        }
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
