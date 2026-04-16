import React, { createContext, useContext, useReducer, useMemo, useEffect, useCallback } from "react";
import { 
  getFavorites, 
  getFavoriteFolders, 
  addFavorite, 
  removeFavorite, 
  getSavedPosts, 
  addSavedPost, 
  removeSavedPost,
  saveFavoriteToFolder,
  createFavoriteFolder,
  deleteFavoriteFolder
} from "@/services/favorites";

type Favorite = {
  establishment_id: string;
  folder_id: string | null;
};

type Folder = {
  id: string;
  name: string;
  created_at: string;
};

type State = { 
  favorites: Favorite[]; 
  folders: Folder[];
  savedPosts: string[]; 
  loaded: boolean 
};

type Action =
  | { type: "INIT"; favorites: Favorite[]; folders: Folder[]; savedPosts: string[] }
  | { type: "TOGGLE_PLACE"; id: string; folderId?: string | null }
  | { type: "SET_FOLDERS"; folders: Folder[] }
  | { type: "TOGGLE_POST"; id: string };

function favoritesReducer(state: State, action: Action): State {
  switch (action.type) {
    case "INIT":
      return { 
        favorites: action.favorites, 
        folders: action.folders,
        savedPosts: action.savedPosts, 
        loaded: true 
      };
    case "SET_FOLDERS":
      return { ...state, folders: action.folders };
    case "TOGGLE_PLACE": {
      const exists = state.favorites.some(f => f.establishment_id === action.id);
      return {
        ...state,
        favorites: exists
          ? state.favorites.filter((f) => f.establishment_id !== action.id)
          : [...state.favorites, { establishment_id: action.id, folder_id: action.folderId ?? null }],
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
  favorites: Favorite[];
  folders: Folder[];
  savedPosts: string[];
  toggleSavedPlace: (id: string, folderId?: string | null) => Promise<void>;
  saveToFolder: (id: string, folderId: string | null, newName?: string) => Promise<void>;
  createFolder: (name: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  toggleSavedPost: (id: string) => void;
  isPlaceSaved: (id: string) => boolean;
  isPostSaved: (id: string) => boolean;
  refreshFavorites: () => Promise<void>;
  loaded: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(favoritesReducer, {
    favorites: [],
    folders: [],
    savedPosts: [],
    loaded: false,
  });

  const load = useCallback(async () => {
    const [{ data: favorites }, { data: folders }, { data: posts }] = await Promise.all([
      getFavorites(),
      getFavoriteFolders(),
      getSavedPosts(),
    ]);
    dispatch({
      type: "INIT",
      favorites: favorites || [],
      folders: folders || [],
      savedPosts: posts?.map((p) => p.post_id) ?? [],
    });
  }, []);

  useEffect(() => {
    load();
    
    // Listen for custom events from other components
    const handleChanged = () => load();
    window.addEventListener('favorites:changed', handleChanged);
    return () => window.removeEventListener('favorites:changed', handleChanged);
  }, [load]);

  const toggleSavedPlace = useCallback(async (id: string, folderId: string | null = null) => {
    const wasSaved = state.favorites.some(f => f.establishment_id === id);
    dispatch({ type: "TOGGLE_PLACE", id, folderId });
    const result = wasSaved ? await removeFavorite(id) : await addFavorite(id, folderId);
    if (result.error) {
      dispatch({ type: "TOGGLE_PLACE", id, folderId }); // revert
      console.error("Failed to sync favorite", result.error);
    }
  }, [state.favorites]);

  const saveToFolder = useCallback(async (id: string, folderId: string | null, newName?: string) => {
    const { error } = await saveFavoriteToFolder(id, folderId, newName);
    if (!error) {
      await load();
    } else {
      console.error("Failed to save to folder", error);
    }
  }, [load]);

  const createFolder = useCallback(async (name: string) => {
    const { error } = await createFavoriteFolder(name);
    if (!error) await load();
  }, [load]);

  const deleteFolder = useCallback(async (id: string) => {
    const { error } = await deleteFavoriteFolder(id);
    if (!error) await load();
  }, [load]);

  const toggleSavedPost = useCallback(async (id: string) => {
    const exists = state.savedPosts.includes(id);
    dispatch({ type: "TOGGLE_POST", id });
    const result = exists ? await removeSavedPost(id) : await addSavedPost(id);
    if (result.error) {
      dispatch({ type: "TOGGLE_POST", id }); // revert
    }
  }, [state.savedPosts]);

  const isPlaceSaved = useCallback((id: string) => state.favorites.some(f => f.establishment_id === id), [state.favorites]);
  const isPostSaved = useCallback((id: string) => state.savedPosts.includes(id), [state.savedPosts]);

  const value = useMemo(() => ({
    favorites: state.favorites,
    folders: state.folders,
    savedPosts: state.savedPosts,
    loaded: state.loaded,
    toggleSavedPlace,
    saveToFolder,
    createFolder,
    deleteFolder,
    toggleSavedPost,
    isPlaceSaved,
    isPostSaved,
    refreshFavorites: load
  }), [state.favorites, state.folders, state.savedPosts, state.loaded, toggleSavedPlace, saveToFolder, createFolder, deleteFolder, toggleSavedPost, isPlaceSaved, isPostSaved, load]);

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
