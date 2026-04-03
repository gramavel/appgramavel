import React, { createContext, useContext, useReducer, useMemo, useEffect } from "react";
import { safeParse, safeSave } from "@/lib/storage";

type State = {
  // Array preparado para múltiplas reações no futuro.
  // HOJE: apenas index 0 é usado como reação ativa (única por enquanto).
  reactions: Record<string, string[]>;
};

type Action = { type: "SET_REACTION"; postId: string; emoji: string };

function reactionsReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_REACTION": {
      const current = state.reactions[action.postId]?.[0];
      if (current === action.emoji) {
        // Toggle off
        const { [action.postId]: _, ...rest } = state.reactions;
        return { reactions: rest };
      }
      return {
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
  const [state, dispatch] = useReducer(
    reactionsReducer,
    null,
    () => safeParse<State>("reactions", { reactions: {} })
  );

  useEffect(() => {
    const handler = setTimeout(() => safeSave("reactions", state), 300);
    return () => clearTimeout(handler);
  }, [state]);

  const value = useMemo(() => ({
    setReaction: (postId: string, emoji: string) =>
      dispatch({ type: "SET_REACTION", postId, emoji }),
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
