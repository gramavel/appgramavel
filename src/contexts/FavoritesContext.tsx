import React, { createContext, useContext, useReducer, useMemo, useEffect, useCallback } from "react";
import { safeParse, safeSave } from "@/lib/storage";

type State = { savedPlaces: string[]; savedPosts: string[] };

type Action =
  | { type: "TOGGLE_PLACE"; id: string }
  | { type: "TOGGLE_POST"; id: string };

function favoritesReducer(state: State, action: Action): State {
  switch (action.type) {
    case "TOGGLE_PLACE": {
      const exists = state.savedPlaces.includes(action.id);
      return {
        ...state,
        savedPlaces: exists
          ? state.savedPlaces.filter((i) => i !== action.id)
          : [...state.savedPlaces, action.id],
      };
    }
    case "TOGGLE_POST": {
      const exists = state.savedPosts.includes(action.id);
      return {
        ...state,
        savedPosts: exists
          ? state.savedPosts.filter((i) => i !== action.id)
          : [...state.savedPosts, action.id],
      };
    }
    default:
      return state;
  }
}

interface FavoritesContextType {
  savedPlaces: string[];
  savedPosts: string[];
  toggleSavedPlace: (id: string) => void;
  toggleSavedPost: (id: string) => void;
  isPlaceSaved: (id: string) => boolean;
  isPostSaved: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(
    favoritesReducer,
    null,
    () => safeParse<State>("favorites", { savedPlaces: [], savedPosts: [] })
  );

  const savedPlacesSet = useMemo(() => new Set(state.savedPlaces), [state.savedPlaces]);
  const savedPostsSet = useMemo(() => new Set(state.savedPosts), [state.savedPosts]);

  useEffect(() => {
    const handler = setTimeout(() => safeSave("favorites", state), 300);
    return () => clearTimeout(handler);
  }, [state]);

  const value = useMemo(() => ({
    savedPlaces: state.savedPlaces,
    savedPosts: state.savedPosts,
    toggleSavedPlace: (id: string) => dispatch({ type: "TOGGLE_PLACE", id }),
    toggleSavedPost: (id: string) => dispatch({ type: "TOGGLE_POST", id }),
    isPlaceSaved: (id: string) => savedPlacesSet.has(id),
    isPostSaved: (id: string) => savedPostsSet.has(id),
  }), [state, savedPlacesSet, savedPostsSet]);

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
