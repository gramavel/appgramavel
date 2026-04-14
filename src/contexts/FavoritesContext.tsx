import React, { createContext, useContext, useReducer, useMemo, useEffect, useCallback } from "react";
import { getFavorites, addFavorite, removeFavorite, getSavedPosts, addSavedPost, removeSavedPost } from "@/services/favorites";

type State = { savedPlaces: string[]; savedPosts: string[]; loaded: boolean };

type Action =
  | { type: "INIT"; savedPlaces: string[]; savedPosts: string[] }
  | { type: "TOGGLE_PLACE"; id: string }
  | { type: "TOGGLE_POST"; id: string };

function favoritesReducer(state: State, action: Action): State {
  switch (action.type) {
    case "INIT":
      return { savedPlaces: action.savedPlaces, savedPosts: action.savedPosts, loaded: true };
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
  loaded: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(favoritesReducer, {
    savedPlaces: [],
    savedPosts: [],
    loaded: false,
  });

  const savedPlacesSet = useMemo(() => new Set(state.savedPlaces), [state.savedPlaces]);
  const savedPostsSet = useMemo(() => new Set(state.savedPosts), [state.savedPosts]);

  useEffect(() => {
    async function load() {
      const [{ data: places }, { data: posts }] = await Promise.all([
        getFavorites(),
        getSavedPosts(),
      ]);
      dispatch({
        type: "INIT",
        savedPlaces: places?.map((p) => p.establishment_id) ?? [],
        savedPosts: posts?.map((p) => p.post_id) ?? [],
      });
    }
    load();
  }, []);

  const toggleSavedPlace = useCallback(async (id: string) => {
    const wasSaved = savedPlacesSet.has(id);
    dispatch({ type: "TOGGLE_PLACE", id });
    const result = wasSaved ? await removeFavorite(id) : await addFavorite(id);
    if (result.error) {
      dispatch({ type: "TOGGLE_PLACE", id }); // revert
      console.error("Failed to sync favorite", result.error);
    }
  }, [savedPlacesSet]);

  const toggleSavedPost = useCallback(async (id: string) => {
    const wasSaved = savedPostsSet.has(id);
    dispatch({ type: "TOGGLE_POST", id });
    const result = wasSaved ? await removeSavedPost(id) : await addSavedPost(id);
    if (result.error) {
      dispatch({ type: "TOGGLE_POST", id }); // revert
      console.error("Failed to sync saved post", result.error);
    }
  }, [savedPostsSet]);

  const isPlaceSaved = useCallback((id: string) => savedPlacesSet.has(id), [savedPlacesSet]);
  const isPostSaved = useCallback((id: string) => savedPostsSet.has(id), [savedPostsSet]);

  const value = useMemo(() => ({
    savedPlaces: state.savedPlaces,
    savedPosts: state.savedPosts,
    loaded: state.loaded,
    toggleSavedPlace,
    toggleSavedPost,
    isPlaceSaved,
    isPostSaved,
  }), [state.savedPlaces, state.savedPosts, state.loaded, toggleSavedPlace, toggleSavedPost, isPlaceSaved, isPostSaved]);

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
